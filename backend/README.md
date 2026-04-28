# AI Fluency Backend

Backend API for the AI Fluency Assessment tool. Tracks lead events into Postgres and exposes them via REST API for CRM integration.

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET  | `/`             | none   | service identity |
| GET  | `/health`       | none   | liveness + DB check |
| POST | `/api/track`    | none   | ingest event from frontend (CORS-open, fire-and-forget) |
| GET  | `/api/leads`    | bearer | list leads (filters: `since`, `status`, `callback=true`, `limit`, `offset`) |
| GET  | `/api/leads/:user_id` | bearer | one lead + full event timeline |
| GET  | `/api/stats`    | bearer | aggregate counts + avg score |

## Auth

`/api/leads*` and `/api/stats` require `Authorization: Bearer <API_TOKEN>` header where `API_TOKEN` matches the env var.

## Env vars

| Name | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes (prod) | Postgres connection string. SSL auto-enabled for non-localhost. |
| `API_TOKEN`    | yes (prod) | Bearer token for read endpoints. |
| `PORT`         | no | Defaults to `8080`. Railway sets this automatically. |
| `ALLOWED_ORIGINS` | no | Comma-separated. Defaults to `*`. |

## Run locally

```
npm install
DATABASE_URL=postgres://localhost/aifluency API_TOKEN=test npm start
npm test
```

## Schema

Auto-creates on boot (idempotent). Two tables:

- `leads` — one row per `user_id` (UUID from frontend), the canonical lead record
- `events` — append-only event log, one row per `trackEvent()` call from frontend

## Deploy

Railway service watching the `ai-fluency-backend` branch builds this folder via its Dockerfile. The static frontend tool is on the `main` branch in a separate Railway service and is unaffected.
