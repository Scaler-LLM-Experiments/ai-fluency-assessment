# Backend tests

Plain Node script — no test framework dependency. Runs against any `API_URL`.

## Run locally

```
cd backend
npm install
# Start the server in one terminal:
DATABASE_URL=postgres://localhost/aifluency API_TOKEN=test node server.js

# Run tests in another:
API_URL=http://localhost:8080 API_TOKEN=test npm test
```

## Run against live Railway backend

```
API_URL=https://ai-fluency-backend.up.railway.app API_TOKEN=<the-real-token> npm test
```

## What it covers

1. `/health` returns 200 + correct shape
2. `/` returns service identity
3. CORS preflight returns 204 with proper headers
4. `/api/leads` blocks unauthed requests (401 or 503)
5. `/api/leads` blocks bad tokens
6. **Full lifecycle**: started → role_selected → 10× question_answered → completed → requested_callback. Reads it back via `/api/leads/:user_id`. Verifies all fields persisted, event timeline ≥13.
7. **Idempotency**: same `user_id` posted twice = one lead row
8. List + filters (`limit`, `callback=true`)
9. 404 on unknown `user_id`
10. `/api/stats` returns aggregates

If `API_TOKEN` is unset, authed tests are skipped (smoke checks still run). If DB is disabled on the target, write-then-read tests gracefully no-op.
