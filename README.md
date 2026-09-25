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
├── app/            App shell + centralized route config
├── components/
│   ├── common/     Button, Modal, StatusBadge, KPICard, PageHeader, FilterPill, form fields
│   └── layout/     MainLayout, Sidebar, Header
├── pages/          One folder per route (Dashboard, Orders, Clients, …)
├── hooks/          usePageTitle
├── lib/            Static data, style/nav constants, orders context
└── types/          Shared domain types
```

## Routes

`/` Dashboard · `/orders` · `/clients` · `/production` · `/staff` · `/reports` · `/settings` · `*` 404

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

## Data

Order/client/staff data is currently in-memory (`src/lib/data.ts`) and shared through
`OrdersProvider`. Swapping it for the API in `pooja-interprises-be` means replacing that
provider's state with fetched data — no page component changes required.
