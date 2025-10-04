# Source Tree Structure

```
SimpleHomeFinance-badm/
├── src/
│   ├── auth/                 # Passport.js strategies
│   │   └── google.js         # Google OAuth configuration
│   ├── config/               # Configuration files
│   ├── controllers/          # Business logic handlers
│   ├── db/                   # Database connection
│   ├── middleware/           # Express middleware
│   │   └── auth.js           # ensureAuthenticated, etc.
│   ├── models/               # Mongoose schemas
│   │   ├── user.js           # User model
│   │   ├── entry.js          # Legacy entry model
│   │   ├── category.js       # Category model
│   │   └── domain/           # Domain-specific models (Story 1.1)
│   │       ├── PropertyRecord.js
│   │       ├── VehicleRecord.js
│   │       ├── FinanceRecord.js
│   │       ├── EmploymentRecord.js
│   │       ├── GovernmentRecord.js
│   │       ├── InsuranceRecord.js
│   │       ├── LegalRecord.js
│   │       └── ServicesRecord.js
│   ├── routes/               # API endpoints
│   │   ├── auth.js           # /auth/*
│   │   ├── users.js          # /api/users/*
│   │   ├── entries.js        # /api/entries/*
│   │   └── domains.js        # /api/domains/* (Story 1.1)
│   ├── services/             # External services
│   ├── utils/                # Helper functions
│   ├── scripts/              # Migration scripts
│   └── server.js             # Main Express app
├── web/                      # React frontend (Vite)
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks (useAuth, etc.)
│   │   └── pages/            # Page components
│   └── vite.config.ts
├── tests/                    # Jest tests
├── docs/                     # Documentation
│   ├── architecture/         # Tech docs
│   ├── stories/              # User stories
│   ├── prd/                  # Product requirements
│   └── qa/                   # QA reports
└── .bmad-core/               # BMAD agent configuration
```

## Key Directories

### Backend (`src/`)
- **models/**: Mongoose schemas defining data structure
- **routes/**: Express routers defining API endpoints
- **middleware/**: Request processing (auth, validation)
- **controllers/**: Business logic separated from routes
- **services/**: External integrations and complex operations

### Frontend (`web/`)
- **components/**: Reusable UI components
- **hooks/**: Custom React hooks for shared logic
- **pages/**: Top-level page components

### Testing (`tests/`)
- **Unit tests**: Individual function/component tests
- **Integration tests**: API endpoint tests
- **Setup**: MongoDB Memory Server for isolated testing
