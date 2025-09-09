# Product Requirements Document — Household Finance Vault (Next Phase)

Status
- Purpose: capture the plan and acceptance criteria for the next phase: modern professional frontend design and research-to-prototype work.
- Current baseline: backend scaffold, Google OAuth, MongoDB persistence, user model + approval flow, entries CRUD and a minimal prototype UI.
  - Key files: [`src/server.js`](src/server.js:1), [`src/auth/google.js`](src/auth/google.js:1), [`src/models/entry.js`](src/models/entry.js:1), [`src/routes/entries.js`](src/routes/entries.js:1), [`public/entries.html`](public/entries.html:1)

Objectives (next phase)
1. Research and select a modern frontend stack and design system that balances speed, accessibility, and a professional look.
2. Produce high-fidelity visual designs (desktop + mobile) for the primary flows: login → dashboard → entry list → entry detail/edit → attachments & settings.
3. Implement a polished, responsive frontend prototype (no heavy state server rewrite) that integrates with the existing API.
4. Deliver a design handoff package and development plan for production readiness (sessions, hosting, CI).

Scope (what this PRD covers)
- Research outcomes: component libraries, hosting, authentication UX, file attachments, accessibility constraints.
- Visual design deliverables: moodboard, colour system, typography, component library, responsive wireframes (desktop & mobile).
- Prototype deliverables: SPA (single-page app) scaffold, login flow wired to existing OAuth, dashboard listing entries, entry detail/edit modal, create entry form, upload attachments UI (mock or real).
- Non-functional constraints: security guardrails, privacy-first defaults, progressive enhancement, performance baseline.

Out of scope (for now)
- Full production deployment automation (we will produce recommendations and checklist).
- Complex attachment pipelines (we will prototype using signed S3 uploads or placeholder mock).
- Multi-tenant or advanced RBAC — keep the simple couple/admin model.

User personas and key problems
- Persona: Partner A / Partner B — non-technical, need quick access to household finances if the other partner is unavailable.
  - Goals: quickly find account numbers, policy numbers, provider contacts, and upload key documents.
  - Constraints: must be simple, reassuring, and trustworthy.
- Persona: Admin (one partner or both) — approves new users, manages sharing.
  - Goals: quickly approve a partner, manage entries, keep the vault tidy.

Success metrics
- Prototype: users can sign in with Google and see entries (already verified).
- Design: completion of high-fidelity mockups for all primary screens.
- Usability: prototype tested with 3 people (task: find an account and upload a document) with >80% task success.
- Security: session & secrets not stored in code; recommend express-session + secure store for production.

Research checklist (deliverables)
- Compare frontend frameworks (React, Vue, Svelte). Recommendation matrix: familiarity, ecosystem, size, SSR needs.
- Compare component/design systems:
  - MUI (Material) — pros: fast components, accessibility; cons: opinionated look
  - Chakra UI — pros: themeable, accessible primitives
  - Tailwind CSS + headless UI — pros: design control; cons: more work to assemble components
  - Ant Design — pros: enterprise, but heavier
- Hosting & CDN options:
  - Vercel, Render, Netlify for frontend
  - MongoDB Atlas for DB (already used) — field-level encryption notes
  - S3 / DigitalOcean Spaces for attachments
- Authentication UX:
  - Keep Google OAuth as primary method; add account recovery docs
  - Cookie / session options for production (express-session + Redis or managed store)
- Accessibility & privacy requirements:
  - WCAG AA baseline
  - Avoid storing sensitive data in logs; redact where necessary
- Performance targets:
  - First Contentful Paint < 1s (local-dev aside)
  - Page bundle < 200KB gzipped for core UI where possible

Design deliverables
- Moodboard & brand basics: logo lockup (simple wordmark), color palette, typography.
- Core screens (high-fidelity):
  - Login / landing
  - Dashboard (cards for categories, search, quick add)
  - Entry list (filter, sort, owner/approved badges)
  - Entry detail / edit modal (sensitive fields masked by default, reveal on click)
  - Attachments modal (upload progress, thumbnails)
  - Settings (manage partners, export backup)
- Component library:
  - Buttons, inputs, modals, cards, list items, avatars, toasts, icon set
  - Tokens: spacing, radii, color variables, elevation
- Accessibility checklist per screen (focus order, ARIA roles, keyboard nav)

Prototype implementation plan
- Stack recommendation (example):
  - React + Vite for dev speed
  - Tailwind CSS for rapid, responsive styling or Chakra UI for accessible components
  - React Query (TanStack) for data fetching/caching
  - Simple routing (React Router or built-in)
- Milestones:
  1. M1 — Project scaffold: Vite app, theme, component library basics (2 days)
  2. M2 — Pages & flows: login, dashboard, entries list & view (4 days)
  3. M3 — Editing & attachments (3 days)
  4. M4 — Usability polish & accessibility fixes (2 days)
  5. M5 — Handoff & deployment (2 days)
- Acceptance criteria for prototype:
  - Users can sign in with Google and reach a dashboard with entry list
  - Users can create, edit, delete an entry from the UI and changes reflect via existing API
  - Attachments can be uploaded (mock or signed upload) and attached to entries
  - UI is responsive (desktop / tablet / mobile) and passes keyboard-only navigation for primary flows

Security & privacy notes (concise)
- Never commit .env or secrets — see [`.env.example`](.env.example:1) and [`SECURITY.md`](SECURITY.md:1)
- Production: switch to express-session and server-backed store, set secure cookies (HttpOnly, Secure, SameSite=Lax/None as appropriate for cross-site needs)
- Use HTTPS (platform-managed TLS) and HSTS for all endpoints
- Use MongoDB Atlas with field-level encryption for accountDetails or other sensitive fields if required
- Attachments: store in encrypted object storage (S3/Spaces), serve via signed URLs (short expiry)

Deliverables & artifacts to produce
- This PRD: [`PROJECT_PRD.md`](PROJECT_PRD.md:1)
- Research summary document with recommendation and tradeoffs (short)
- High-fidelity mockups for primary screens (Figma or equivalent) + component token list
- Prototype SPA: scaffold committed under `web/` or `frontend/` depending on preference
- Handoff checklist with deployment notes and security items

Next immediate actions (pick one; I can do the work)
- I will produce the research comparison and recommended stack with pros/cons and a short justification.
- I will create the initial frontend scaffold (React + Vite + Tailwind or Chakra) and wire login + dashboard pages to the existing API.
- I will produce high-fidelity mockups for the three core screens (login, dashboard, entry detail) as static images/wireframes in a design file.

Recommendation (my suggestion)
- Start with research → pick stack (I recommend React + Vite + Tailwind or Chakra UI for speed & accessibility), then build the scaffold and the dashboard page as the first implementation milestone.

Approval
- Reply with which next immediate action to take:
  - "research" — create research doc & stack recommendation
  - "scaffold" — create frontend scaffold and wire basic login/dashboard pages
  - "mockups" — produce high-fidelity mockups for approval

Prepared by: Household Finance Vault dev