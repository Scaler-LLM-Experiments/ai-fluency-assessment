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

## Operating the dual-write phase

The frontend (`main` branch, `index.html`) currently writes every event to **both** the Sheet webhook and `POST /api/track`. This is the parity-watch period before the Sheet is removed.

- **Parity check**: `API_TOKEN=... SHEET_LIST_URL=... node scripts/parity-check.js --since 2026-04-30T00:00:00Z` — reports any `user_id` missing from either side. Exits 0 on parity, 1 on drift.
- **CRM consumers**: see [CRM_INTEGRATION.md](CRM_INTEGRATION.md) for endpoint details, polling pattern, and field semantics.
- **Frontend regression test**: `frontend-tests/tests/journey.spec.js` runs a full user flow against the live tool and asserts that **both** the Sheet and the backend received all 13 expected events.

## CRM push (LeadSquared-style)

The backend can push events to a Scaler CRM tenant per the contract in `crm-api-contract.md` (received from CRM team). Implementation:

- `lib/crm.js` — 3-call client (`Lead.GetByEmailaddress`, `CreateLeadAndActivity`, `Create`) with classified errors
- `lib/crm-payloads.js` — payload builder with placeholder activity codes and `mx_Custom_*` mapping
- `lib/sync-worker.js` — polls `events` table every 30s, pushes unsynced rows, retries transient errors, fails terminally on validation

By default the worker pushes only `completed` and `requested_callback` events. Other events are marked synced as no-ops to keep BDA views uncluttered.

Schema additions on boot:
- `leads.crm_prospect_id` — cached CRM UUID per lead
- `events.crm_synced_at` / `crm_sync_attempts` / `crm_sync_error` — sync watermark + failure visibility

### Env vars to enable

| Name | Notes |
|---|---|
| `CRM_SYNC_ENABLED`            | set to `true` to start the worker |
| `CRM_BASE_URL`                | e.g. `https://sales.crm.staging.sclr.ac/api/v1` |
| `CRM_ACCESS_KEY`              | from CRM admin |
| `CRM_SECRET_KEY`              | from CRM admin |
| `CRM_ACTIVITY_CODE_COMPLETED` | numeric code from CRM admin's lookup |
| `CRM_ACTIVITY_CODE_CALLBACK`  | numeric code from CRM admin's lookup |
| `CRM_PROGRAM_TAG`             | string, default `opgp_ai_fluency` (mx_Custom_1) |
| `CRM_SEARCH_BY`               | `Phone` (default) or `Email` per CRM admin |
| `CRM_SYNC_INTERVAL_MS`        | default 30000 |
| `CRM_SYNC_BATCH`              | default 50 |
| `CRM_SYNC_MAX_ATTEMPTS`       | default 5 |

### Operations

- `GET /api/sync-failures` (bearer) — list events stuck after max attempts with their error
- `POST /api/sync-failures/:id/retry` (bearer) — reset attempts + error so the worker picks the row up again

### Tests

- `node test/run-crm-unit.js` — 43 unit tests, no Postgres required. Validates payload shape + worker state machine against an in-process mock CRM
- `DATABASE_URL=... node test/run-crm.js` — same scenarios end-to-end against real Postgres
