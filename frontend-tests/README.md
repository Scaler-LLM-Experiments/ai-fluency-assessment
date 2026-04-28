# Frontend tests (Playwright)

Browser-driven tests that run against the **live tool URL** (or any deployment). Used as:

1. **Baseline** before any frontend change — proves current state is healthy.
2. **Regression check** after dual-write change — same tests must still pass.
3. **Cutover validation** — same tests pass after sheet writes are removed (only the trace differs).

## Setup (once)

```
cd frontend-tests
npm install
npx playwright install chromium   # downloads the browser binary
```

## Run

```
# against live tool (default)
npm test

# against any other deployment
TEST_URL=https://staging.example.com npm test

# with browser visible
npm run test:headed
```

## What it covers

- `smoke.spec.js`
  - Tool loads with 200, login form renders
  - data.js + logo SVGs load
  - Root path redirects to `/ai-business-fluency-assessment/`
- `journey.spec.js`
  - Full user flow: login → role → 10 questions → results
  - Asserts these events fire: `started`, `role_selected`, `question_answered` (×10), `completed`
  - Logs whether each event went to the **Sheet webhook** and/or the **new backend** — so we can verify dual-write once the frontend change ships.

## Why bare-bones (no flaky waits)

The tool's screen system uses `.screen.active`, so we wait for that exact selector instead of timeouts. Each test creates a fresh user_id-bearing email, so reruns don't pollute prior data.
