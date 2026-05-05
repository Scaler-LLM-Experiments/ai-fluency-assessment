#!/usr/bin/env node
// One-shot smoke test: push the OLDEST unsynced 'completed' event to CRM staging.
// Does NOT enable the worker. Marks the row synced on success only.
// Run: railway run node scripts/crm-smoke.js

const { Pool } = require('pg');
const worker = require('../lib/sync-worker');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL missing'); process.exit(2); }

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('localhost') || DATABASE_URL.includes('railway.internal')
    ? false
    : { rejectUnauthorized: false },
  max: 2,
});

(async () => {
  for (const k of ['CRM_BASE_URL','CRM_ACCESS_KEY','CRM_SECRET_KEY','CRM_ACTIVITY_CODE_COMPLETED','CRM_ACTIVITY_CODE_CALLBACK']) {
    if (!process.env[k]) { console.error('missing env:', k); process.exit(2); }
  }
  console.log('CRM_BASE_URL =', process.env.CRM_BASE_URL);
  console.log('completed code =', process.env.CRM_ACTIVITY_CODE_COMPLETED, 'callback code =', process.env.CRM_ACTIVITY_CODE_CALLBACK);

  const { rows } = await pool.query(
    `SELECT e.* FROM events e
       JOIN leads l ON l.user_id = e.user_id
      WHERE e.crm_synced_at IS NULL
        AND COALESCE(e.crm_sync_attempts,0) = 0
        AND e.event = 'completed'
        AND l.email IS NOT NULL
      ORDER BY e.created_at ASC
      LIMIT 1`
  );

  if (!rows.length) {
    console.log('no eligible completed event with email — nothing to test');
    process.exit(0);
  }

  const ev = rows[0];
  console.log(`\npicking event id=${ev.id} user_id=${ev.user_id} event=${ev.event} created=${ev.created_at}`);

  const before = await pool.query('SELECT crm_prospect_id, email, name FROM leads WHERE user_id=$1', [ev.user_id]);
  console.log('lead before:', before.rows[0]);

  // Print the activity note we're about to send so we can verify shape + report link.
  try {
    const { buildCreateActivity, buildCreateLeadAndActivity } = require('../lib/crm-payloads');
    const leadFull = (await pool.query('SELECT * FROM leads WHERE user_id=$1', [ev.user_id])).rows[0];
    const sample = before.rows[0].crm_prospect_id
      ? buildCreateActivity(before.rows[0].crm_prospect_id, leadFull, ev)
      : buildCreateLeadAndActivity(leadFull, ev).Activity;
    console.log('\n--- ActivityNote preview ---');
    console.log(sample.ActivityNote);
    console.log('--- end ---\n');
  } catch (e) { console.warn('preview failed:', e.message); }

  await worker.processOne(pool, ev);

  const after  = await pool.query('SELECT crm_synced_at, crm_sync_attempts, crm_sync_error FROM events WHERE id=$1', [ev.id]);
  const lead2  = await pool.query('SELECT crm_prospect_id FROM leads WHERE user_id=$1', [ev.user_id]);
  console.log('\nresult:');
  console.log('  event :', after.rows[0]);
  console.log('  lead  :', lead2.rows[0]);

  await pool.end();
  process.exit(after.rows[0].crm_synced_at ? 0 : 1);
})().catch(e => { console.error('crashed:', e); process.exit(2); });
