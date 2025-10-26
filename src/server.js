// src/server.js
require('dotenv').config();

// Validate environment variables before starting server
const { validateEnvironment } = require('./utils/validateEnv');
validateEnvironment();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const db = require('./db');
const { initGridFS } = require('./db/gridfs');
const { configurePassport, router: authRouter } = require('./auth/google');
const usersRouter = require('./routes/users');
const importRouter = require('./routes/import');
const transactionsRouter = require('./routes/transactions'); // Epic 5
const patternsRouter = require('./routes/patterns'); // Epic 5 - Story 5.4
const detectionRulesRouter = require('./routes/detectionRules');
const productDetectionRouter = require('./routes/productDetection');
const renewalRemindersRouter = require('./routes/renewalReminders');
const renewalsRouter = require('./routes/renewals');
const domainsRouter = require('./routes/domains');
const domainDocumentsRouter = require('./routes/domain-documents');
const emergencyRouter = require('./routes/emergency');
const recordTypesRouter = require('./routes/recordTypes');
const parentEntityRouter = require('./routes/parentEntity'); // Epic 6 - Story 1.2
const childRecordRouter = require('./routes/childRecord'); // Epic 6 - Story 1.3
const domainConfigRouter = require('./routes/admin/domainConfig'); // Epic 6 - Story 1.4
const systemStatusRouter = require('./routes/admin/systemStatus'); // Epic 6 - Story 1.9
const categoriesRouter = require('./legacy/routes/categories'); // Legacy categories for frontend

// Rate limiting middleware
const { authLimiter, apiLimiter, uploadLimiter, generalLimiter } = require('./middleware/rateLimiter');

// Logging
const { logger, httpLoggerMiddleware } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// HTTP request logging (before other middleware)
app.use(httpLoggerMiddleware);

// Apply global rate limiter to all requests (generous limits)
app.use(generalLimiter);

// Enhanced security middleware with stricter configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Required for inline styles
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
}));

// CORS configuration - strict in production
const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  Blocked CORS request from unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Express session with MongoDB store (production-ready)
// Note: SESSION_SECRET is validated on startup - no fallback for security
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 24 * 60 * 60 // 1 day in seconds
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    sameSite: 'lax' // CSRF protection
  }
}));

// Configure Passport (from src/auth/google)
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB using helper
db.connect().then(() => {
  logger.info('MongoDB connected successfully');
  console.log('MongoDB connected');
  initGridFS();
}).catch((err) => {
  logger.error('MongoDB connection error', { error: err.message, stack: err.stack });
  console.error('MongoDB connection error:', err.message);
});

// Simple auth check middleware
function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes with strict rate limiting (prevents brute force attacks)
app.use('/auth', authLimiter, authRouter);

// API routes with rate limiting
// User management API (admin + self)
app.use('/api/users', apiLimiter, usersRouter);

// Bank Import API with upload rate limiting (Story 2.3 - PRESERVED for migration)
app.use('/api/import', uploadLimiter, importRouter);

// Transactions API (Epic 5 - Transaction Ledger)
app.use('/api/transactions', apiLimiter, transactionsRouter);

// Patterns API (Epic 5 - Pattern Intelligence)
app.use('/api/patterns', apiLimiter, patternsRouter);

// Detection Rules API
app.use('/api/detection-rules', apiLimiter, detectionRulesRouter);

// Product Detection API
app.use('/api/product-detection', apiLimiter, productDetectionRouter);

// Renewal Reminders API
app.use('/api/renewal-reminders', apiLimiter, renewalRemindersRouter);

// Renewals API (Story 1.8 - Enhanced Renewal Dashboard)
app.use('/api/renewals', apiLimiter, renewalsRouter);

// Domain Records API (Story 1.1 - Foundation)
app.use('/api/domains', apiLimiter, domainsRouter);

// Domain Documents API with upload rate limiting (Story 1.2 - GridFS Storage)
app.use('/api/domains', uploadLimiter, domainDocumentsRouter); // For upload/list endpoints
app.use('/api/domain-documents', uploadLimiter, domainDocumentsRouter); // For download/delete endpoints

// Emergency API (Story 1.9 - Emergency View)
app.use('/api/emergency', apiLimiter, emergencyRouter);

// Record Types API (Story 3.1 - Record Type Management)
app.use('/api/record-types', apiLimiter, recordTypesRouter);

// Parent Entity API v2 (Epic 6 - Story 1.2 - Hierarchical Domain Model)
app.use('/api/v2', apiLimiter, parentEntityRouter);

// Child Record API v2 (Epic 6 - Story 1.3 - Child Record Management)
app.use('/api/v2', apiLimiter, childRecordRouter);

// Admin API (Epic 6)
app.use('/api/admin', apiLimiter, domainConfigRouter); // Story 1.4 - Admin Domain Configuration
app.use('/api/admin', apiLimiter, systemStatusRouter); // Story 1.9 - System Status & Health

// Legacy Categories API (for frontend CategoriesProvider)
app.use('/api/categories', apiLimiter, categoriesRouter);

app.get('/login', (req, res) => {
  res.send('Login failed.'); // placeholder
});

app.get('/logout', (req, res) => {
  req.logout(() => {});
  req.session = null;
  res.redirect('/');
});

app.get('/dashboard', requireAuth, (req, res) => {
  // Placeholder dashboard response
  res.json({ message: 'Welcome to Household Finance Vault', user: req.user });
});

// Serve static files from React build (production) or public (development)
const staticPath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '..', 'web', 'dist')
  : path.join(__dirname, '..', 'public');

app.use(express.static(staticPath));

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  const indexPath = process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '..', 'web', 'dist', 'index.html')
    : path.join(__dirname, '..', 'public', 'index.html');
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
  console.log(`Server listening on port ${PORT}`);
});