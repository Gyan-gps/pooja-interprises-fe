# Pooja Enterprises — Operations Dashboard

Internal dashboard for Pooja Enterprises (Printing & Publishing, Pune): orders, clients,
production tracking, staff tasks and reports.

Built as a **Next.js App Router** modular monolith. The dashboard UI is live; backend
APIs are being added under `/api/v1/`. See `pooja-enterprises-complete-backend-roadmap.md`
for the implementation plan.

## Stack

Next.js 15 · React 18 · TypeScript · Tailwind CSS 4 · MongoDB · Mongoose · Zod · bcryptjs · jose · Recharts · lucide-react

## Setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local`:

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
npm install        # install dependencies
npm run dev        # start the Next.js dev server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint
npm run seed:admin # create Admin from ADMIN_EMAIL / ADMIN_PASSWORD
```

## Auth

- Admin email/password login at `/login`
- HttpOnly signed session cookie (`pe_session`), 7-day TTL by default
- Dashboard routes and protected APIs require a valid session
- Logout invalidates the current session only (multi-device allowed)
- Public: `/login`, `/api/v1/health`, `/api/v1/auth/login`, `/api/v1/auth/logout`

## Health check

With the dev server running and MongoDB reachable:

```bash
curl http://localhost:3000/api/v1/health
```

Success returns HTTP 200 with `{ "success": true, "data": { "status": "ok", "database": { ... } } }`.
If the database is unreachable, the endpoint returns HTTP 503.

## Business APIs (`/api/v1`)

All routes below require an Admin session cookie except the public auth/health endpoints.

| Resource | Endpoints |
|---|---|
| Clients | `GET/POST /clients`, `GET/PATCH/DELETE /clients/:id`, `POST /clients/:id/notes` |
| Staff | `GET/POST /staff`, `GET/PATCH/DELETE /staff/:id` |
| Orders | `GET/POST /orders`, `GET/PATCH/DELETE /orders/:id`, `PATCH /orders/:id/status`, `POST /orders/:id/delivery` |
| Tasks | `GET/POST /tasks`, `GET/PATCH/DELETE /tasks/:id` |
| Invoices | `GET/POST /invoices`, `GET/PATCH/DELETE /invoices/:id` |
| Settings | `GET/PUT /settings` |

Responses use `{ success: true, data }` or `{ success: false, error: { code, message } }`.
List endpoints support `page`, `pageSize`, and resource-specific filters.
Deletes are soft (`isActive: false`). Invoice totals/GST are calculated on the server.

## Structure

```
src/
├── app/
│   ├── (dashboard)/dashboard/   Dashboard routes under /dashboard/*
│   ├── api/v1/                  Versioned Route Handlers
│   ├── layout.tsx               Root server layout
│   ├── page.tsx                 Redirects / → /dashboard
│   ├── globals.css
│   └── not-found.tsx
├── features/                    Feature UI (dashboard, orders, clients, …)
├── components/
│   ├── ui/                      Shared UI primitives
│   ├── layouts/                 Dashboard shell (sidebar, header)
│   └── providers/               Client providers (data, toast)
├── server/                      Server-only config, database, errors, utils
├── hooks/
├── lib/                         Client-safe utils and localStorage repositories
├── types/
└── styles/                      Fonts, Tailwind entry, theme tokens
```

## Naming conventions

| Element | Convention | Example |
|---|---|---|
| Variables / functions / params | `camelCase` | `connectToDatabase()` |
| React components | `PascalCase` | `DashboardHeader` |
| Types / interfaces / classes | `PascalCase` | `ApiError` |
| True constants | `UPPER_SNAKE_CASE` | `DEFAULT_PAGE_SIZE` |
| Files / folders | `kebab-case` | `mongodb.ts`, `order-management/` |
| Env vars | `UPPER_SNAKE_CASE` | `NEXT_MONGODB_URL` |
| Mongoose models | Singular `PascalCase` | `Customer` |

Prefer complete words (`customer`, not `cust`). Booleans should read as state (`isActive`, `hasPermission`).

## Routes

- `/` → redirects to `/dashboard`
- `/dashboard` — overview
- `/dashboard/orders`, `/dashboard/orders/[id]`
- `/dashboard/clients`, `/dashboard/clients/[id]`
- `/dashboard/production` — Kanban board
- `/dashboard/staff`, `/dashboard/staff/[id]`
- `/dashboard/reports` — CSV export
- `/dashboard/settings`
- `/login` — Admin sign in
- `/api/v1/health` — database health probe
- `/api/v1/auth/login` · `/api/v1/auth/logout` · `/api/v1/auth/me`
- unmatched paths → `not-found`

## Deploying to Vercel

`vercel.json` sets the framework to Next.js. Set **Root Directory** to
`pooja-interprises-fe` if this app lives in a monorepo subfolder.

**Important after the Vite → Next.js migration:** in the Vercel project
(Settings → General → Build & Development Settings), clear any leftover
Vite overrides:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (or leave default)
- **Output Directory:** leave **empty** (do not use `dist` — that was Vite)
- **Install Command:** `npm install` (or leave default)

Next.js on Vercel uses `.next` internally; setting Output Directory to `dist`
causes `NEXT_OUTPUT_DIR_MISSING`.

Configure `NEXT_MONGODB_URL` (and later auth secrets) as Vercel environment
variables. Never prefix secrets with `NEXT_PUBLIC_`.

```bash
npx vercel          # preview
npx vercel --prod   # production
```

Node 20 is pinned in `.nvmrc`.

## Data & the backend-swap seam

Every entity is read and written through repositories in `src/lib/repositories/`,
currently backed by `localStorage`. Methods are `async` so swapping to real
`/api/v1` Route Handlers later is a per-repository change, not a UI rewrite.

Server modules live under `src/server/` (config, database, errors, utils).
Route Handlers live under `src/app/api/v1/`. Do not import `server-only`
modules into Client Components.
