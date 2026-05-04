// Polls events table for unsynced rows and pushes them to the CRM.
//
// Single-instance assumption (Railway runs one container). If we scale out,
// add SELECT ... FOR UPDATE SKIP LOCKED to claim rows atomically.

const { CrmError, getLeadByEmail, createLeadAndActivity, createActivity } = require('./crm');
const { shouldPush, buildCreateLeadAndActivity, buildCreateActivity } = require('./crm-payloads');

const POLL_INTERVAL_MS = Number(process.env.CRM_SYNC_INTERVAL_MS || 30_000);
const BATCH_SIZE       = Number(process.env.CRM_SYNC_BATCH       || 50);
const MAX_ATTEMPTS     = Number(process.env.CRM_SYNC_MAX_ATTEMPTS || 5);

let timer = null;
let running = false;

async function processOne(pool, eventRow) {
  const { rows } = await pool.query('SELECT * FROM leads WHERE user_id=$1', [eventRow.user_id]);
  const lead = rows[0];
  if (!lead) {
    return markFailed(pool, eventRow.id, 'lead row missing for user_id ' + eventRow.user_id, 'validation');
  }

  if (!shouldPush(eventRow.event)) {
    return markSynced(pool, eventRow.id);
  }

  let crmId = lead.crm_prospect_id;

  try {
    if (!crmId) {
      crmId = await getLeadByEmail(lead.email);
      if (!crmId) {
        crmId = await createLeadAndActivity(buildCreateLeadAndActivity(lead, eventRow));
      } else {
        await createActivity(buildCreateActivity(crmId, lead, eventRow));
      }
      await pool.query('UPDATE leads SET crm_prospect_id=$1 WHERE user_id=$2', [crmId, lead.user_id]);
    } else {
      try {
        await createActivity(buildCreateActivity(crmId, lead, eventRow));
      } catch (e) {
        if (e instanceof CrmError && e.kind === 'stale_lead') {
          // Stored id is stale. Clear it and recreate.
          await pool.query('UPDATE leads SET crm_prospect_id=NULL WHERE user_id=$1', [lead.user_id]);
          const fresh = await createLeadAndActivity(buildCreateLeadAndActivity(lead, eventRow));
          await pool.query('UPDATE leads SET crm_prospect_id=$1 WHERE user_id=$2', [fresh, lead.user_id]);
        } else {
          throw e;
        }
      }
    }
    return markSynced(pool, eventRow.id);
  } catch (e) {
    const kind = (e instanceof CrmError) ? e.kind : 'unknown';
    return markFailed(pool, eventRow.id, e.message || String(e), kind);
  }
}

async function markSynced(pool, eventId) {
  await pool.query(
    `UPDATE events SET crm_synced_at = NOW(), crm_sync_error = NULL,
     crm_sync_attempts = COALESCE(crm_sync_attempts,0) + 1 WHERE id=$1`,
    [eventId]
  );
}

async function markFailed(pool, eventId, errMsg, kind) {
  // Validation/auth errors are terminal — bump attempts to MAX so we stop retrying.
  const terminal = (kind === 'validation' || kind === 'auth');
  if (terminal) {
    await pool.query(
      `UPDATE events SET crm_sync_attempts = $2, crm_sync_error = $3 WHERE id=$1`,
      [eventId, MAX_ATTEMPTS, `[${kind}] ${errMsg}`]
    );
  } else {
    await pool.query(
      `UPDATE events SET crm_sync_attempts = COALESCE(crm_sync_attempts,0) + 1,
                         crm_sync_error    = $2
       WHERE id=$1`,
      [eventId, `[${kind}] ${errMsg}`]
    );
  }
}

async function tick(pool) {
  if (running) return;
  running = true;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM events
       WHERE crm_synced_at IS NULL
         AND COALESCE(crm_sync_attempts,0) < $1
       ORDER BY created_at ASC
       LIMIT $2`,
      [MAX_ATTEMPTS, BATCH_SIZE]
    );
    if (!rows.length) return;
    console.log(`[crm-sync] processing ${rows.length} events`);
    for (const ev of rows) {
      await processOne(pool, ev);
    }
  } catch (e) {
    console.error('[crm-sync] tick error:', e.message);
  } finally {
    running = false;
  }
}

function start(pool) {
  if (timer) return;
  if (process.env.CRM_SYNC_ENABLED !== 'true') {
    console.log('[crm-sync] disabled (set CRM_SYNC_ENABLED=true to start)');
    return;
  }
  console.log(`[crm-sync] enabled, interval=${POLL_INTERVAL_MS}ms batch=${BATCH_SIZE} maxAttempts=${MAX_ATTEMPTS}`);
  timer = setInterval(() => tick(pool), POLL_INTERVAL_MS);
  tick(pool); // immediate first run
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}

module.exports = { start, stop, tick, processOne };
