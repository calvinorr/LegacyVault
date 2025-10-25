// src/utils/logger.js
// Winston logger configuration for security and application logging

const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist (handled by winston transports)
const logsDir = path.join(__dirname, '../../logs');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development (more readable)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create the main logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write errors to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Security event logger (separate file for audit trail)
const securityLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      maxsize: 10485760, // 10MB (security logs are important)
      maxFiles: 10
    })
  ]
});

// Add console in development for security events too
if (process.env.NODE_ENV !== 'production') {
  securityLogger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

/**
 * Log security events (authentication, authorization, suspicious activity)
 * @param {string} event - Event type (e.g., 'login', 'logout', 'auth_failure')
 * @param {Object} details - Event details
 */
function logSecurityEvent(event, details = {}) {
  securityLogger.info(event, {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
}

/**
 * Log authentication events
 */
const authLogger = {
  loginSuccess: (user, req) => {
    logSecurityEvent('auth:login_success', {
      userId: user._id || user.id,
      userEmail: user.email,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent')
    });
  },

  loginFailure: (email, reason, req) => {
    logSecurityEvent('auth:login_failure', {
      email,
      reason,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent')
    });
  },

  logout: (user, req) => {
    logSecurityEvent('auth:logout', {
      userId: user._id || user.id,
      userEmail: user.email,
      ip: req.ip || req.connection?.remoteAddress
    });
  },

  accessDenied: (user, resource, req) => {
    logSecurityEvent('auth:access_denied', {
      userId: user?._id || 'anonymous',
      userEmail: user?.email,
      resource,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent')
    });
  },

  rateLimitExceeded: (req, endpoint) => {
    logSecurityEvent('security:rate_limit_exceeded', {
      endpoint,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent'),
      severity: 'warning'
    });
  }
};

/**
 * Log admin actions for audit trail
 */
const adminLogger = {
  userApproved: (adminUser, targetUser) => {
    logSecurityEvent('admin:user_approved', {
      adminId: adminUser._id,
      adminEmail: adminUser.email,
      targetUserId: targetUser._id,
      targetUserEmail: targetUser.email
    });
  },

  userRoleChanged: (adminUser, targetUser, oldRole, newRole) => {
    logSecurityEvent('admin:role_changed', {
      adminId: adminUser._id,
      adminEmail: adminUser.email,
      targetUserId: targetUser._id,
      targetUserEmail: targetUser.email,
      oldRole,
      newRole
    });
  },

  configurationChanged: (adminUser, configType, changes) => {
    logSecurityEvent('admin:config_changed', {
      adminId: adminUser._id,
      adminEmail: adminUser.email,
      configType,
      changes
    });
  }
};

/**
 * Middleware to log HTTP requests
 */
function httpLoggerMiddleware(req, res, next) {
  const start = Date.now();

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection?.remoteAddress,
      userId: req.user?._id,
      userEmail: req.user?.email
    };

    // Log level based on status code
    if (res.statusCode >= 500) {
      logger.error('HTTP Request', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
}

module.exports = {
  logger,
  securityLogger,
  logSecurityEvent,
  authLogger,
  adminLogger,
  httpLoggerMiddleware
};
