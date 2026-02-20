# CLAUDE.md — MutualFlow

This file provides context for AI assistants working in this repository. It covers the codebase structure, development conventions, and workflows for the MutualFlow real estate transaction management platform.

---

## Project Overview

**MutualFlow** is a web application for First Mutual Realty Group that manages agents, clients, and property transactions. It provides role-based dashboards, transaction stage tracking, document management, task assignment, and automated email notifications.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI primitives |
| Icons | Lucide React |
| Forms | React Hook Form + Zod validation |
| ORM | Prisma 7 with `better-sqlite3` adapter |
| Database | SQLite (`dev.db` at project root) |
| Auth | NextAuth v5 (beta) — Credentials provider, JWT strategy |
| Email | Nodemailer (SMTP); silently skips if unconfigured |
| Date utilities | date-fns |
| Password hashing | bcryptjs |
| Google integration | googleapis (Google Drive, partially integrated) |

---

## Directory Structure

```
mutualflow/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Root redirect (→ /dashboard or /login)
│   ├── globals.css             # Global styles
│   ├── login/page.tsx          # Login page
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard shell (Header + Sidebar)
│   │   ├── page.tsx            # Dashboard home with stats (role-aware)
│   │   ├── agents/             # Agent CRUD pages (BROKER only)
│   │   ├── clients/            # Client CRUD pages
│   │   └── transactions/       # Transaction CRUD + stage management
│   └── api/
│       ├── auth/[...nextauth]/ # NextAuth handler
│       ├── agents/             # GET/POST/PUT/DELETE agents
│       ├── clients/            # GET/POST/PUT/DELETE clients
│       ├── transactions/       # GET/POST/PUT/DELETE transactions
│       │   └── [id]/
│       │       ├── submit/     # POST — submit transaction for approval
│       │       ├── approve/    # POST — broker approves transaction
│       │       └── stage/      # PUT — advance transaction stage
│       ├── documents/          # GET/POST/DELETE documents
│       └── tasks/              # GET/POST/PUT/DELETE tasks
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Top nav with user avatar and sign-out
│   │   └── Sidebar.tsx         # Left navigation (role-aware links)
│   ├── agents/
│   │   ├── AgentForm.tsx       # Create/edit agent form
│   │   └── DeactivateAgentButton.tsx
│   ├── clients/
│   │   ├── ClientForm.tsx      # Create/edit client form
│   │   └── DeleteClientButton.tsx
│   └── transactions/
│       ├── TransactionForm.tsx     # Create/edit transaction form
│       ├── DocumentUploader.tsx    # File upload UI
│       ├── StageManager.tsx        # Stage progression UI
│       ├── TaskManager.tsx         # Task list UI
│       └── TransactionActions.tsx  # Submit/approve action buttons
├── lib/
│   ├── db.ts                   # Prisma client singleton (with SQLite adapter)
│   ├── email.ts                # sendEmail() via Nodemailer
│   ├── email-templates.ts      # HTML email templates
│   └── utils.ts                # cn(), formatCurrency(), formatDate(), formatPhone(), STAGES
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Demo seed data
│   └── migrations/             # Migration history
├── types/
│   └── next-auth.d.ts          # NextAuth session/user type augmentation
├── auth.ts                     # NextAuth configuration
├── middleware.ts               # Auth guard for all routes
├── next.config.ts              # Next.js config
├── prisma.config.ts            # Prisma config
├── tsconfig.json               # TypeScript config (strict, path alias @/*)
└── eslint.config.mjs           # ESLint (next/core-web-vitals + TypeScript)
```

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint
npm run lint

# Apply schema changes to DB and run migrations
npm run db:push

# Seed the database with demo data
npm run db:seed
```

---

## Environment Variables

Create a `.env` file at the project root (not committed). Required variables:

```env
# Database — defaults to file:./dev.db if unset
DATABASE_URL="file:./dev.db"

# NextAuth — must be set for JWT signing
NEXTAUTH_SECRET="your-secret-here"

# SMTP — optional; emails are skipped (logged to console) if omitted
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM=""
```

---

## Database

- **Engine:** SQLite via `better-sqlite3`
- **ORM:** Prisma 7 with driver adapter (`@prisma/adapter-better-sqlite3`)
- **File location:** `dev.db` at project root (gitignored)
- **Schema:** `prisma/schema.prisma`

### Models

| Model | Purpose |
|---|---|
| `User` | Agents and brokers; role is `AGENT` or `BROKER` |
| `Account` | NextAuth OAuth accounts |
| `Session` | NextAuth sessions |
| `Client` | Real estate clients, owned by an agent |
| `Transaction` | Property deals linking a client and agent |
| `TransactionStage` | Per-stage status within a transaction |
| `Document` | Uploaded files attached to a transaction |
| `EmailCampaign` | Automated emails triggered by stage changes |
| `Task` | To-do items attached to a transaction |

### Key Enums (stored as strings)

- **User.role:** `BROKER`, `AGENT`
- **Transaction.status:** `ACTIVE`, `COMPLETED`, `CANCELLED`
- **Transaction.currentStage / TransactionStage.stageName:** `DUE_DILIGENCE`, `APPRAISAL`, `LOAN_CONTINGENCY`, `CLOSE_OF_ESCROW`
- **TransactionStage.status:** `PENDING`, `ACTIVE`, `COMPLETED`
- **Document.category:** `PURCHASE`, `DISCLOSURE`, `SUPPORTING`, `MISCELLANEOUS`
- **EmailCampaign.status:** `PENDING`, `SENT`, `FAILED`
- **Task.priority:** `LOW`, `MEDIUM`, `HIGH`

### Schema changes workflow

1. Edit `prisma/schema.prisma`
2. Run `npm run db:push` (runs `prisma migrate dev`)
3. Regenerate client if needed: `npx prisma generate`

---

## Authentication & Authorization

**Auth config:** `auth.ts`
**Middleware:** `middleware.ts`

- All routes except `/login` and `/api/auth/*` are protected.
- NextAuth uses Credentials provider (email + bcrypt password).
- Session strategy: JWT. The token carries `id` and `role`.
- The `session.user` object has: `id`, `name`, `email`, `role`, `image?`.
- `types/next-auth.d.ts` extends the NextAuth types to include `id` and `role`.
- Inactive users (`isActive: false`) cannot log in.

### Role-based behavior

| Feature | BROKER | AGENT |
|---|---|---|
| Dashboard stats | All agents' transactions | Own transactions only |
| Agents section | Full CRUD | Not accessible |
| Clients | Own clients | Own clients |
| Transactions | View/approve all | Own transactions |
| Approve transactions | Yes | No |

---

## Transaction Stage Flow

Stages advance in order. The `STAGES` constant in `lib/utils.ts` defines order and metadata.

```
DUE_DILIGENCE → APPRAISAL → LOAN_CONTINGENCY → CLOSE_OF_ESCROW
```

- Each stage is a `TransactionStage` row with status `PENDING | ACTIVE | COMPLETED`.
- `Transaction.currentStage` tracks the active stage key.
- Advancing a stage via `PUT /api/transactions/[id]/stage` marks current stage `COMPLETED`, activates next stage, and sends an email campaign.

---

## Key Utilities (`lib/utils.ts`)

```ts
cn(...inputs)             // Merge Tailwind classes (clsx + tailwind-merge)
formatCurrency(amount)    // USD integer formatting — "$650,000"
formatDate(date)          // "Jan 15, 2025" or "—" if null
formatPhone(phone)        // "(555) 123-4567"
STAGES                    // Ordered array of stage definitions
getStageIndex(key)        // 0-based index for a stage key
getStageInfo(key)         // Full stage metadata object
```

---

## API Conventions

All API routes live under `app/api/`. They follow standard Next.js Route Handler patterns.

- Import `auth` from `@/auth` and call `const session = await auth()` at the top of each handler to get the current user.
- Return `NextResponse.json({ error: "..." }, { status: 4xx })` for errors.
- Use Prisma via the singleton in `lib/db.ts`: `import { prisma } from "@/lib/db"`.
- Email is sent via `sendEmail()` from `lib/email.ts`; it gracefully no-ops when SMTP is unconfigured.

---

## Email

`lib/email.ts` exports `sendEmail({ to, subject, html })`.

- If `SMTP_HOST`, `SMTP_USER`, or `SMTP_PASSWORD` are absent, the function logs to console and returns `{ success: true, simulated: true }` — no error is thrown.
- HTML templates are in `lib/email-templates.ts`.
- Sender name is always `"First Mutual Realty Group"`.

---

## Code Conventions

- **TypeScript strict mode** is enabled. Avoid `any`; existing `any` casts in `lib/db.ts` and `prisma/seed.ts` are intentional workarounds for Prisma adapter type issues.
- **Path alias:** Use `@/` to reference the project root (e.g., `import { prisma } from "@/lib/db"`).
- **Class names:** Use the `cn()` utility from `lib/utils.ts` for all conditional/merged Tailwind classes.
- **Form handling:** Use React Hook Form with Zod resolvers (`@hookform/resolvers/zod`).
- **Components:** Prefer Radix UI primitives for accessible interactive elements (Dialog, DropdownMenu, Select, Tabs, Toast, Avatar).
- **No test framework** is configured. There are no unit or integration tests at this time.
- **Linting:** ESLint with `next/core-web-vitals` and TypeScript rules. Run `npm run lint` before committing.

---

## Demo Seed Data

After running `npm run db:seed`:

| Role | Email | Password |
|---|---|---|
| BROKER | `edgar@firstmutualrealtygroup.com` | `Broker2024!` |
| AGENT | `sarah@firstmutualrealtygroup.com` | `Agent2024!` |
| AGENT | `michael@firstmutualrealtygroup.com` | `Agent2024!` |

Demo transaction: **789 Maple Drive, Pasadena, CA** — $650,000, stage `DUE_DILIGENCE`, assigned to Sarah Johnson with 3 sample tasks.

---

## Common Pitfalls

- **Prisma client must be the singleton** from `lib/db.ts`. Do not instantiate `new PrismaClient()` elsewhere.
- **`DATABASE_URL` defaults to `file:./dev.db`** if unset. The seed script resolves the path relative to the `prisma/` directory using `path.join(__dirname, "..", "dev.db")`.
- **NextAuth v5 (beta)** — the API is slightly different from stable v4. Use `auth()` (server-side) rather than `getServerSession()`.
- **Email silently skips** when SMTP is not configured. This is intentional for local development. Check console output if emails appear missing.
- **No migrations directory initially** — if running the project fresh, `npm run db:push` creates the schema. Subsequent schema changes generate new migrations.
