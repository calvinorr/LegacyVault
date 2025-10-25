// src/utils/validateEnv.js
// Environment variable validation - ensures all required secrets are present
// Fails fast on startup if any required variables are missing or invalid

/**
 * Validates that all required environment variables are present and valid
 * @throws {Error} If any required environment variable is missing or invalid
 */
function validateEnvironment() {
  const requiredVars = [
    'SESSION_SECRET',
    'MONGO_URI',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CALLBACK_URL'
  ];

  const missing = [];
  const invalid = [];

  // Check for missing variables
  requiredVars.forEach(varName => {
    const value = process.env[varName];

    if (!value) {
      missing.push(varName);
      return;
    }

    // Validate specific formats
    switch (varName) {
      case 'SESSION_SECRET':
        // Must be at least 32 characters for security
        if (value.length < 32) {
          invalid.push(`${varName} must be at least 32 characters long (current: ${value.length})`);
        }
        // Reject obvious placeholder values
        if (value.includes('replace') || value.includes('changeme') || value === 'your-secret-here') {
          invalid.push(`${varName} appears to be a placeholder value`);
        }
        break;

      case 'MONGO_URI':
        // Must start with mongodb:// or mongodb+srv://
        if (!value.startsWith('mongodb://') && !value.startsWith('mongodb+srv://')) {
          invalid.push(`${varName} must be a valid MongoDB connection string`);
        }
        // Production should use SSL
        if (process.env.NODE_ENV === 'production' && !value.includes('ssl=true') && value.startsWith('mongodb://')) {
          console.warn('⚠️  WARNING: MongoDB connection in production should use SSL');
        }
        break;

      case 'GOOGLE_CLIENT_ID':
        // Should end with .apps.googleusercontent.com
        if (!value.includes('.apps.googleusercontent.com')) {
          invalid.push(`${varName} doesn't appear to be a valid Google Client ID`);
        }
        break;

      case 'GOOGLE_CALLBACK_URL':
        // Must be a valid URL
        try {
          new URL(value);
          // Production should use HTTPS
          if (process.env.NODE_ENV === 'production' && !value.startsWith('https://')) {
            invalid.push(`${varName} must use HTTPS in production`);
          }
        } catch (e) {
          invalid.push(`${varName} must be a valid URL`);
        }
        break;
    }
  });

  // Report all errors at once
  if (missing.length > 0 || invalid.length > 0) {
    const errors = [];

    if (missing.length > 0) {
      errors.push(`Missing required environment variables:\n  - ${missing.join('\n  - ')}`);
    }

    if (invalid.length > 0) {
      errors.push(`Invalid environment variables:\n  - ${invalid.join('\n  - ')}`);
    }

    const errorMessage = [
      '❌ Environment Validation Failed',
      '',
      ...errors,
      '',
      '💡 Make sure you have a .env file with all required variables.',
      '   Copy .env.example to .env and fill in the values.',
      '',
      '🔒 Security Note: Never commit your .env file to version control!',
    ].join('\n');

    throw new Error(errorMessage);
  }

  // All good!
  console.log('✅ Environment variables validated successfully');

  // Log what environment we're running in
  const env = process.env.NODE_ENV || 'development';
  console.log(`🚀 Running in ${env} mode`);
}

module.exports = { validateEnvironment };
