# Ankush Arya Casting

A web platform for **Ankush Arya Casting**, a casting agency working with actors and other creative talent across films, advertisements, web series, and digital projects.

The project combines the agency's public website with a private talent-management platform. The first product release focuses on verified talent accounts, private profiles, and secure agency access.

> **Project status:** Active development. Adult actor registration, email verification, login, database-backed sessions, and the initial role/ownership authorization layer have been implemented and tested locally. Protected talent-profile viewing and editing are implemented on a feature branch and await local validation. Guardian/child workflows, manager consent, admin operations, and production hardening remain in progress.

---

## Contents

- [Product goals](#product-goals)
- [Technology stack](#technology-stack)
- [Implemented functionality](#implemented-functionality)
- [Authorization model](#authorization-model)
- [Project structure](#project-structure)
- [Application routes](#application-routes)
- [Local development](#local-development)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [V1 scope](#v1-scope)
- [Roadmap](#roadmap)
- [Git workflow](#git-workflow)

## Product goals

- Provide a professional online presence for the agency.
- Let adult actors register and verify their email addresses.
- Support parent- or legal-guardian-managed profiles for child artists.
- Maintain a centralized, private talent database.
- Allow authorized agency staff to search and manage profiles.
- Keep personal information and portfolio media private.

## Technology stack

### Application

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type safety |
| TanStack Start | Full-stack React framework and server functions |
| TanStack Router | File-based routing |
| Vite | Development and production builds |
| Tailwind CSS v4 | Styling |
| ESLint | Code quality |

### Backend

| Technology | Purpose |
|---|---|
| PostgreSQL | Relational database |
| Prisma ORM 7 | Database schema, migrations, and queries |
| Prisma PostgreSQL adapter | Prisma-to-PostgreSQL connection |
| Zod | Server request validation |
| Argon2id (`argon2`) | Password hashing and verification |
| Node.js Crypto | Secure random tokens and SHA-256 token hashing |
| Resend | Transactional email delivery |
| HTTP-only cookies | Browser session credential |

A separate Express API server is not part of the current architecture. Backend operations use TanStack Start server functions and server-only modules.

## Implemented functionality

### Website

- Agency homepage and shared site layout.
- About, talent, work, producers, contact, join, login, verification, and dashboard routes.
- Private-talent positioning; there is no public talent directory.

### Registration and email verification

- Adult actor registration through a TanStack Start server function.
- Zod validation for registration, verification, resend, and login inputs.
- Argon2id password hashing and verification.
- Atomic creation of the user, TALENT role assignment, and talent profile.
- Cryptographically secure 32-byte email verification tokens.
- SHA-256 token hashes stored in PostgreSQL; raw verification tokens are not stored.
- Verification tokens expire after 30 minutes and are consumed during verification.
- Resend verification flow with a 60-second per-account cooldown.
- Resend responses are generic to reduce account enumeration.
- Resend email delivery integration.
- Local email delivery and database account-verification flow tested.

### Login and sessions

- Login checks the supplied password against the Argon2id hash.
- Unverified accounts are rejected at login.
- Seven-day database-backed sessions.
- Random session tokens stored in the browser only as HTTP-only cookies.
- Only SHA-256 session-token hashes are stored in PostgreSQL.
- Current-user lookup validates the session and verified-email status.
- Logout revokes the database session and clears the cookie.

### Authorization foundation

- Multiple roles per user through the `Role` and `UserRole` tables.
- Supported application role names: `TALENT`, `GUARDIAN`, `MANAGER`, and `ADMIN`.
- Server-side helpers for authentication, single-role checks, and any-of-role checks.
- Talent-profile access checks for the profile owner and primary guardian.
- Admin profile access is designed to be agency-wide.
- The dashboard's profile list is scoped by the signed-in user's role and ownership/guardian relationships.
- Protected profile-detail and profile-update server functions check access to the requested profile before returning or changing data.
- The profile editor supports personal information, languages, experience, previous-work and portfolio links, Instagram, introduction-video links, and photo asset URLs; ownership and guardian relationship fields cannot be changed through this form.

**Authorization limitations:** Manager access is deliberately not granted until the actor-approved, revocable manager-access relationship is implemented. No public registration flow can assign the ADMIN role. The first agency administrator is provisioned manually by a database owner using `prisma/bootstrap-admin.sql`. Route guards improve navigation but are not a substitute for authorization inside every private server operation.

## Authorization model

| Role | Intended access |
|---|---|
| `TALENT` | The actor's own talent profile |
| `GUARDIAN` | Child profiles explicitly assigned to that guardian |
| `MANAGER` | Only profiles for which the actor has approved manager access; not yet enabled |
| `ADMIN` | Agency-wide talent management; role provisioning must be controlled |

A role alone does not grant access to every talent profile. Profile-level access also checks the relevant owner or guardian relationship. Manager access will require a separate approval/revocation record and must not be inferred from the MANAGER role alone.

## Project structure

The main application structure is shown below. Generated and tooling files are omitted.

```text
ankush-arya-casting/
├── prisma/
│   ├── migrations/
│   ├── bootstrap-admin.sql
│   └── schema.prisma
├── public/
├── src/
│   ├── components/
│   │   └── site/
│   ├── lib/
│   │   ├── auth.functions.ts
│   │   ├── server/
│   │   │   ├── auth/
│   │   │   │   ├── authorization.ts
│   │   │   │   ├── login.ts
│   │   │   │   ├── password.ts
│   │   │   │   ├── register.ts
│   │   │   │   ├── resend-verification.ts
│   │   │   │   ├── session-cookie.ts
│   │   │   │   ├── session.ts
│   │   │   │   ├── verification-token.ts
│   │   │   │   └── verify-email.ts
│   │   │   ├── email/
│   │   │   │   └── send-verification-email.ts
│   │   │   ├── talent-profile.ts
│   │   │   └── prisma.ts
│   │   └── validation/
│   │       ├── auth.ts
│   │       └── talent-profile.ts
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   ├── join.tsx
│   │   ├── login.tsx
│   │   ├── verify-email.tsx
│   │   ├── dashboard.tsx
│   │   └── dashboard.profile.$profileId.tsx
│   ├── generated/
│   │   └── prisma/
│   ├── routeTree.gen.ts
│   ├── router.tsx
│   ├── server.ts
│   └── start.ts
├── prisma7.config.ts
├── package.json
├── package-lock.json
└── README.md
```

Important files:

- `src/lib/auth.functions.ts` — TanStack Start server functions.
- `src/lib/server/auth/` — Server-only authentication, session, and authorization logic.
- `src/lib/server/email/` — Transactional email delivery.
- `src/lib/server/prisma.ts` — Prisma database client.
- `src/lib/validation/auth.ts` — Zod validation schemas.
- `prisma/schema.prisma` — Database models and relations.
- `prisma/migrations/` — Database migration history.
- `src/generated/prisma/` — Generated Prisma Client; do not edit manually.
- `src/routeTree.gen.ts` — Generated by TanStack Router; do not edit manually.

## Application routes

| Route | Purpose |
|---|---|
| `/` | Homepage |
| `/about` | Agency information |
| `/talent` | Private talent information |
| `/join` | Adult actor registration and verification resend |
| `/verify-email` | Email verification |
| `/login` | Login |
| `/dashboard` | Authenticated account dashboard |
| `/dashboard/profile/$profileId` | Protected talent profile editor |
| `/work` | Agency work |
| `/producers` | Information for production professionals |
| `/contact` | Contact information |

Some informational pages may still contain demonstration content. Agency work, clients, testimonials, and statistics should be replaced only with details verified by the agency.

## First admin bootstrap

The first agency administrator must be provisioned deliberately by someone with direct database-owner access. There is no public registration or server function that grants the `ADMIN` role.

1. Register the intended agency administrator through the normal registration flow.
2. Verify that account's email address.
3. From the project root, run the bootstrap script against the intended database:

   ```powershell
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d ankush_arya_casting -f prisma/bootstrap-admin.sql
   ```

4. Enter the exact email address of the verified agency account when prompted.
5. Confirm the output shows that email with `assigned_role = ADMIN`.

The script runs in a transaction, refuses missing or unverified accounts, creates the `ADMIN` role if needed, and assigns it only to the supplied account. Run it only with agency-owner approval and trusted database credentials. Keep the database password private.

## Local development

### Prerequisites

- Node.js (developed with Node.js 22).
- npm.
- Git.
- PostgreSQL 18.

### 1. Clone the repository

```bash
git clone https://github.com/Alishasaroha/ankush-arya-casting.git
cd ankush-arya-casting
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local `.env` file in the project root. See [Environment variables](#environment-variables).

### 4. Prepare the database

Create the PostgreSQL database, then apply the checked-in migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Start the application

```bash
npm run dev
```

Vite prints the local development URL in the terminal. Set `APP_URL` to that same origin and port.

A fresh checkout requires its own PostgreSQL instance, environment variables, and Resend configuration. Local database contents and credentials are not part of this repository.

## Environment variables

Create `.env` in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/ankush_arya_casting?schema=public"
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="Ankush Arya Casting <onboarding@resend.dev>"
APP_URL="http://localhost:8080"
```

- `DATABASE_URL` — Local or deployed PostgreSQL connection string.
- `RESEND_API_KEY` — Private Resend API key.
- `EMAIL_FROM` — Sender address configured with Resend.
- `APP_URL` — Application origin used to construct email verification links.

The Resend shared onboarding sender is restricted to limited testing until an agency-owned sending domain is verified. Configure an agency domain before sending production emails to actors.

Never commit `.env`, API keys, database passwords, session cookies, or verification tokens.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Build client and server |
| `npx tsc --noEmit` | Type-check without emitting files |
| `npx prisma validate` | Validate Prisma schema |
| `npx prisma migrate dev` | Apply development migrations |
| `npx prisma generate` | Generate Prisma Client |

## V1 scope

The first version focuses on a private talent database and basic agency administration.

### Included in the intended V1

- Adult talent accounts.
- Parent/legal-guardian-managed child profiles.
- One guardian may manage multiple child profiles.
- Private talent profiles.
- Server-side authorization for owners, guardians, and agency administrators.

### Explicitly out of scope for the initial version

- Public talent directory.
- Casting-requirement management.
- Availability tracking.
- AI-based matching.
- Payments and analytics.

### Planned privacy rules

- Adult actors own their profiles.
- Guardians access only child profiles assigned to them.
- Manager access requires actor approval and remains revocable.
- Admin access is restricted to explicitly provisioned agency administrators.
- Private data must be checked in server-side operations, not only hidden in the UI.

## Roadmap

| Phase | Scope | Status |
|---|---|---|
| 1 | Website foundation and initial UI | Implemented; content refinement ongoing |
| 2 | PostgreSQL and Prisma foundation | Implemented |
| 3 | Registration and email verification | Implemented and tested locally |
| 4 | Login, sessions, and logout | Implemented and tested locally |
| 5 | Role and profile-ownership authorization foundation | Implemented on feature branch; local validation pending |
| 6 | Initial admin provisioning | Bootstrap SQL script implemented; local execution pending |
| 7 | Guardian and child artist registration | Planned |
| 8 | Actor-approved manager access and revocation | Planned |
| 9 | Talent profile management | Extended on feature branch with languages, experience, links and photo metadata; migration and local validation pending |
| 10 | Admin dashboard and search/filtering | Planned |
| 11 | Media storage, security hardening, testing, and deployment | Planned |

## Git workflow

| Branch | Purpose |
|---|---|
| `main` | Stable project baseline |
| `redesign-v1` | Integrated development branch |
| `feature/role-based-access-control` | RBAC foundation |
| `feature/talent-profile-management` | Protected talent profile viewing and editing |

Development guidelines:

- Keep `main` stable.
- Build larger features on dedicated branches.
- Run TypeScript checks, linting, builds, and relevant database tests before merging.
- Keep commits focused and descriptive.
- Never commit secrets, local environment files, or database credentials.
- Review and test changes before merging into `redesign-v1` or `main`.

---

**Project:** Ankush Arya Casting  
**Status:** Under active development
