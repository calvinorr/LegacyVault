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

// Connect to MongoDB using helper
db.connect().then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err.message);
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

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  const indexPath = process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '..', 'web', 'dist', 'index.html')
    : path.join(__dirname, '..', 'public', 'index.html');
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('JWT authentication enabled');
});
