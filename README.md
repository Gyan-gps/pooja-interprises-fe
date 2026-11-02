# Pooja Enterprises — Operations Dashboard

Internal dashboard for Pooja Enterprises (Printing & Publishing, Pune): orders, clients,
production tracking, staff tasks, invoices, and settings.

Built as a **Next.js App Router** modular monolith. The dashboard UI talks to real
`/api/v1` APIs backed by MongoDB.

## Stack

Next.js 15 · React 18 · TypeScript · Tailwind CSS 4 · MongoDB · Mongoose · Zod · bcryptjs · jose · Vitest · Recharts · lucide-react

## Setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` (see `.env.example`):

```env
NODE_ENV=development
NEXT_MONGODB_URL=mongodb://127.0.0.1:27017/pooja-enterprises
AUTH_SECRET=replace-with-a-long-random-secret-at-least-32-chars
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-now
```

`.env`, `.env.local`, and `.env*.local` are gitignored. Never commit credentials.

Create the first Admin user:

```bash
npm run seed:admin
```

## Scripts

```bash
npm install          # install dependencies
npm run dev          # Next.js dev server
npm run build        # production build
npm run start        # serve the production build
npm run lint         # ESLint
npm test             # Vitest unit tests
npm run verify:db    # model/repository smoke against MongoDB
npm run verify:api   # HTTP auth/API smoke (server must be running)
npm run seed:admin   # create Admin from ADMIN_EMAIL / ADMIN_PASSWORD
```

## Auth

- Admin email/password login at `/login`
- HttpOnly signed session cookie (`pe_session`), 7-day TTL by default
- Dashboard routes and protected APIs require a valid Admin session
- Logout invalidates the current session only (multi-device allowed)
- Login attempts are rate-limited per IP+email (in-memory; see deployment notes)
- Public: `/login`, `/api/v1/health`, `/api/v1/auth/login`, `/api/v1/auth/logout`

## Health check

```bash
curl http://localhost:3000/api/v1/health
```

HTTP 200 when the app and MongoDB are healthy; HTTP 503 if the database is unreachable.

## Business APIs (`/api/v1`)

See [docs/API.md](docs/API.md) for conventions and workflows.

| Resource | Endpoints |
|---|---|
| Clients | `GET/POST /clients`, `GET/PATCH/DELETE /clients/:id`, `POST /clients/:id/notes` |
| Staff | `GET/POST /staff`, `GET/PATCH/DELETE /staff/:id` |
| Orders | `GET/POST /orders`, `GET/PATCH/DELETE /orders/:id`, `PATCH /orders/:id/status`, `POST /orders/:id/delivery` |
| Tasks | `GET/POST /tasks`, `GET/PATCH/DELETE /tasks/:id` |
| Invoices | `GET/POST /invoices`, `GET/PATCH/DELETE /invoices/:id` |
| Settings | `GET/PUT /settings` |

Responses use `{ success: true, data }` or `{ success: false, error: { code, message } }`.
Deletes are soft (`isActive: false`). Invoice totals/GST are calculated on the server.

## Structure

```
src/
├── app/
│   ├── (dashboard)/dashboard/   Dashboard routes under /dashboard/*
│   ├── api/v1/                  Versioned Route Handlers
│   └── ...
├── features/                    Feature UI
├── components/                  Shared UI, layouts, providers
├── server/                      Server-only config, models, repos, services
├── lib/                         Client-safe utils, validations, API client
└── types/
docs/                            API, deployment, readiness notes
tests/unit/                      Vitest unit tests
```

## Routes

- `/` → `/dashboard`
- `/dashboard`, `/dashboard/orders`, `/dashboard/clients`, `/dashboard/production`
- `/dashboard/staff`, `/dashboard/reports`, `/dashboard/settings`
- `/login`
- `/api/v1/*`

## Documentation

- [API conventions](docs/API.md)
- [Deployment & backups](docs/DEPLOYMENT.md)
- [Production-readiness report](docs/PRODUCTION-READINESS.md)
- Implementation roadmap: `pooja-enterprises-complete-backend-roadmap.md`

## Deploying

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Configure `NEXT_MONGODB_URL` and a strong
`AUTH_SECRET` on the host. Never prefix secrets with `NEXT_PUBLIC_`.

```bash
npx vercel          # preview
npx vercel --prod   # production (only after explicit approval)
```

Node 20 is pinned in `.nvmrc`.
