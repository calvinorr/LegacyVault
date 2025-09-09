// src/auth/google.js
// Google OAuth helper: configures Passport strategy and exports an Express router.
// Replace the in-memory user handling with DB persistence (see src/models/user.js).

const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const router = express.Router();

// Configure Passport strategy. Call this once during app startup.
function configurePassport() {
  if (passport._strategy && passport._strategy('google')) {
    // strategy already configured
    return;
  }

  const User = require('../models/user');

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
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

  // Serialize only the DB id into the session to keep session small
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Deserialize by fetching user from DB
  passport.deserializeUser(async (id, done) => {
    try {
      const User = require('../models/user');
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

}

// Auth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    if (!req.user.approved) {
      // User exists but not approved - redirect with message
      const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontend}?message=pending-approval`);
    }
    
    // Redirect to the frontend dashboard
    const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(frontend);
  });

router.get('/logout', (req, res, next) => {
  // Passport 0.6 requires a callback for logout
  req.logout(function(err) {
    if (err) { return next(err); }
    req.session = null;
    res.redirect('/');
  });
});

module.exports = {
  configurePassport,
  router,
};