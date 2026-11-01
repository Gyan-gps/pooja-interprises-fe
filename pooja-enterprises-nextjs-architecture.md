# Pooja Enterprises --- Next.js Architecture Guide

## 1. Project Objective

Migrate the existing frontend project:

`C:\Users\Rahul\Desktop\pooja-interprises\pooja-interprises-fe`

to **Next.js using the App Router**, while preserving the current UI,
design system, routes, and functionality.

The application will eventually become a single full-stack Next.js
application containing:

1.  A public-facing website.
2.  An authenticated dashboard.
3.  Backend API endpoints and server-side business logic.
4.  Database access and external service integrations.

For the current phase, migrate and stabilize the existing dashboard
only. Do not implement the public website, authentication, database, or
backend business functionality yet.

## 2. Architecture Decisions

  Concern               Decision
  --------------------- -------------------------------------------
  Framework             Next.js App Router
  Language              TypeScript
  Architecture          Modular monolith
  Dashboard URL         `/dashboard`
  Dashboard rendering   Client-rendered experience
  Public website        Future root-level routes
  Backend               Future Next.js Route Handlers
  API versioning        `/api/v1/`
  Business logic        Service layer
  Data access           Repository layer
  Validation            Zod (when needed)
  Styling               Preserve the existing styling system
  Database              Decide when backend implementation begins

Use the latest stable Next.js conventions that are compatible with the
project's dependencies. Do not upgrade or replace libraries without
checking compatibility and migration impact.

## 3. High-Level Application Architecture

``` text
                    NEXT.JS APPLICATION
                   (Single codebase)
                            |
           +----------------+----------------+
           |                |                |
           v                v                v
     PUBLIC WEBSITE      DASHBOARD        BACKEND
      (Future)          (Current)         (Future)
           |                |                |
       /, /about,       /dashboard,       /api/v1/*
       /contact         /dashboard/*
                            |
                            v
                    SHARED COMPONENTS
                            |
                            v
                    SERVICE / API LAYER
                            |
                            v
                  SERVER-SIDE BUSINESS LOGIC
                            |
                            v
                    REPOSITORY LAYER
                            |
                            v
                  DATABASE / INTEGRATIONS
```

The application should follow a **modular monolith** approach: one
deployable Next.js application, with clear boundaries between features
and server-side responsibilities.

## 4. Recommended Folder Structure

Use this as the target architecture. Create folders when they are
needed; do not create large numbers of empty placeholder directories.

``` text
pooja-interprises-fe/
├── public/
│   ├── images/
│   ├── icons/
│   └── assets/
│
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   └── contact/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx
│   │   │       ├── orders/
│   │   │       │   └── page.tsx
│   │   │       ├── products/
│   │   │       │   └── page.tsx
│   │   │       ├── customers/
│   │   │       │   └── page.tsx
│   │   │       └── settings/
│   │   │           └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   └── v1/
│   │   │       └── [future API route handlers]
│   │   │
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── not-found.tsx
│   │
│   ├── features/
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── customers/
│   │   └── authentication/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── shared/
│   │   └── layouts/
│   │
│   ├── services/
│   │   ├── api/
│   │   └── integrations/
│   │
│   ├── server/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── database/
│   │   └── auth/
│   │
│   ├── lib/
│   │   ├── utils/
│   │   ├── validations/
│   │   └── constants/
│   │
│   ├── hooks/
│   ├── types/
│   └── config/
│
├── .env.example
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### Folder responsibilities

-   `app/`: Next.js routing, layouts, pages, loading/error boundaries,
    and Route Handlers. Keep route files thin.
-   `features/`: Feature-specific UI, hooks, state, types, and
    feature-level logic. Organize each feature internally when its size
    justifies it.
-   `components/ui/`: Reusable low-level UI primitives.
-   `components/shared/`: Reusable components shared across multiple
    application areas.
-   `components/layouts/`: Reusable layout building blocks, where
    appropriate.
-   `services/api/`: Centralized client-side API communication and
    request configuration.
-   `services/integrations/`: Client-safe wrappers for external
    services, if required.
-   `server/`: Server-only business logic, repositories, database
    access, and authentication implementation.
-   `lib/`: General-purpose utilities, constants, and validation helpers
    that are safe to share.
-   `hooks/`: Shared React hooks. Feature-specific hooks should remain
    inside their feature.
-   `types/`: Shared application-level TypeScript types.
-   `config/`: Centralized application configuration.

Do not put secrets, database clients, or privileged server logic in
client-importable modules.

## 5. Routing Strategy

### Current dashboard routes

All existing application pages are dashboard pages and must be moved
under `/dashboard`.

Examples:

``` text
/dashboard
/dashboard/orders
/dashboard/products
/dashboard/customers
/dashboard/settings
```

The examples above are illustrative. Discover the actual pages and
routes from the existing project and preserve their functionality.

### Future public routes

Public pages will use root-level URLs:

``` text
/
/about
/contact
/products
```

The `(public)` and `(dashboard)` folders are **route groups**. Their
names do not appear in the URL.

Avoid route conflicts between public and dashboard pages. For example,
do not create two pages that resolve to the same URL.

### Future API routes

Backend endpoints will use versioned Route Handlers:

``` text
/api/v1/orders
/api/v1/products
/api/v1/customers
```

Use `route.ts` files for Route Handlers. Keep HTTP request/response
handling in the route handler and delegate business logic to server-side
services.

## 6. Rendering Strategy

### Dashboard: client-rendered experience

The dashboard should behave as a client-rendered application.

Recommended approach:

-   Keep the root `app/layout.tsx` as a Server Component.
-   Keep route-level layouts as Server Components unless they genuinely
    require client behavior.
-   Create a dedicated Client Component dashboard shell, for example
    `DashboardClientLayout.tsx`.
-   Put interactive navigation, client-side state, filters, tables,
    dialogs, forms, charts, and other browser-dependent behavior in
    Client Components.
-   Use `"use client"` only at the necessary component boundaries.
-   Centralize data fetching behind a service/API layer.
-   Preserve the existing dashboard interactions and navigation
    behavior.

Do **not** add `"use client"` to the root layout or every page by
default. A client-rendered dashboard experience does not require the
entire Next.js application to become a Client Component.

### Public website: future SSR/SSG

When public pages are implemented:

-   Prefer Server Components by default.
-   Use static generation or revalidation for content that does not need
    request-time rendering.
-   Use dynamic server rendering only when the page requires
    request-specific data.
-   Add appropriate metadata and SEO configuration.

### Backend

-   Route Handlers execute on the server.
-   Database operations and privileged integrations must remain
    server-side.
-   Never expose secrets or private environment variables to browser
    code.

## 7. Future Backend Request Flow

Use the following separation when backend functionality is introduced:

``` text
Browser / Client Component
          |
          v
Centralized API client
          |
          v
Next.js Route Handler
          |
          v
Validation and authorization
          |
          v
Server-side service
          |
          v
Repository
          |
          v
Database or external integration
```

Example future structure:

``` text
src/
├── app/
│   └── api/
│       └── v1/
│           └── orders/
│               └── route.ts
│
├── features/
│   └── orders/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
│
└── server/
    ├── services/
    │   └── order.service.ts
    ├── repositories/
    │   └── order.repository.ts
    └── database/
        └── client.ts
```

Responsibilities:

-   **Route Handler:** Parse the HTTP request, validate input, enforce
    authorization, call the service, and return an appropriate response.
-   **Service:** Implement business rules and coordinate operations.
-   **Repository:** Encapsulate database queries and persistence.
-   **Database module:** Create and manage the server-side database
    connection.
-   **API client:** Provide a consistent interface for browser-side
    requests.

Do not add these modules as empty abstractions during the current
frontend migration. Introduce them when implementing the corresponding
backend feature.

## 8. Feature Organization

Keep code close to the feature that owns it.

For example:

``` text
features/
└── orders/
    ├── components/
    ├── hooks/
    ├── services/
    ├── types/
    └── utils/
```

Use shared folders only when code is genuinely reused. Avoid moving
every component into a global `components/` directory.

Keep the separation clear:

-   UI components render the interface.
-   Hooks manage reusable client-side behavior.
-   Feature services coordinate feature-level data access.
-   Server services contain privileged business logic.
-   Repositories own database persistence.

## 9. Naming and Code Quality Standards

Use consistent, descriptive names.

  -----------------------------------------------------------------------
  Item                    Convention              Example
  ----------------------- ----------------------- -----------------------
  React components        PascalCase              `OrderTable.tsx`

  Hooks                   camelCase with `use`    `useOrders.ts`

  Utilities               camelCase               `formatCurrency.ts`

  Variables               camelCase               `orderTotal`

  Functions               camelCase               `calculateTotal()`

  Types/interfaces        PascalCase              `OrderSummary`

  Constants               UPPER_SNAKE_CASE where  `DEFAULT_PAGE_SIZE`
                          appropriate             

  Route folders           lowercase               `orders/`

  Route files             Next.js conventions     `page.tsx`,
                                                  `layout.tsx`,
                                                  `route.ts`
  -----------------------------------------------------------------------

Additional standards:

-   Use strict TypeScript where practical.
-   Avoid `any`; use proper types or `unknown` with narrowing.
-   Avoid duplicate components and repeated business logic.
-   Keep components focused and reasonably small.
-   Handle loading, empty, success, and error states.
-   Remove unused dependencies only after verifying they are not needed.
-   Do not introduce abstractions without a concrete use case.
-   Preserve accessibility and responsive behavior.

## 10. API and Data-Fetching Rules

During the current migration:

-   Preserve existing data sources and mock/static data behavior.
-   Separate data-fetching logic from presentation components.
-   Avoid embedding API URLs or request logic throughout the UI.
-   Define TypeScript types for data consumed by components.
-   Keep the interface ready for a future API implementation.

When backend development starts:

-   Use the centralized API client for browser requests.
-   Use server-side services directly from Server Components or Route
    Handlers where appropriate.
-   Do not call your own Route Handlers from server-side code when a
    direct service call is more appropriate.
-   Validate all incoming data on the server.
-   Handle errors consistently.
-   Keep API response formats predictable and documented.

## 11. Security and Configuration

Prepare for future secure implementation:

-   Store secrets in environment variables.
-   Keep private environment variables server-only.
-   Use `.env.example` with placeholder values, never real credentials.
-   Add server-only boundaries to database and privileged modules.
-   Plan authentication and role-based authorization before exposing
    protected backend operations.
-   Validate and authorize requests on the server; hiding a UI element
    is not authorization.
-   Do not implement authentication or authorization prematurely in this
    migration.

## 12. Migration Plan

Follow this sequence.

### Phase 1 --- Audit

1.  Inspect the complete existing project.
2.  Identify its framework, dependencies, scripts, build configuration,
    and styling system.
3.  Inventory every page, route, layout, component, asset, and important
    interaction.
4.  Identify routing dependencies and browser-specific behavior.
5.  Record any migration risks before changing files.

### Phase 2 --- Next.js foundation

1.  Set up Next.js App Router and TypeScript.
2.  Configure the source directory and path aliases.
3.  Establish the root layout and global styles.
4.  Configure assets and static files.
5.  Preserve compatible dependencies and styling configuration.

### Phase 3 --- Dashboard migration

1.  Move all existing pages under `/dashboard`.
2.  Implement the dashboard layout and client-rendered shell.
3.  Migrate navigation and route behavior.
4.  Migrate components, forms, tables, charts, and other interactions.
5.  Preserve the existing design system and responsive behavior.
6.  Separate data access from presentation where necessary.

### Phase 4 --- Verification

1.  Verify every migrated route.
2.  Test navigation, forms, filters, dialogs, tables, and other
    interactions.
3.  Check responsive layouts.
4.  Run linting, type checking, and production build.
5.  Fix regressions without unnecessarily changing the UI.
6.  Document any incomplete functionality or known issues.

### Phase 5 --- Future-ready boundaries

1.  Keep public routes separate from dashboard routes.
2.  Keep API route space organized under `/api/v1/`.
3.  Establish feature boundaries and shared component conventions.
4.  Document where future server-side services, repositories, database,
    and authentication modules belong.
5.  Do not implement those future modules until requested.

## 13. Non-Negotiable Migration Rules

1.  Analyze before modifying. Do not blindly copy files into a new
    structure.
2.  Preserve the existing UI, design system, business logic, and user
    experience.
3.  Do not remove existing functionality during migration.
4.  Do not implement the public website in this phase.
5.  Do not implement a real backend, database, or authentication in this
    phase.
6.  Do not turn the entire application into a Client Component.
7.  Do not expose secrets or server-only modules to client code.
8.  Do not add unnecessary dependencies or speculative abstractions.
9.  Do not invent new dashboard pages; migrate the pages that actually
    exist.
10. Keep the project buildable and testable throughout the migration.

## 14. Definition of Done

The migration is complete when:

-   The project runs successfully as a Next.js application.
-   All existing pages are accessible under `/dashboard` using
    appropriate route names.
-   Existing dashboard UI and functionality are preserved.
-   The dashboard provides the required client-rendered experience.
-   Navigation, forms, interactions, and responsive layouts work.
-   The root layout remains suitable for future public pages.
-   The codebase has clear feature, shared UI, client service, and
    future server-side boundaries.
-   Linting, type checking, and production build pass, or any
    pre-existing blockers are clearly documented.
-   The README explains how to install, run, build, and extend the
    application.

------------------------------------------------------------------------

## Cursor Agent --- Execution Instruction

Treat this document as the architecture and migration specification for
the Pooja Enterprises frontend.

Start by auditing the existing project at:

`C:\Users\Rahul\Desktop\pooja-interprises\pooja-interprises-fe`

Before making changes, report:

1.  Current framework and project structure.
2.  Existing routes and pages.
3.  Dependencies and styling approach.
4.  Components and functionality that need migration.
5.  Proposed migration mapping into the target Next.js structure.
6.  Risks, breaking changes, or compatibility concerns.

After the audit, implement the migration in small, verifiable steps.
Preserve existing functionality and run the available checks after each
major stage.

Do not skip the audit, rewrite the UI, or implement future
public/backend functionality without explicit instruction.
