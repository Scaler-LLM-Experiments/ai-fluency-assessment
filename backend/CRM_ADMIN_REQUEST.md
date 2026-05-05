# CRM Admin Ask — AI Fluency Assessment activity codes

## What we're integrating

The AI Business Fluency Assessment (lead-gen tool for OPGP) is moving off Google Sheets onto the CRM. Backend is built and tested against staging credentials provided in the API contract doc. Two events need to flow as `ActivityEvent`s.

## Status: codes received ✅

Admin registered the activities on staging:

| Activity name | Code | Trigger |
|---|---|---|
| `AI Fluency Test Completed` | **`651`** | User finishes the 10-question assessment and lands on the score screen |
| `AI Fluency Callback Requested` | **`652`** | User clicks "Talk to a counsellor" after seeing their score |

## Custom field mapping (no admin action needed — using existing slots)

| Slot | Value |
|---|---|
| `mx_Custom_1` | program tag (`opgp_ai_fluency`) |
| `mx_Custom_2` | score (0–40) |
| `mx_Custom_3` | band (e.g. `AI Capable`) |
| `mx_Custom_4` | role (Product Manager, etc.) |
| `mx_Custom_5` | utm_source |
| `mx_Custom_6` | utm_campaign |
| `mx_Custom_7` | event timestamp (IST) |
| `mx_Custom_8` | internal user_id (UUID) |

All values truncated to 200 chars per the contract.

## Once we have the codes

We paste them into Railway as `CRM_ACTIVITY_CODE_COMPLETED` and `CRM_ACTIVITY_CODE_CALLBACK`, flip `CRM_SYNC_ENABLED=true`, and the backlog of completed assessments starts flowing within 30s. No further admin involvement needed.

## Contact

Priyansh Soni (priyansh.soni@scaler.com) — backend lives at `ai-fluency-backend-production.up.railway.app`.
