# `ai-fluency-backend` branch

This branch carries the backend service + tests. **The static frontend tool stays on `main` and is unaffected.**

## Layout

```
backend/             ← Node/Express + Postgres backend
  Dockerfile
  package.json
  server.js
  test/run.js        ← integration tests
frontend-tests/      ← Playwright tests against the live tool
  tests/*.spec.js
```

## Railway service for this branch

A separate Railway service should be created with:
- **Source repo:** `Scaler-LLM-Experiments/ai-fluency-assessment`
- **Branch:** `ai-fluency-backend`
- **Root directory:** `backend`
- **Builder:** Dockerfile (auto-detected from `backend/Dockerfile`)
- **Env vars:**
  - `DATABASE_URL` — Reference from a Railway-provisioned Postgres
  - `API_TOKEN` — random 40-char string (CRM uses this as bearer)

The static tool (main branch) keeps its existing Railway service untouched.

## Cutover phases (high level)

1. Backend live + tested in isolation
2. Frontend dual-writes to Sheet + Backend
3. Parity watch (DB vs Sheet)
4. Sheet writes off → DB only
5. Backfill any sheet-only leads
6. CRM consumes `/api/leads`

See `backend/README.md` and `frontend-tests/README.md` for endpoint and test details.
