# Household Finance Vault

Simple, secure vault for couples to store household financial details (bank, utilities, providers, policies, accounts).

Core principles
- Simplicity First — only build what's necessary
- Use Trusted Services — rely on industry-standard libraries and providers
- Protection by Design — environment variables, HTTPS, and clear access model
- User Trust — make security understandable and reliable

What's included
- Documentation: [`.env.example`](.env.example:1), [`SECURITY.md`](SECURITY.md:1), [`PROJECT_GUIDE.md`](PROJECT_GUIDE.md:1)
- Minimal Node.js + Express scaffold: [`package.json`](package.json:1), [`src/server.js`](src/server.js:1)
- Local dev with Docker: [`docker-compose.yml`](docker-compose.yml:1), [`Dockerfile`](Dockerfile:1)

Quickstart (development)
1. Copy env example: cp .env.example .env
2. Fill in required vars (see [`.env.example`](.env.example:1))
3. Start local services:
   - docker-compose up --build
4. Install deps (if not using Docker): npm install
5. Run server: npm run dev

Security notes
- Never commit `.env` to Git. See [`SECURITY.md`](SECURITY.md:1)
- Authentication is via Google OAuth (no local passwords)
- Data stored in MongoDB Atlas with field-level encryption recommended

Project roadmap
- Setup MongoDB Atlas cluster and secure connection
- Configure Google OAuth 2.0
- Implement backend: auth, approvals, permissions
- Build UI: login → dashboard → entry view/edit
- Notes & attachments

Contributing
- Use branches for features, avoid committing secrets
- Basic linting recommended (Prettier / ESLint)

Files to review
- [`PROJECT_GUIDE.md`](PROJECT_GUIDE.md:1) — single-file guide
- [`SECURITY.md`](SECURITY.md:1) — short security notes
- [`src/server.js`](src/server.js:1) — express entrypoint

License
- MIT

Contact
- Maintainer: you@your-email.example