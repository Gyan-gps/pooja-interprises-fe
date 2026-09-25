# Pooja Enterprises — Operations Dashboard

Internal dashboard for Pooja Enterprises (Printing & Publishing, Pune): orders, clients,
production tracking, staff tasks and reports.

## Stack

React 18 · Vite 6 · TypeScript · React Router 6 · Tailwind CSS 4 · Recharts · lucide-react

## Scripts

```bash
npm install     # install dependencies
npm run dev     # start the dev server
npm run build   # typecheck + production build
npm run lint    # eslint
npm run preview # serve the production build
```

## Structure

```
src/
├── app/                 App shell + centralized route config
├── components/
│   ├── common/          Button, Modal, ConfirmDialog, DataTable, StatusBadge,
│   │                    KPICard, PageHeader, FilterPill, form fields
│   └── layout/          MainLayout, Sidebar, Header
├── pages/               One folder per route; list + detail (+ modals) live together,
│                        e.g. pages/Orders/{Orders,OrderDetail}.tsx
├── hooks/               usePageTitle, useUrlState (search/filter synced to the URL)
├── lib/
│   ├── repositories/    One CRUD file per entity — the backend-swap seam, see Data below
│   ├── appDataContext.tsx  Loads the repositories, exposes create/update/delete methods
│   ├── toast.tsx        Toast notifications (create/update/delete confirmations)
│   ├── validation.ts    Shared field validators (required, mobileNumber, uniqueBy, …)
│   └── data.ts           Seed data, order/client/staff constants
└── types/               Shared domain types
```

## Routes

- `/` Dashboard
- `/orders`, `/orders/:id` (view, inline edit, delivery, status history, delete)
- `/clients`, `/clients/:id` (view, inline edit, deactivate, delete)
- `/production` — Kanban; drag to change status, click a card to open its order
- `/staff`, `/staff/:id` (profile, edit, assigned tasks, remove-with-reassignment)
- `/reports` — CSV export per tab
- `/settings` — persists via `saveSettings`
- `*` → 404

Every entity is fully CRUD-able: Orders, Clients, Staff and Tasks (assigned from the Staff
page, a staff profile, or the Dashboard's "Assign Task" action) can all be created, edited
and deleted from the UI.

## Deploying to Vercel

`vercel.json` is committed and already sets the framework, build command, output directory,
the SPA rewrite that `BrowserRouter` needs (so `/orders` survives a refresh), and immutable
caching for hashed assets.

Because this app lives in a subfolder of the repo, set **Root Directory** to
`pooja-interprises-fe` in the Vercel project settings (Settings → General → Root Directory).
Everything else is picked up automatically.

Via the dashboard: import the Git repo, set the root directory, deploy.
Via CLI, from this folder:

```bash
npx vercel          # preview deployment
npx vercel --prod   # production deployment
```

Node 20 is pinned in `.nvmrc`. There are no environment variables yet — when the API is wired
up, add `VITE_API_URL` in Vercel and read it via `import.meta.env.VITE_API_URL` (only
`VITE_`-prefixed vars are exposed to the client).

## Data & the backend-swap seam

Every entity (orders, clients, staff, tasks, settings) is read and written through a
repository in `src/lib/repositories/`, currently backed by `localStorage` (seeded once from
`src/lib/data.ts`, then persisted across refreshes and tabs). Every repository method is
`async`, even though it's synchronous today — that's deliberate: `AppDataProvider`
(`src/lib/appDataContext.tsx`) and every page call `createOrder`/`updateClient`/`deleteTask`/…
and `await` the result, so pointing a repository at `pooja-interprises-be` instead of
`localStorage` is a one-file change per entity, not a rewrite of the UI.

When that backend is ready: replace the body of each `src/lib/repositories/*Repository.ts`
file with `fetch()` calls to the matching endpoint, keeping the same function signatures
(`list`, `get`, `create`, `update`, `remove`). Nothing else in the app needs to change.
