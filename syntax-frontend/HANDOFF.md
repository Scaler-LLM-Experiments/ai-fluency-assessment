# AI Business Fluency Assessment — Syntax UI handoff

## TL;DR
Replace the static files behind `scaler.com/ai-business-fluency-assessment/` with the contents of this directory. Backend, CRM, and Google Sheet integrations stay unchanged.

## What's changing
- **UI**: Rebuilt in Scaler's Syntax design system (React 18 + Babel-standalone, single-file).
- **Same questions**, same scoring (10 questions × 5 levels = score out of 50, same band labels).
- **New section**: "What this unlocks for you" — 4 live job posts per role, mapped to assessment skills.
- **Mobile-first redesign** of landing fold + sticky callback CTA on results.

## What stays the same
- **Backend endpoint**: `POST https://ai-fluency-backend-production.up.railway.app/api/track`
- **Google Sheet webhook**: same `script.google.com/macros/...` URL
- **Event names**: `page_loaded`, `started`, `role_selected`, `question_answered`, `completed`, `requested_callback`, `clicked_curriculum`, `retook_test`
- **Payload schema**: identical (`user_id`, `event`, `name`, `email`, `phone`, `referrer`, `traffic_source`, UTM params, `score`, `band`, `skill_N_name`, `skill_N_level`, etc.)
- **URL**: `scaler.com/ai-business-fluency-assessment/` (no path change)

## Files to deploy
```
index.html
app.jsx
app.css
tokens.css
assets/                  (logos, gradients)
data/                    (per-role questions, results, hiring evidence)
fonts/                   (Clash Grotesk, Plus Jakarta Sans)
```

**Do NOT deploy**: `Dockerfile`, `screens/`, `HANDOFF.md`, `.dockerignore`

## Deploy steps (for the web team)
1. Take backup of current `/ai-business-fluency-assessment/` directory.
2. Replace files with the ones from this package (preserve directory structure).
3. Verify `index.html` cache-busting param (`?v=N`) — bump it on deploy.
4. Smoke test:
   - Load the page → DevTools Network tab should show a `POST /api/track` with `event: "page_loaded"`.
   - Submit the form → verify `event: "started"` in Network + a new row in the Google Sheet.
   - Complete the assessment → verify `event: "completed"` payload includes `score`, `band`, all 10 `skill_N_name` + `skill_N_level` fields.

## Rollback
The new UI is a drop-in replacement. To roll back, restore the backed-up directory.

## Preview URL
**https://syntax-redesign-production.up.railway.app/**

Share with stakeholders for review before swapping prod files.

## Owner
Priyansh Soni (priyansh.soni@scaler.com)
