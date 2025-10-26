// src/server.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const path = require('path');
const db = require('./db');
const { configurePassport, router: authRouter } = require('./auth/google');
const { authenticateToken, optionalAuth } = require('./middleware/jwtAuth');
const usersRouter = require('./routes/users');
const entriesRouter = require('./routes/entries');
const importRouter = require('./routes/import');
const detectionRulesRouter = require('./routes/detectionRules');
const categoriesRouter = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      styleSrcElem: ["'self'", "https://fonts.googleapis.com"], // Required for <link> tags to external stylesheets
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

// In production, also allow any *.vercel.app subdomain
if (process.env.NODE_ENV === 'production') {
  console.log('Production CORS - Allowed origins:', allowedOrigins);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl requests, or same-origin)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In production, also allow any Vercel deployment URL
    if (process.env.NODE_ENV === 'production' && origin.includes('.vercel.app')) {
      console.log(`✅ Allowing Vercel deployment origin: ${origin}`);
      return callback(null, true);
    }

    console.warn(`⚠️  Blocked CORS request from unauthorized origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['set-cookie']
}));

app.use(express.json());

// Cookie parser for JWT tokens
app.use(cookieParser());

// Configure Passport for Google OAuth (JWT version)
configurePassport();
app.use(passport.initialize());
// No passport.session() needed for JWT

// Middleware to ensure MongoDB connection is ready (critical for serverless)
app.use(async (req, res, next) => {
  try {
    await db.connect();
    next();
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);

    // Return JSON error for API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
      return res.status(503).json({
        error: 'Database connection unavailable',
        message: 'Please try again in a moment'
      });
    }

    // For other routes, pass to error handler
    next(err);
  }
});

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes (Google OAuth + JWT endpoints)
app.use('/auth', authRouter);

// Protected API routes with JWT authentication
app.use('/api/users', authenticateToken, usersRouter);
app.use('/api/entries', authenticateToken, entriesRouter);
app.use('/api/import', authenticateToken, importRouter);
app.use('/api/detection-rules', authenticateToken, detectionRulesRouter);

// Categories API - use optional auth for backward compatibility
app.use('/api/categories', optionalAuth, categoriesRouter);

// Login page (for failed auth)
app.get('/login', (req, res) => {
  res.send('Login failed. <a href="/auth/google">Try again</a>');
});

// Dashboard endpoint (protected)
app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Welcome to Household Finance Vault', 
    user: {
      id: req.userId,
      email: req.userEmail
    }
  });
});

// Serve static files from React build (production) or public (development)
const staticPath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '..', 'web', 'dist')
  : path.join(__dirname, '..', 'public');

app.use(express.static(staticPath));

// Global error handling middleware (MUST be before catch-all route)
app.use((err, req, res, next) => {
  console.error('Express error handler:', err);

  // If headers already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Always return JSON for API routes to prevent HTML error pages
  if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
    return res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
      status: err.status || 500
    });
  }

  // For non-API routes, send a generic error response
  res.status(500).send('Server error');
});

// Serve React app ONLY for non-API routes (prevents HTML for failed API calls)
app.get('*', (req, res, next) => {
  // Don't serve HTML for API routes that weren't matched
  if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
    return res.status(404).json({
      error: 'Not found',
      path: req.path
    });
  }

  const indexPath = process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '..', 'web', 'dist', 'index.html')
    : path.join(__dirname, '..', 'public', 'index.html');
  res.sendFile(indexPath);
});

// Export app for Vercel serverless
module.exports = app;

// Only start server if running directly (not imported by Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('JWT authentication enabled');
  });
}
