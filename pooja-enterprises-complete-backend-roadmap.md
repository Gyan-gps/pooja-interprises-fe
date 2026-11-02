# Pooja Enterprises — Complete Backend Implementation Roadmap

## Operating rule: strict phase-by-phase execution

**This file is the single source of instructions for the complete backend implementation.**

The AI coding assistant (Cursor) must follow these rules without exception:

1. Start with **Phase 1 only**.
2. Do not implement, scaffold, partially implement, or make anticipatory changes for any later phase.
3. At the end of the current phase:
   - run the relevant checks;
   - review the complete diff;
   - summarize files changed, decisions, tests, results, and any unresolved issues;
   - stop and ask the user to enter exactly: `next` to begin the next phase.
4. **Do not continue automatically.** Do not interpret silence, approval, "looks good", or any other wording as permission to advance.
5. Advance only when the user sends `next` as a standalone instruction.
6. When the user enters `next`, begin only the immediately following phase. Do not skip phases.
7. If the user asks a question, requests a correction, or reports a problem instead of entering `next`, handle that request within the current phase and remain on that phase.
8. If a phase is incomplete or its checks fail, do not ask to advance as though it were complete. Explain what remains and resolve it first.
9. Never redo a completed phase unless the user explicitly requests changes to it.
10. Keep this phase state in the conversation. At the beginning of each session, identify the last completed phase from the conversation. If the state is unclear, ask the user rather than guessing.

### Required stop message

After a phase is successfully completed, end with a concise message in this format:

> **Phase N completed.**  
> Summary: [short summary]  
> Verification: [checks and results]  
> Issues: [none, or list]  
>
> The next phase is **Phase N+1: [name]**. I will not start it until you enter `next`.

---

# 1. Project context and fixed technology decisions

- Project: **Pooja Enterprises**
- Existing frontend: `C:\Users\Rahul\Desktop\pooja-interprises\pooja-interprises-fe`
- The existing frontend has already been migrated to Next.js, and the user has confirmed that the pages and existing functionality work.
- Existing dashboard pages are under `/dashboard`.
- Preserve the current UI, routes, behavior, and working features unless a change is explicitly required and approved.
- The application is intended to support dashboard pages now and public website pages in the future.
- Use **Next.js App Router as the full-stack framework**. Do not create a separate Express backend.
- Language: **TypeScript**.
- Database: **MongoDB**.
- ODM: **Mongoose**.
- Validation: **Zod**.
- Backend endpoints: Next.js Route Handlers, organized under `/api/v1/`.
- Architecture: modular monolith, feature-oriented, maintainable, secure, and suitable for production.
- Dashboard experience: retain the existing client-side interactive experience where needed. Do not turn the entire application into a Client Component.
- Future public pages should use Server Components and suitable SSR/SSG behavior where appropriate.
- Do not assume business requirements, entities, roles, permissions, or workflows. Inspect the existing application and ask the user when business decisions are unclear.

## Primary engineering goals

- Production-quality code, not a quick prototype.
- Clear separation between UI, API transport, business logic, data access, and infrastructure.
- Strong TypeScript types; avoid `any`.
- Centralized validation and consistent error handling.
- Secure server-only access to database credentials and privileged operations.
- Small, reusable abstractions; avoid overengineering and unnecessary dependencies.
- Preserve backward compatibility wherever practical.
- Every change must be understandable, testable, and documented.

---

# 2. Mandatory naming and code-quality standards

Apply these standards to **every new or modified** variable, function, method, parameter, prop, type, interface, class, constant, file, folder, schema, model, and API resource.

| Element | Convention | Examples |
|---|---|---|
| Variables | `camelCase` | `databaseConnection`, `orderCount` |
| Functions | Verb-led `camelCase` | `connectToDatabase()`, `getOrderById()` |
| Methods | Verb-led `camelCase` | `findCustomerById()` |
| Parameters | Descriptive `camelCase` | `customerId`, `pageSize` |
| React components | `PascalCase` | `DashboardHeader` |
| Props | Descriptive `camelCase` | `customerName`, `isLoading` |
| Types/interfaces | `PascalCase` | `CreateOrderInput` |
| Classes | `PascalCase` | `DatabaseError` |
| True constants | `UPPER_SNAKE_CASE` | `DEFAULT_PAGE_SIZE` |
| Enum names | `PascalCase` | `OrderStatus` |
| Files | `kebab-case` | `mongodb-connection.ts` |
| Folders | `kebab-case` | `order-management/` |
| Mongoose models | Singular `PascalCase` | `Customer`, `Order` |
| Mongoose schemas | `camelCase` | `customerSchema` |
| Database fields | `camelCase` | `createdAt`, `customerId` |
| Environment variables | `UPPER_SNAKE_CASE` | `NEXT_MONGODB_URL` |

Additional rules:

- Prefer complete words: `customer`, not `cust`; `quantity`, not `qty`. Accepted technical terms such as `API`, `URL`, `HTTP`, and `ID` are allowed.
- Boolean names should communicate state or capability: `isActive`, `hasPermission`, `canEdit`, `shouldRetry`.
- Event handlers should use `handle` prefixes, such as `handleSubmit`.
- Use consistent business terminology. Do not interchange terms such as customer, buyer, supplier, and vendor unless they represent distinct concepts.
- Use singular names for one entity and plural names for collections.
- Avoid vague names such as `data`, `item`, `value`, `temp`, `result`, or `response` when a meaningful domain name is available.
- Avoid misleading names, unnecessary abbreviations, and unnecessary `I` prefixes or `Impl` suffixes.
- Do not rename existing public exports, API routes, or database fields casually. If a rename is necessary, update all references and preserve compatibility.
- Do not create generic helper layers that add no meaningful value.
- Before completing each phase, review all changed files for naming consistency, TypeScript quality, duplication, unused code, and accidental behavior changes.

---

# 3. Target architecture

This is the intended architectural direction, not a requirement to create every folder immediately. Create folders and files only when they are needed by the active phase.

```text
src/
├── app/
│   ├── (public)/
│   ├── (dashboard)/
│   │   └── dashboard/
│   ├── api/
│   │   └── v1/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── shared/
│   └── layouts/
├── features/
│   └── [business-feature]/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── types/
│       └── validations/
├── server/
│   ├── config/
│   ├── database/
│   ├── models/
│   ├── repositories/
│   ├── services/
│   ├── auth/
│   ├── errors/
│   └── utils/
├── lib/
│   ├── api/
│   ├── validations/
│   └── utils/
├── hooks/
├── types/
└── config/
```

Architecture boundaries:

- `app/`: route composition, layouts, pages, and Route Handlers. Keep business logic out of route files.
- `features/`: feature-specific UI, client-side hooks, types, and frontend-facing service logic.
- `server/`: server-only configuration, database access, models, repositories, business services, authentication, and backend utilities.
- `components/`: genuinely shared UI components and layouts.
- `lib/`: cross-cutting utilities that are safe for their intended runtime.
- Route Handlers should validate input, call the appropriate server service, and translate the result into an HTTP response.
- Services own business rules and coordinate repositories.
- Repositories own database queries and persistence operations.
- Mongoose models define persistence schemas; they must not become the place for all business logic.
- Never import server-only modules into Client Components.
- Never expose database credentials, secrets, private tokens, or privileged server logic to the browser.

---

# 4. Phase 1 — Backend foundation and project structure

## Objective

Establish a safe, reusable backend foundation inside the existing Next.js application without implementing business features.

## First inspect; do not edit immediately

Inspect and report:

- Next.js, React, and TypeScript versions.
- Package manager and available scripts.
- Existing folder structure and route organization.
- Existing dashboard route behavior.
- TypeScript and lint configuration.
- Existing environment-variable conventions.
- Existing MongoDB or Mongoose packages and code, if any.
- Existing validation, API response, and error utilities.
- Existing tests and build process.
- Any code that could conflict with the proposed backend foundation.

After the audit, implement only the minimum foundation required below. Reuse existing working utilities where appropriate.

## Scope

1. Establish a clean server-only backend directory structure.
2. Add or verify MongoDB/Mongoose dependencies only if needed.
3. Implement a reusable MongoDB connection utility with safe connection/promise caching for local development hot reload.
4. Avoid connecting to MongoDB at module import time.
5. Validate required environment variables with Zod.
6. Add a tracked `.env.example` containing placeholders only.
7. Keep `.env.local` and real credentials out of version control.
8. Add a server-only boundary for database and privileged modules where appropriate.
9. Add `GET /api/v1/health`.
10. The health endpoint should perform a lightweight database ping and return an accurate success or failure HTTP status.
11. Add small reusable API response/error utilities only if they are useful to the current codebase.
12. Update the README with setup instructions and naming conventions.

Example environment template:

```env
NODE_ENV=development
NEXT_MONGODB_URL=mongodb://127.0.0.1:27017/pooja-enterprises
```

Suggested foundation files (adapt to the existing structure):

```text
src/
├── app/api/v1/health/route.ts
├── server/
│   ├── config/env.ts
│   ├── database/mongodb.ts
│   ├── errors/
│   └── utils/
├── lib/
│   └── validations/
└── types/
```

Suggested function names:

- `connectToDatabase()`
- `getDatabaseHealth()`
- `createSuccessResponse()`
- `createErrorResponse()`
- `handleApiError()`

Do not add all suggested utilities if they are not needed.

## Explicit exclusions

Do not implement:

- Authentication or login.
- Roles or permissions.
- Business models or schemas.
- Customer, supplier, product, inventory, purchase, sales, invoice, payment, or order APIs.
- Dashboard integration with backend data.
- Seed data.
- New business workflows.

## Verification and completion criteria

- MongoDB connection succeeds with valid configuration.
- Health endpoint reports success when the database is reachable.
- Health endpoint reports failure accurately when the database is unavailable.
- No secrets or stack traces are leaked in API responses or logs.
- Connection handling does not create unnecessary connections during hot reload.
- Existing dashboard pages still work.
- TypeScript, lint, tests (if configured), and production build pass.
- Review the full Git diff and confirm no unrelated changes.

**Stop after Phase 1. Ask the user to enter `next` before Phase 2.**

---

# 5. Phase 2 — Business workflow discovery and database design

## Objective

Understand the actual Pooja Enterprises business before creating database models.

## Mandatory discovery

Inspect the existing dashboard pages, forms, tables, navigation, labels, validations, and current static/mock data. Build an inventory of:

- Existing modules and pages.
- Actions users can perform.
- Data captured by each form.
- Relationships implied by the UI.
- Search, filtering, sorting, pagination, and reporting requirements.
- Existing user types and access expectations, without assuming final permissions.
- Any import/export, attachment, or document requirements.

Then present a proposed business workflow and data dictionary to the user for review.

Ask focused questions for missing business rules. Do not invent answers.

## Database design deliverables

After the user clarifies the requirements:

1. Identify entities and their responsibilities.
2. Define relationships and ownership.
3. Define required, optional, unique, indexed, and immutable fields.
4. Define status values and allowed state transitions.
5. Define audit fields such as `createdAt`, `updatedAt`, and, where justified, `createdBy` and `updatedBy`.
6. Decide where to use references versus embedded documents based on access patterns and lifecycle.
7. Plan indexes based on actual queries.
8. Define pagination and list-query expectations.
9. Consider soft deletion only where business requirements justify it.
10. Document data retention and historical-record requirements if applicable.

## Deliverables

- Reviewed workflow summary.
- Entity relationship overview.
- Data dictionary.
- Mongoose schema/model plan.
- Index plan.
- Open questions and decisions.

Do not implement authentication or business APIs in this phase. Do not create models until the user has reviewed and approved the proposed design.

**Stop after Phase 2. Ask the user to enter `next` before Phase 3.**

---

# 6. Phase 3 — Mongoose models and database layer

## Objective

Implement the approved database design.

## Scope

1. Create Mongoose schemas and models only for approved entities.
2. Apply the agreed field types, required rules, defaults, enums, and validation.
3. Add indexes from the approved index plan.
4. Define references and population strategy carefully.
5. Add timestamps where appropriate.
6. Implement reusable repositories for actual persistence operations.
7. Keep database queries out of Route Handlers and UI components.
8. Handle duplicate-key and validation errors consistently.
9. Avoid unnecessary population and unbounded queries.
10. Add model and repository tests where the project supports testing.

## Data safety

- Never run destructive migrations or delete existing database data without explicit user approval.
- Do not create production seed data.
- Do not store secrets in source code.
- Do not silently change approved field names or business meanings.
- If a schema decision needs to change, explain the reason and request approval first.

## Verification

- Models compile and initialize correctly.
- Schema validations behave as intended.
- Indexes match the approved plan.
- Repository operations are tested.
- No unintended database writes occur during build or module import.
- Existing frontend behavior remains intact.

**Stop after Phase 3. Ask the user to enter `next` before Phase 4.**

---

# 7. Phase 4 — Authentication, sessions, and authorization

## Objective

Implement secure access based on the user types and permissions confirmed during Phase 2.

## Before implementation

Confirm with the user:

- Required user types.
- Login identifier (email, phone, username, or another approved option).
- Password or OTP requirements.
- Session lifetime and logout behavior.
- Password reset or account recovery requirements.
- Whether multiple devices are allowed.
- Permission rules for each module and action.
- Any account activation, suspension, or approval workflow.

Do not assume that a role name automatically grants a particular permission.

## Scope

1. Select a suitable authentication approach for the current Next.js architecture.
2. Implement secure credential handling if passwords are used.
3. Hash passwords with a suitable password-hashing algorithm; never store plaintext passwords.
4. Implement secure session or token handling.
5. Use secure cookie settings appropriate to the deployment environment.
6. Implement logout and session invalidation.
7. Implement authorization checks on the server for protected operations.
8. Add role/permission checks only from the approved access matrix.
9. Protect dashboard pages and API endpoints.
10. Add rate limiting or abuse protection where appropriate and feasible.
11. Avoid leaking whether sensitive accounts exist through authentication errors.
12. Add tests for authentication and authorization boundaries.

## Security requirements

- Client-side route hiding is not authorization.
- Every protected API operation must enforce authorization on the server.
- Never trust user IDs, roles, or permissions supplied by the browser.
- Do not expose password hashes, session secrets, or tokens in API responses or logs.
- Do not store long-lived sensitive tokens in browser local storage.
- Keep authentication secrets in server-only environment variables.

## Verification

Test valid login, invalid login, logout, expired/invalid sessions, unauthorized access, and each approved permission boundary.

**Stop after Phase 4. Ask the user to enter `next` before Phase 5.**

---

# 8. Phase 5 — Business services and API implementation

## Objective

Implement backend business workflows and versioned APIs using the approved models and business rules.

## Scope

For each approved module:

1. Define request and response contracts.
2. Define Zod validation schemas.
3. Implement server-side business services.
4. Implement repository operations.
5. Add Route Handlers under `/api/v1/`.
6. Enforce authentication and authorization where required.
7. Apply consistent success and error response formats.
8. Use correct HTTP methods and status codes.
9. Add pagination, filtering, sorting, and search only as required by the UI and business workflow.
10. Validate IDs and query parameters.
11. Handle concurrency and duplicate operations where relevant.
12. Add audit logging for important actions where approved.
13. Add tests for normal, invalid, unauthorized, and edge-case flows.
14. Document endpoints and example payloads.

## API design requirements

- Keep Route Handlers thin.
- Do not place business logic in route files or Mongoose models.
- Validate all untrusted input on the server.
- Do not trust client-provided totals, prices, permissions, ownership, or status transitions.
- Derive sensitive values on the server.
- Do not return internal database fields unless required.
- Avoid leaking stack traces, secrets, or internal implementation details.
- Use transactions only when the business operation requires atomic multi-document changes and the MongoDB deployment supports them.
- Make retry-sensitive operations safe where appropriate.

Implement only approved workflows. Do not create speculative endpoints.

## Verification

- Test each endpoint and business workflow.
- Confirm response contracts and status codes.
- Confirm server-side authorization.
- Confirm validation and error handling.
- Confirm pagination and filtering behavior.
- Confirm no unrelated UI or route regressions.

**Stop after Phase 5. Ask the user to enter `next` before Phase 6.**

---

# 9. Phase 6 — Connect the dashboard to real APIs

## Objective

Replace existing mock/static dashboard data with real backend data without changing the established design unnecessarily.

## Scope

1. Audit each dashboard page and identify its data dependencies.
2. Map each UI action to an approved API endpoint.
3. Create a consistent frontend API client or feature-level API modules.
4. Keep API request/response types aligned with backend contracts.
5. Use the appropriate server-side or client-side fetching strategy for each page.
6. Add loading, empty, error, success, and retry states.
7. Implement form submission and server validation feedback.
8. Implement pagination, filtering, sorting, and search as supported by the API.
9. Prevent duplicate submissions where necessary.
10. Refresh or invalidate stale data after mutations.
11. Handle session expiry and unauthorized responses safely.
12. Preserve current responsive behavior and UI components.
13. Remove mock data only after the corresponding real API integration is verified.

## Frontend requirements

- Do not put secrets or database access in frontend code.
- Do not duplicate business rules in the browser as the source of truth.
- Do not use `any` to bypass API typing.
- Avoid unnecessary global state.
- Keep feature-specific API logic organized within the relevant feature.
- Do not redesign the dashboard unless explicitly requested.

## Verification

- Test each dashboard module against real API responses.
- Test loading, empty, error, validation, and success states.
- Test protected pages and session expiry.
- Confirm existing navigation and UI behavior.
- Confirm no remaining mock data is used unintentionally in completed integrations.

**Stop after Phase 6. Ask the user to enter `next` before Phase 7.**

---

# 10. Phase 7 — Security hardening, testing, and production readiness

## Objective

Review the complete application for reliability, security, maintainability, and deployment readiness.

## Security review

- Environment-variable and secret handling.
- Authentication and authorization on every protected server operation.
- Input validation and output shaping.
- Injection and unsafe query risks.
- Rate limiting and abuse protection.
- CORS and security headers, if applicable to the deployment architecture.
- Cookie and session settings.
- File upload validation and storage permissions, if uploads exist.
- Sensitive information in logs and error responses.
- Dependency vulnerabilities.
- Access control for records belonging to different users or organizations, if applicable.

## Reliability and performance

- Database connection lifecycle.
- Query performance and indexes.
- Pagination limits.
- N+1 or excessive population patterns.
- Appropriate caching and cache invalidation.
- Large payload handling.
- Error boundaries and graceful failure.
- Logging and operational visibility.
- Build and runtime behavior in the intended hosting environment.

## Testing

Add or complete appropriate tests:

- Unit tests for business services and utilities.
- Repository/database integration tests.
- API integration tests.
- Authentication and authorization tests.
- Critical end-to-end dashboard workflows, if test infrastructure supports them.

Do not claim coverage for tests that were not actually run.

## Documentation and deployment preparation

- Update README setup instructions.
- Document environment variables without real secrets.
- Document API conventions and important workflows.
- Document database backup and restore considerations.
- Document build/start commands.
- Document deployment assumptions and required environment configuration.
- Confirm production build and lint/type checks.

## Final verification

- Run available tests.
- Run lint.
- Run TypeScript checks.
- Run production build.
- Review the full Git diff.
- Check for secrets, debug code, unused files, and accidental changes.
- Provide a concise production-readiness report with known limitations.

**Stop after Phase 7. Do not deploy to production unless the user separately asks and approves the deployment plan.**

---

# 11. Global rules for every phase

These rules apply throughout the project:

1. **Audit before editing.** Understand the existing implementation before changing it.
2. **One phase at a time.** Never work ahead.
3. **Explicit user gate.** The next phase starts only after the user enters `next` as a standalone message.
4. **Preserve working behavior.** Do not break existing dashboard functionality.
5. **No guessed business logic.** Ask the user when requirements are missing.
6. **No unnecessary rewrites.** Modify only what the active phase requires.
7. **No unapproved destructive operations.** Never delete data, reset databases, or run destructive migrations without explicit approval.
8. **Security by default.** Keep secrets and privileged operations on the server.
9. **Consistent naming.** Follow the naming standards in this document.
10. **Type safety.** Avoid `any`, unsafe casts, and ignored TypeScript errors.
11. **Dependency discipline.** Reuse existing dependencies and add new ones only when justified.
12. **No fake verification.** Report only commands and tests that were actually executed.
13. **Diff review.** Inspect all changed files before declaring a phase complete.
14. **Documentation.** Update relevant documentation in the active phase.
15. **Report uncertainty.** Explain assumptions and ask before making important architectural or business decisions.

# 12. How to start

When this file is given to Cursor:

- Read this entire document.
- Inspect the current repository and confirm the project context.
- Determine which phase is currently active from the conversation. If there is no previous phase history, start at Phase 1.
- Execute **Phase 1 only**.
- Do not start Phase 2 in the same run, even if Phase 1 finishes quickly.
- At completion, provide the required summary and ask the user to enter `next`.
