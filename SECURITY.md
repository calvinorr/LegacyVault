# SECURITY - Household Finance Vault (short notes)

This file contains concise, practical security guidance for developers and operators.

Key rules
- Never commit `.env` or any files containing secrets to Git. Use .gitignore to exclude them.
- Use Google OAuth for authentication — do not implement or store local passwords.
- Prefer MongoDB Atlas with field-level encryption for sensitive fields.
- Enforce HTTPS in production (reverse proxy, managed hosting, or platform TLS).
- Store secrets in environment variables; never hardcode credentials or keys.
- Use least-privilege IAM roles for cloud services and restrict network access (IP, VPC).
- Keep dependencies up to date and run regular security scans (npm audit / Snyk).
- Limit stored data to what is necessary; redact or truncate sensitive fields where possible.
- Keep audit logs and monitor for suspicious activity; redact PII from logs.
- Use strong session secrets and rotate them periodically.
- Use secure cookie settings (HttpOnly, Secure, SameSite).
- Back up data and test recovery; ensure backups are encrypted at rest.
- Have a simple incident response plan: rotate credentials, revoke sessions, notify affected users.
- Approvals & access model: admins approve new users; treat approval as an auditable action.
- Use managed services where they reduce security burden (e.g., OAuth, managed DB with encryption).
- Reporting vulnerabilities: open an issue or contact the maintainer listed in README.

Short checklist for deployments
1. Ensure .env is not committed and production uses secure secret storage.
2. Configure HTTPS and HSTS.
3. Use MongoDB Atlas or equivalent with encryption at rest.
4. Limit network egress and ingress for database access.
5. Enable monitoring and backups.

Maintainer contact: you@your-email.example