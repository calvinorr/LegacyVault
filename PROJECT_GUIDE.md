# PROJECT_GUIDE - Household Finance Vault

Purpose
This guide summarizes project intent, quick setup, wireframes, and next steps.

Files created so far
- [`README.md`](README.md:1)
- [`.env.example`](.env.example:1)
- [`SECURITY.md`](SECURITY.md:1)
- [`package.json`](package.json:1)
- [`src/server.js`](src/server.js:1)
- [`Dockerfile`](Dockerfile:1)
- [`docker-compose.yml`](docker-compose.yml:1)

Quick local setup (Docker)
1. Copy environment example: cp .env.example .env
2. Edit `.env` and provide credentials (Google, Mongo)
3. Build & run: docker-compose up --build
4. Visit: http://localhost:3000

Quick local setup (without Docker)
1. npm install
2. Copy .env and fill in values
3. npm run dev
4. Visit: http://localhost:3000

Development notes
- Environment variables: keep secrets in `.env`.
- Use Google OAuth for authentication; configure credentials in Google Cloud Console.
- For production, prefer MongoDB Atlas and set MONGO_URI accordingly.
- The project aims for simplicity and uses well-tested libraries only.

Wireframes (textual)
1. Login
   - Google Sign-in button centered
   - Brief explanation: "Shared household finance vault"
2. Dashboard
   - Top navbar: user avatar, logout, settings
   - List of categories (Accounts, Utilities, Policies, Providers)
   - Search box and quick add button
   - Each item: title, owner, short note, last-updated
3. Entry view / edit
   - Fields: Title, Type, Provider, Account details, Login hints, Notes, Attachments
   - Approvals: show partner approval status if required
4. Settings
   - Manage partners (invite, approve)
   - Security notes and backup options

Data & security design (high level)
- Authentication: Google OAuth (no local passwords)
- Authorization: simple roles: user, admin (admin approves new users)
- Data storage: MongoDB (Atlas recommended) with field-level encryption for sensitive fields
- Secrets: stored in environment variables
- Transport: HTTPS in production
- Backups: use managed DB backups with encryption

Next implementation steps (priority)
1. Wire up MongoDB connection (`src/db/index.js`) and user model
2. Implement Google OAuth flow more robustly and persist users
3. Implement approval flow: admin approves new partner accounts
4. Build basic frontend placeholder and connect to auth endpoints
5. Add attachments storage (S3 or provider) and link to entries
6. Add tests and simple CI

Recommended libraries & services
- Node + Express + Passport (Google)
- MongoDB Atlas (field-level encryption)
- AWS S3 / DigitalOcean Spaces for attachments
- Vercel / Render / Heroku for hosting (managed TLS)

VS Code & Dev tooling tips
- Recommended extensions: ESLint, Prettier, Docker
- Use EditorConfig and consistent formatting
- Run `npm audit` occasionally

Contacts & resources
- Maintainer: you@your-email.example
- Google OAuth docs: https://developers.google.com/identity
- MongoDB Atlas docs: https://www.mongodb.com/cloud/atlas

Notes
Keep the code minimal and rely on managed services to reduce security burden.

End of guide