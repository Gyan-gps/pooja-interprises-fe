# API conventions

Base path: `/api/v1`

## Response envelope

Success:

```json
{ "success": true, "data": { } }
```

Failure:

```json
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {} }
}
```

Stack traces and secrets are never returned to clients.

## Authentication

- Login: `POST /auth/login` with `{ "email", "password" }`
- Session cookie: `pe_session` (HttpOnly, `SameSite=Lax`, `Secure` in production)
- Current user: `GET /auth/me`
- Logout: `POST /auth/logout` (invalidates the current session only)
- Protected business routes require an Admin session (middleware + server `requireAdminAuth`)

Public endpoints: `/health`, `/auth/login`, `/auth/logout`.

## Pagination and filters

List endpoints accept:

| Param | Notes |
|---|---|
| `page` | 1-based, default `1` |
| `pageSize` | default `10`, max `100` |
| `search` | resource-specific free text where supported |

Resource-specific filters (status, clientId, staffId, etc.) are documented on each Zod schema under `src/lib/validations/`.

## Soft deletes

`DELETE` endpoints soft-delete (`isActive: false`). Soft-deleted records are excluded from default lists.

## Important workflows

1. **Create order** → server allocates `PJE-{year}-{seq}` and starts status history at `New`.
2. **Move production phase** → `PATCH /orders/:id/status` with optional `assignedStaffId` / `readyCount`.
3. **Record delivery** → `POST /orders/:id/delivery` (sets Delivered + acknowledgement URL string).
4. **Invoice** → totals/GST calculated on the server; issuing can move the order to `Pending for Bill`.
5. **Delete staff with active tasks** → pass `reassignTasksToStaffId` query param.

## Errors you will see

| Code | Typical cause |
|---|---|
| `UNAUTHENTICATED` | Missing/invalid session |
| `FORBIDDEN` | Non-admin role |
| `VALIDATION_ERROR` | Zod schema failure |
| `NOT_FOUND` / resource codes | Missing or soft-deleted entity |
| `RATE_LIMITED` | Too many login attempts |
| `INTERNAL_ERROR` | Unexpected server failure |
