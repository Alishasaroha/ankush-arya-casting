# Ankush Arya Casting

A web platform for **Ankush Arya Casting**, a casting agency working with actors and other creative talent across films, advertisements, web series, and digital projects.

The goal is to build a centralized system for talent registration, private profile management, and the agency's internal talent database.

> **Project status:** Active development. The website frontend, PostgreSQL/Prisma backend, adult actor registration, and email verification are implemented and tested locally. Login, sessions, authorization, and child artist registration are still under development.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Product Goals](#product-goals)
- [Technology Stack](#technology-stack)
- [Implemented So Far](#implemented-so-far)
- [Project Structure](#project-structure)
- [Application Routes](#application-routes)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Available Scripts](#available-scripts)
- [V1 Product Scope](#v1-product-scope)
- [Development Roadmap](#development-roadmap)
- [Git Workflow](#git-workflow)

---

## About the Project

Ankush Arya Casting connects talent with opportunities in the entertainment and advertising industry. This project is intended to support that work with a professional website and an internal talent-management platform.

The initial version focuses on building a **private talent database**. Talent profiles are not intended to be publicly browsable.

## Product Goals

- Provide a professional online presence for the agency.
- Let actors and other talent create accounts and submit their details.
- Support parent- or legal-guardian-managed profiles for child artists.
- Store talent information in a centralized database.
- Allow authorized agency staff to search and manage talent profiles.
- Keep personal information and portfolio material private.

## Technology Stack

### Application

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type safety |
| TanStack Start | Full-stack React framework |
| TanStack Router | File-based routing |
| Vite | Development and production build tooling |
| Tailwind CSS v4 | Styling |
| ESLint | Code quality |

### Backend

| Technology | Purpose | Status |
|---|---|---|
| PostgreSQL | Relational database | Configured locally |
| Prisma ORM 7 | Database schema, migrations, and data access | Implemented |
| Prisma PostgreSQL adapter | Connect Prisma Client to PostgreSQL | Configured |
| Zod | Request-data validation | Registration and verification schemas implemented |
| Argon2id (`argon2`) | Password hashing and verification | Implemented and tested |
| Resend | Transactional email delivery | Integrated and tested locally |
| Node.js Crypto | Secure random tokens and SHA-256 hashing | Implemented |
| Object storage | Talent photos and videos | Planned |

The application uses TanStack Start's server functions for backend operations. A separate Express API server is not part of the current architecture.

## Implemented So Far

## Implemented So Far

### Website

- Agency homepage and shared site layout.
- About, talent, work, producers, contact, and join routes.
- Private-talent positioning; no public talent directory.
- Adult actor registration interface.
- Email verification page.

### Backend and database

- PostgreSQL database configured locally.
- Prisma 7 configured with the PostgreSQL adapter.
- Database models for users, roles, user-role assignments, talent profiles, and email verification tokens.
- Prisma migrations applied and Prisma Client generated.
- Database connection tested successfully.
- Zod validation for registration, verification, and resend requests.
- Adult actor registration through a TanStack Start server function.
- Atomic registration transaction for user creation, TALENT role assignment, and talent profile creation.
- Argon2id password hashing and verification helpers.
- Cryptographically secure 32-byte email verification tokens.
- SHA-256 token hashing; only token hashes are stored in PostgreSQL.
- Verification tokens expire after 30 minutes and are consumed during verification.
- Email verification updates `User.emailVerifiedAt`.
- Resend verification flow with a 60-second per-account cooldown.
- Generic resend responses to reduce account enumeration.
- Resend integration for transactional email delivery.
- Successful local test of email delivery and account verification in PostgreSQL.

### Current limitations

- Login, logout, and session management are not implemented.
- Protected routes and server-side authorization are not implemented.
- Child artist and guardian registration are not implemented.
- Manager access approval and revocation are planned.
- Talent profile editing and persistent profile workflows are incomplete.
- Secure photo and video uploads are not implemented.
- Admin dashboard, talent search, and filtering are planned.
- Stronger IP-based/global rate limiting and production email-domain configuration are still required.

**Note:** Email verification is working locally, but this does not mean the complete authentication system is production-ready. Do not treat an unverified account as authenticated.

### Backend foundations

- Local PostgreSQL database created.
- Prisma 7 configured with the PostgreSQL adapter.
- Initial database models created for users, roles, user-role assignments, and talent profiles.
- Initial Prisma migration applied.
- Database connection tested successfully.
- Argon2id password hashing and verification helpers implemented and tested.
- Initial Zod registration validation schema created.
- TypeScript check and production client/server build completed successfully after the current setup changes.

### Not implemented end to end yet

- Registration API/server action.
- User creation and role assignment through the registration flow.
- Email verification and account activation.
- Login, logout, and session management.
- Authorization enforcement and admin access.
- Talent profile editing and persistent profile workflows.
- Secure photo and video uploads.
- Admin dashboard, talent search, and filtering.

**Important:** The join page is still a frontend prototype. Submitting it does not create a database account or send a verification email. The password and validation helpers are foundations, not a complete authentication system.

## Project Structure

The application uses TanStack file-based routing. The structure below highlights the main application and backend areas; some generated and configuration files are omitted.

```text
ankush-arya-casting/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   └── site/
│   ├── hooks/
│   ├── lib/
│   │   ├── server/
│   │   │   └── auth/
│   │   │       └── password.ts
│   │   └── validation/
│   │       └── auth.ts
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   ├── about.tsx
│   │   ├── talent.tsx
│   │   ├── join.tsx
│   │   ├── work.tsx
│   │   ├── producers.tsx
│   │   └── contact.tsx
│   ├── generated/
│   │   └── prisma/
│   ├── routeTree.gen.ts
│   ├── router.tsx
│   ├── server.ts
│   └── start.ts
├── prisma7.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

### Important Directories and Files

- `src/routes/` — Application pages and route definitions.
- `src/components/` — Reusable UI components.
- `src/components/site/` — Shared website components.
- `src/assets/` — Application assets.
- `src/hooks/` — Reusable React hooks.
- `src/lib/server/` — Server-side functionality. Keep database and password operations out of browser code.
- `src/lib/server/auth/` — Authentication-related helpers, including password hashing.
- `src/lib/validation/` — Zod schemas for validating input.
- `prisma/schema.prisma` — Database models and relations.
- `prisma/migrations/` — Database migration history.
- `src/generated/prisma/` — Generated Prisma Client output; do not edit generated files manually.
- `routeTree.gen.ts` — Generated by TanStack Router; do not edit manually.

## Application Routes

| Route | Purpose |
|---|---|
| `/` | Homepage |
| `/about` | Agency information |
| `/talent` | Private talent information |
| `/join` | Adult actor registration and verification-email resend |
| `/verify-email` | Email verification using a single-use token |
| `/work` | Agency work |
| `/producers` | Information for production professionals |
| `/contact` | Contact information |

Some informational pages may still contain demonstration content. Agency work, clients, testimonials, and statistics should be replaced only with details verified by the agency.

## Getting Started

### Prerequisites

- Node.js (the project has been developed with Node.js 22).
- npm.
- Git.
- PostgreSQL 18 for local backend development.

### 1. Clone the repository

```bash
git clone https://github.com/Alishasaroha/ankush-arya-casting.git
cd ankush-arya-casting
```

### 2. Install dependencies

```bash
npm install
```

## 3. Environment Configuration

Create a local `.env` file in the project root.

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/ankush_arya_casting?schema=public"

RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="Ankush Arya Casting <onboarding@resend.dev>"
APP_URL="http://localhost:8080"
### 4. Prepare the database

After PostgreSQL is running and the database exists, apply the existing migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Start the development server

```bash
npm run dev
```

The development server prints its local URL in the terminal.

> The repository does not contain your local database or its credentials. A fresh checkout needs a PostgreSQL instance and a correctly configured `.env` file before database-backed features can run.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Build the client and server for production |
| `npx tsc --noEmit` | Run TypeScript type checking |
| `npx prisma validate` | Validate the Prisma schema |
| `npx prisma migrate dev` | Apply development migrations |
| `npx prisma generate` | Generate Prisma Client |

## V1 Product Scope

The first version is intentionally focused on a private talent database and basic agency administration.

### Talent and account types

- Adult actors and other talent can register their own accounts.
- A parent or legal guardian can manage a child artist's profile.
- One guardian may manage multiple child profiles.
- An adult actor's profile is owned by that actor. Any manager access should require the actor's approval and remain revocable.

### Talent information

The planned profile can include personal details, location, height, languages, experience, work links, photos, introduction videos, audition material, and social links.

### Privacy and access

Talent profiles are private by design. Access must be enforced by server-side authentication and authorization—not just by hiding pages or controls in the frontend.

### Explicitly out of scope for the initial version

- Public talent directory.
- Casting-requirement management.
- Availability tracking.
- AI-based talent matching.
- Payments and analytics.

## Development Roadmap

| Phase | Scope | Status |
|---|---|---|
| 1 | Website foundation and initial UI | Implemented; content refinement ongoing |
| 2 | PostgreSQL and Prisma foundation | Implemented |
| 3 | Password hashing and input validation | Implemented and tested |
| 4 | Adult actor registration and role assignment | Implemented and tested locally |
| 5 | Email verification and resend flow | Implemented and tested locally |
| 6 | Login, sessions, and authorization | Next |
| 7 | Guardian and child artist registration | Planned |
| 8 | Talent profile management | Planned |
| 9 | Admin dashboard and talent search/filtering | Planned |
| 10 | Media storage, security hardening, testing, and deployment | Planned |

## Git Workflow

| Branch | Purpose |
|---|---|
| `main` | Stable project baseline |
| `redesign-v1` | Current development branch for UI and backend work |

### Development Guidelines

- Create checkpoints before major changes.
- Run type checks and builds after meaningful changes.
- Keep commits focused and descriptive.
- Never commit secrets, local environment files, or database credentials.
- Review and test changes before merging into `main`.

---

**Project:** Ankush Arya Casting  
**Status:** Under active development
