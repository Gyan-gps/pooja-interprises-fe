# Pooja Enterprises — Operations Dashboard

Internal dashboard for Pooja Enterprises (Printing & Publishing, Pune): orders, clients,
production tracking, staff tasks and reports.

Migrated to **Next.js App Router**. The public website, authentication, and backend APIs
are planned for later phases — see `pooja-enterprises-nextjs-architecture.md`.

## Stack

Next.js 15 · React 18 · TypeScript · Tailwind CSS 4 · Recharts · lucide-react

## Scripts

```bash
npm install     # install dependencies
npm run dev     # start the Next.js dev server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Structure

```
src/
├── app/
│   ├── (dashboard)/dashboard/   Dashboard routes under /dashboard/*
│   ├── layout.tsx               Root server layout
│   ├── page.tsx                 Redirects / → /dashboard
│   ├── globals.css
│   └── not-found.tsx
├── features/                    Feature UI (dashboard, orders, clients, …)
├── components/
│   ├── ui/                      Shared UI primitives
│   ├── layouts/                 Dashboard shell (sidebar, header)
│   └── providers/               Client providers (data, toast)
├── hooks/
├── lib/                         Repositories, context, utils (localStorage today)
├── types/
└── styles/                      Fonts, Tailwind entry, theme tokens
```

## Routes

- `/` → redirects to `/dashboard`
- `/dashboard` — overview
- `/dashboard/orders`, `/dashboard/orders/[id]`
- `/dashboard/clients`, `/dashboard/clients/[id]`
- `/dashboard/production` — Kanban board
- `/dashboard/staff`, `/dashboard/staff/[id]`
- `/dashboard/reports` — CSV export
- `/dashboard/settings`
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

```bash
npx vercel          # preview
npx vercel --prod   # production
```

Node 20 is pinned in `.nvmrc`. When the API is wired up, use `NEXT_PUBLIC_` for
client-exposed variables and keep secrets server-only (see `.env.example`).

## Data & the backend-swap seam

Every entity is read and written through repositories in `src/lib/repositories/`,
currently backed by `localStorage`. Methods are `async` so swapping to real
`/api/v1` Route Handlers later is a per-repository change, not a UI rewrite.

Future server modules belong under `src/server/` and API handlers under
`src/app/api/v1/` — do not add empty placeholders until those features are built.
