# CRM Integration Guide

How the in-house CRM consumes leads from the AI Fluency backend.

- **Base URL:** `https://ai-fluency-backend-production.up.railway.app`
- **Auth:** every read endpoint requires `Authorization: Bearer <API_TOKEN>`
- **Response format:** JSON, UTF-8, all timestamps in ISO 8601 (`created_at`, `updated_at`) plus IST mirror fields (`first_seen_ist`, `last_seen_ist`)

## Endpoints the CRM uses

### `GET /api/leads`
List leads, newest-updated first. Use `since` for incremental polling.

| Query param | Type | Notes |
|---|---|---|
| `since`     | ISO timestamp | `updated_at >= since` — use the max `updated_at` from your last sync |
| `status`    | string | `started` \| `in_assessment` \| `in_assessment (Q3/10)` \| `completed` |
| `callback`  | `true` | only leads who clicked "request callback" |
| `limit`     | int | default 100, max 1000 |
| `offset`    | int | for pagination |

```
curl -s "$BASE/api/leads?since=2026-04-30T00:00:00Z&limit=500" \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "count": 47,
  "leads": [
    {
      "user_id": "26caea2c-...",
      "name": "Asha Kumar",
      "email": "asha@example.com",
      "phone": "9999999999",
      "role": "Product Manager",
      "status": "completed",
      "score": 32,
      "band": "AI Capable",
      "last_question": 10,
      "completed": true,
      "requested_callback": true,
      "clicked_curriculum": false,
      "retook_test": false,
      "traffic_source": "google",
      "utm_source": "google",
      "utm_medium": "cpc",
      "utm_campaign": "opgp_q2",
      "utm_term": "",
      "utm_content": "",
      "referrer": "https://google.com/",
      "first_seen_ist": "2026-04-30 14:02:11",
      "last_seen_ist": "2026-04-30 14:14:47",
      "created_at": "2026-04-30T08:32:11.510Z",
      "updated_at": "2026-04-30T08:44:47.821Z"
    }
  ]
}
```

### `GET /api/leads/:user_id`
Single lead with full event timeline — every `started`, `role_selected`, `question_answered`, `completed`, `requested_callback`, `clicked_curriculum`, `retook_test` event with timestamp + payload.

Use this when a BDA opens a lead in the CRM and needs to see what they answered.

```json
{
  "lead": { ... same shape as above ... },
  "events": [
    { "id": 1, "event": "started",          "timestamp_ist": "2026-04-30 14:02:11", "payload": { ... } },
    { "id": 2, "event": "role_selected",    "timestamp_ist": "2026-04-30 14:02:34", "payload": { "role": "Product Manager" } },
    { "id": 3, "event": "question_answered","question_number": 1, "answer_level": "3", ... },
    ...
    { "id":13, "event": "completed",        "score": 32, "band": "AI Capable", ... }
  ]
}
```

### `GET /api/stats`
Aggregate counts. Cheap, safe to poll for dashboard tiles.

```json
{ "total": 1247, "completed": 412, "callbacks": 87, "avg_score": 23.6 }
```

## Recommended polling pattern

1. CRM stores the last successful sync timestamp `T`.
2. Every N seconds: `GET /api/leads?since=T&limit=1000`.
3. Upsert each row into the CRM (PK = `user_id`).
4. Set new `T = max(updated_at)` from the response.
5. If the response had `count == limit`, page with `offset` until exhausted before advancing `T`.

`updated_at` advances on every event for that lead, so this catches both new leads and progressive updates (e.g. status moving from `in_assessment` to `completed`).

## Field semantics — cheat sheet for BDAs

| Field | What it tells the BDA |
|---|---|
| `status` | Where the user dropped off in the funnel |
| `last_question` | If `< 10`, they abandoned mid-assessment |
| `score`, `band` | Only present once `completed = true`. Bands: `AI Beginner`, `AI Aware`, `AI Capable`, `AI Fluent`, `AI Native` |
| `requested_callback` | Hot signal — user actively asked us to call |
| `clicked_curriculum` | Warm signal — user opened the OPGP curriculum link |
| `retook_test` | Engaged user, came back for a second pass |
| `traffic_source` + `utm_*` | Where the lead came from — feed into attribution |

## Error responses

| Status | Meaning |
|---|---|
| 401 | Missing or wrong bearer token |
| 404 | `/api/leads/:user_id` — no lead with that id |
| 500 | DB error — body has `{ error: "..." }` |
| 503 | DB disabled (should not happen in prod) |

## Operational notes

- Bearer token rotation: change `API_TOKEN` in Railway env, redeploy, distribute the new token to the CRM.
- `/api/track` is intentionally open + CORS-`*` because the static frontend POSTs from the browser. Don't put a token check there or events will silently drop.
- Schema changes are backward-compatible by convention — new columns are added as nullable, existing columns are not renamed. CRM should ignore unknown fields rather than fail closed.
