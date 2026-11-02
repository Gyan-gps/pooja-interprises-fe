# Production-readiness report (Phase 7)

Date: 2026-11-02

## What is ready

- Next.js App Router monolith with `/api/v1` business APIs
- Admin email/password auth, HttpOnly JWT session cookie + DB sessions
- Middleware gate for pages/APIs + server-side `requireAdminAuth`
- Zod validation, soft deletes, pagination caps (`pageSize` ≤ 100)
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`, Referrer-Policy, Permissions-Policy; HSTS in production)
- `poweredByHeader: false`
- Secret redaction in server error logs
- Production rejection of placeholder `AUTH_SECRET` values
- Unit tests for pagination, invoice math, document numbers, login rate limit, validations, log redaction
- DB and API verification scripts

## Verification performed

- `npm test` (Vitest unit suite)
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm run verify:api` against a running local server (when available)
- `npm audit` reviewed

## Residual risks / limitations

1. In-memory login rate limiter does not coordinate across multiple instances.
2. Acknowledgement “upload” is metadata-only (no object storage).
3. Dashboard analytics charts still show static sample data.
4. Single-org Admin model only — no per-record ownership beyond that.
5. Remaining `npm audit` findings are mainly transitive (notably Next 15 → postcss). Critical tinypool issue mitigated via `overrides`. Do not `npm audit fix --force` onto Next 16 without a planned upgrade.

## Do not deploy until

The operator explicitly approves a deployment plan (hosting, secrets, Mongo access, backups, and monitoring).
