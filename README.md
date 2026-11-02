# Pooja Enterprises — Operations Dashboard

Internal dashboard for Pooja Enterprises (Printing & Publishing, Pune): orders, clients,
production tracking, staff tasks and reports.

Built as a **Next.js App Router** modular monolith. The dashboard UI is live; backend
APIs are being added under `/api/v1/`. See `pooja-enterprises-complete-backend-roadmap.md`
for the implementation plan.

## Stack

Next.js 15 · React 18 · TypeScript · Tailwind CSS 4 · MongoDB · Mongoose · Zod · Recharts · lucide-react

## Setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` and set a real MongoDB connection string:

```env
NODE_ENV=development
NEXT_MONGODB_URL=mongodb://127.0.0.1:27017/pooja-enterprises
```

`.env`, `.env.local`, and `.env*.local` are gitignored. Never commit credentials.

## Scripts

```bash
npm install     # install dependencies
npm run dev     # start the Next.js dev server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Health check

With the dev server running and MongoDB reachable:

```bash
curl http://localhost:3000/api/v1/health
```

Success returns HTTP 200 with `{ "success": true, "data": { "status": "ok", "database": { ... } } }`.
If the database is unreachable, the endpoint returns HTTP 503.

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
- `/api/v1/health` — database health probe
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
