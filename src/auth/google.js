// src/auth/google.js
// Google OAuth helper with JWT authentication instead of sessions

const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { generateAccessToken, generateRefreshToken, setTokenCookie, clearAuthCookies } = require('../utils/jwt');

const router = express.Router();

// Configure Passport strategy for JWT (no sessions)
function configurePassport() {
  if (passport._strategy && passport._strategy('google')) {
    // strategy already configured
    return;
  }

  const User = require('../models/user');

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID?.trim() || 'GOOGLE_CLIENT_ID',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() || 'GOOGLE_CLIENT_SECRET',
    callbackURL: process.env.GOOGLE_CALLBACK_URL?.trim() || '/auth/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = (profile.emails && profile.emails[0] && profile.emails[0].value) || null;

      // Find existing user or create new one
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        // Check if this is the first user - make them admin and approved
        const userCount = await User.countDocuments();
        const isFirstUser = userCount === 0;
        
        user = await User.create({
          googleId: profile.id,
          displayName: profile.displayName,
          email,
          metadata: profile._json || {},
          role: isFirstUser ? 'admin' : 'user',
          approved: isFirstUser ? true : false, // First user auto-approved, others need approval
        });
      } else {
        // Update basic profile info
        user.displayName = profile.displayName;
        user.email = email;
        user.metadata = profile._json || user.metadata;
        await user.save();
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  // For JWT, we don't use sessions, so these are no-ops
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    done(null, { _id: id });
  });
}

// Auth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false // Disable session for JWT
  }));

// Modified callback to issue JWT tokens instead of creating session
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false // Disable session for JWT
  }),
  (req, res) => {
    // DEBUG: Log OAuth callback
    console.log('=== OAuth Callback Triggered ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
    console.log('COOKIE_DOMAIN:', process.env.COOKIE_DOMAIN);
    console.log('Host header:', req.headers.host);
    console.log('User:', req.user ? req.user.email : 'No user');

    // Check if user is approved
    if (!req.user.approved) {
      // User exists but not approved - redirect with message
      const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
      console.log('User not approved, redirecting to:', frontend);
      return res.redirect(`${frontend}?message=pending-approval`);
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken(req.user);
    const refreshToken = generateRefreshToken(req.user);

    console.log('Tokens generated successfully');
    console.log('Access token length:', accessToken.length);
    console.log('Refresh token length:', refreshToken.length);

    // Set tokens in httpOnly cookies
    setTokenCookie(res, 'accessToken', accessToken, false);
    setTokenCookie(res, 'refreshToken', refreshToken, true);

    console.log('Cookies set, redirecting to frontend');

    // Redirect to the frontend dashboard
    const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
    console.log('Redirecting to:', frontend);
    res.redirect(frontend);
  });

// Debug route to check cookie status
router.get('/debug-cookies', (req, res) => {
  console.log('=== Debug Cookies ===');
  console.log('All cookies:', req.cookies);
  console.log('Access token present:', !!req.cookies.accessToken);
  console.log('Refresh token present:', !!req.cookies.refreshToken);
  console.log('Host:', req.headers.host);
  console.log('Environment:', process.env.NODE_ENV);

  res.json({
    cookies: Object.keys(req.cookies || {}),
    hasAccessToken: !!req.cookies?.accessToken,
    hasRefreshToken: !!req.cookies?.refreshToken,
    host: req.headers.host,
    environment: process.env.NODE_ENV
  });
});

// Logout route - clear JWT cookies
router.get('/logout', (req, res) => {
  // Clear JWT cookies
  clearAuthCookies(res);

  // Redirect to home
  const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(frontend);
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { authenticateRefreshToken } = require('../middleware/jwtAuth');
    
    // Manually call the middleware
    authenticateRefreshToken(req, res, async () => {
      try {
        // Load user from database
        const User = require('../models/user');
        const user = await User.findById(req.userId);
        
        if (!user || !user.approved) {
          clearAuthCookies(res);
          return res.status(401).json({ error: 'User not found or not approved' });
        }
        
        // Generate new tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        
        // Set new tokens in cookies
        setTokenCookie(res, 'accessToken', accessToken, false);
        setTokenCookie(res, 'refreshToken', refreshToken, true);
        
        res.json({ 
          success: true,
          user: {
            id: user._id,
            email: user.email,
            displayName: user.displayName,
            role: user.role
          }
        });
      } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({ error: 'Failed to refresh token' });
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Check auth status endpoint
router.get('/status', async (req, res) => {
  try {
    const { authenticateToken } = require('../middleware/jwtAuth');
    
    // Manually call the middleware
    authenticateToken(req, res, () => {
      if (req.user) {
        res.json({
          authenticated: true,
          user: {
            id: req.user._id,
            email: req.user.email,
            displayName: req.user.displayName,
            role: req.user.role
          }
        });
      } else {
        res.json({ authenticated: false });
      }
    });
  } catch (error) {
    res.json({ authenticated: false });
  }
});

module.exports = {
  configurePassport,
  router,
};
