# Deployment and operations

## Runtime assumptions

- Node.js 20 (see `.nvmrc`)
- MongoDB 6+ reachable from the app
- Single Admin organization (no multi-tenant isolation yet)
- Prefer a single long-lived Node process or a platform that reuses warm instances (Vercel / container)

## Required environment variables

| Variable | Required | Notes |
|---|---|---|
| `NEXT_MONGODB_URL` | yes | Mongo connection string |
| `AUTH_SECRET` | yes | ≥32 chars; must not look like a placeholder in production |
| `SESSION_TTL_DAYS` | no | Default `7` (1–90) |
| `NODE_ENV` | set by host | `production` enables Secure cookies + HSTS |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | seed only | Used by `npm run seed:admin` |

Never prefix secrets with `NEXT_PUBLIC_`.

## Build and start

```bash
npm install
npm run build
npm run start
```

Health probe:

```bash
curl -fsS "$ORIGIN/api/v1/health"
```

## Vercel

1. Framework: Next.js
2. Build command: `npm run build`
3. Output directory: leave empty (do not use `dist`)
4. Set `NEXT_MONGODB_URL` and `AUTH_SECRET` in project env
5. Root Directory: `pooja-interprises-fe` if this app is a monorepo subfolder

Login rate limiting is in-memory per process. On multi-instance platforms, replace it with Redis (or similar) before high-traffic production use.

## Database backup and restore

### Backup (mongodump)

```bash
mongodump --uri="$NEXT_MONGODB_URL" --out="./backups/$(date +%F)"
```

### Restore (mongorestore)

```bash
mongorestore --uri="$NEXT_MONGODB_URL" --drop "./backups/YYYY-MM-DD"
```

Recommendations:

- Schedule daily dumps for production data.
- Test restore into a staging database before relying on a backup.
- Soft-deleted documents remain in collections; backups include them unless you filter.
- Counters (`counters` collection) must be restored with orders/invoices to avoid number collisions.

## Security checklist before go-live

- [ ] Strong unique `AUTH_SECRET`
- [ ] MongoDB network access restricted
- [ ] TLS terminated at the edge / HTTPS only
- [ ] Admin password rotated from any seed default
- [ ] `npm audit` reviewed
- [ ] Health check monitored
- [ ] Backups verified

## Known limitations

- No binary file upload storage yet (delivery acknowledgement stores a URL/name string).
- Login rate limit is process-local.
- Dashboard chart widgets still use static sample series for monthly/client distribution.
- No multi-role authorization beyond Admin.
