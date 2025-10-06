// src/server.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const passport = require('passport');
const cookieSession = require('cookie-session');
const path = require('path');
const db = require('./db');
const { initGridFS } = require('./db/gridfs');
const { configurePassport, router: authRouter } = require('./auth/google');
const usersRouter = require('./routes/users');
const importRouter = require('./routes/import');
const detectionRulesRouter = require('./routes/detectionRules');
const productDetectionRouter = require('./routes/productDetection');
const renewalRemindersRouter = require('./routes/renewalReminders');
const renewalsRouter = require('./routes/renewals');
const domainsRouter = require('./routes/domains');
const domainDocumentsRouter = require('./routes/domain-documents');
const emergencyRouter = require('./routes/emergency');
const recordTypesRouter = require('./routes/recordTypes');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || true,
  credentials: true,
}));
app.use(express.json());

// Cookie session (simple session for OAuth)
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'replace-me'],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}));

// Compatibility shim for Passport when using cookie-session:
// passport expects req.session.regenerate to exist (provided by express-session).
// cookie-session doesn't implement regenerate; provide a no-op regenerate to
// keep Passport happy in this simple dev scaffold. For production consider
// switching to `express-session` with a proper store.
app.use((req, res, next) => {
  try {
    if (req && req.session) {
      if (typeof req.session.regenerate !== 'function') {
        req.session.regenerate = function(cb) {
          // cookie-session stores session in cookie; regenerating is a no-op here.
          if (typeof cb === 'function') cb();
        };
      }
      if (typeof req.session.save !== 'function') {
        // passport may call req.session.save; provide a no-op for compatibility.
        req.session.save = function(cb) {
          if (typeof cb === 'function') cb();
        };
      }
    }
  } catch (err) {
    // Do not block the request if session is unavailable
  }
  next();
});

// Configure Passport (from src/auth/google)
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB using helper
db.connect().then(() => {
  console.log('MongoDB connected');
  initGridFS();
}).catch((err) => {
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

// Auth routes (mounted from src/auth/google)
app.use('/auth', authRouter);

// User management API (admin + self)
app.use('/api/users', usersRouter);

// Bank Import API (Story 2.3 - PRESERVED for migration)
app.use('/api/import', importRouter);

// Detection Rules API
app.use('/api/detection-rules', detectionRulesRouter);

// Product Detection API
app.use('/api/product-detection', productDetectionRouter);

// Renewal Reminders API
app.use('/api/renewal-reminders', renewalRemindersRouter);

// Renewals API (Story 1.8 - Enhanced Renewal Dashboard)
app.use('/api/renewals', renewalsRouter);

// Domain Records API (Story 1.1 - Foundation)
app.use('/api/domains', domainsRouter);

// Domain Documents API (Story 1.2 - GridFS Storage)
app.use('/api/domains', domainDocumentsRouter); // For upload/list endpoints
app.use('/api/domain-documents', domainDocumentsRouter); // For download/delete endpoints

// Emergency API (Story 1.9 - Emergency View)
app.use('/api/emergency', emergencyRouter);

// Record Types API (Story 3.1 - Record Type Management)
app.use('/api/record-types', recordTypesRouter);

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

// Static files / simple frontend placeholder
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});