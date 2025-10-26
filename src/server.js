// src/server.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const path = require('path');
const db = require('./db');
const { initGridFS } = require('./db/gridfs');
const { configurePassport, router: authRouter } = require('./auth/google');
const { authenticateToken, optionalAuth } = require('./middleware/jwtAuth');

// Epic-5 route imports
const usersRouter = require('./routes/users');
const importRouter = require('./routes/import');
const transactionsRouter = require('./routes/transactions');
const patternsRouter = require('./routes/patterns');
const detectionRulesRouter = require('./routes/detectionRules');
const productDetectionRouter = require('./routes/productDetection');
const renewalRemindersRouter = require('./routes/renewalReminders');
const renewalsRouter = require('./routes/renewals');
const domainsRouter = require('./routes/domains');
const domainDocumentsRouter = require('./routes/domain-documents');
const emergencyRouter = require('./routes/emergency');
const recordTypesRouter = require('./routes/recordTypes');
const parentEntityRouter = require('./routes/parentEntity');
const childRecordRouter = require('./routes/childRecord');
const domainConfigRouter = require('./routes/admin/domainConfig');
const systemStatusRouter = require('./routes/admin/systemStatus');
const categoriesRouter = require('./legacy/routes/categories');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      styleSrcElem: ["'self'", "https://fonts.googleapis.com"],
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

if (process.env.NODE_ENV === 'production') {
  console.log('Production CORS - Allowed origins:', allowedOrigins);
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
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
app.use(cookieParser());

// Configure Passport for Google OAuth (JWT version)
configurePassport();
app.use(passport.initialize());

// Middleware to ensure MongoDB connection is ready (critical for serverless)
app.use(async (req, res, next) => {
  try {
    await db.connect();
    // Initialize GridFS after connection
    if (!global.gridfsInitialized) {
      initGridFS();
      global.gridfsInitialized = true;
    }
    next();
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
      return res.status(503).json({
        error: 'Database connection unavailable',
        message: 'Please try again in a moment'
      });
    }
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
app.use('/api/import', authenticateToken, importRouter);
app.use('/api/transactions', authenticateToken, transactionsRouter);
app.use('/api/patterns', authenticateToken, patternsRouter);
app.use('/api/detection-rules', authenticateToken, detectionRulesRouter);
app.use('/api/product-detection', authenticateToken, productDetectionRouter);
app.use('/api/renewal-reminders', authenticateToken, renewalRemindersRouter);
app.use('/api/renewals', authenticateToken, renewalsRouter);
app.use('/api/domains', authenticateToken, domainsRouter);
app.use('/api/domains', authenticateToken, domainDocumentsRouter);
app.use('/api/domain-documents', authenticateToken, domainDocumentsRouter);
app.use('/api/emergency', authenticateToken, emergencyRouter);
app.use('/api/record-types', authenticateToken, recordTypesRouter);
app.use('/api/v2', authenticateToken, parentEntityRouter);
app.use('/api/v2', authenticateToken, childRecordRouter);
app.use('/api/admin', authenticateToken, domainConfigRouter);
app.use('/api/admin', authenticateToken, systemStatusRouter);
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
