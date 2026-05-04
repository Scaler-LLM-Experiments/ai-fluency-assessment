#!/usr/bin/env node
/* CRM sync worker integration tests against the in-process mock CRM.
 *
 * Usage:
 *   DATABASE_URL=postgres://localhost/aifluency node test/run-crm.js
 *
 * Requires a Postgres the test can write to. Drops + recreates a tmp_events / tmp_leads
 * scoped row set per test using uuid prefixes so it's safe to run on shared databases.
 */

const { Pool } = require('pg');
const mock = require('./mock-crm');

const DATABASE_URL = process.env.DATABASE_URL || '';
if (!DATABASE_URL) {
  console.error('DATABASE_URL required');
  process.exit(2);
}

let pass = 0, fail = 0;
const failures = [];
function assert(cond, name, detail = '') {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else      { fail++; failures.push({ name, detail }); console.log(`  ✗ ${name}${detail ? '  — ' + detail : ''}`); }
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 5,
});

const TEST_PREFIX = 'crmtest-' + Date.now() + '-';

async function ensureSchema() {
  // Reuse the production schema by importing it from server.js? Server runs side-effects on require.
  // Inline the same DDL here — kept in sync with server.js manually.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leads (
      user_id TEXT PRIMARY KEY, name TEXT, email TEXT, phone TEXT, role TEXT,
      status TEXT, score INTEGER, band TEXT, last_question INTEGER,
      completed BOOLEAN, requested_callback BOOLEAN, clicked_curriculum BOOLEAN, retook_test BOOLEAN,
      traffic_source TEXT, utm_source TEXT, utm_medium TEXT, utm_campaign TEXT, utm_term TEXT, utm_content TEXT,
      referrer TEXT, first_seen_ist TEXT, last_seen_ist TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS events (
      id BIGSERIAL PRIMARY KEY, user_id TEXT NOT NULL, event TEXT NOT NULL,
      timestamp_ist TEXT, date_ist TEXT, time_ist TEXT,
      question_number INTEGER, question_name TEXT, answer_level TEXT,
      score INTEGER, band TEXT, payload JSONB, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE leads  ADD COLUMN IF NOT EXISTS crm_prospect_id   TEXT;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS crm_synced_at     TIMESTAMPTZ;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS crm_sync_attempts INTEGER DEFAULT 0;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS crm_sync_error    TEXT;
  `);
}

async function cleanup() {
  await pool.query(`DELETE FROM events WHERE user_id LIKE $1`, [TEST_PREFIX + '%']);
  await pool.query(`DELETE FROM leads  WHERE user_id LIKE $1`, [TEST_PREFIX + '%']);
}

async function makeLead({ id, email, name = 'Test User', score = 30, band = 'AI Capable' }) {
  await pool.query(
    `INSERT INTO leads (user_id, name, email, phone, role, status, score, band, last_question,
       completed, requested_callback, clicked_curriculum, retook_test,
       traffic_source, utm_source, utm_medium, utm_campaign, referrer,
       first_seen_ist, last_seen_ist)
     VALUES ($1,$2,$3,'9999999999','Product Manager','completed',$4,$5,10,
       TRUE, FALSE, FALSE, FALSE,
       'google','google','cpc','opgp_q2','https://google.com/',
       '2026-05-04 10:00:00','2026-05-04 10:15:00')`,
    [id, name, email, score, band]
  );
}

async function makeEvent({ userId, event = 'completed' }) {
  const { rows } = await pool.query(
    `INSERT INTO events (user_id, event, timestamp_ist, score, band, payload)
     VALUES ($1, $2, '2026-05-04 10:15:00', 30, 'AI Capable', '{}'::jsonb)
     RETURNING id`,
    [userId, event]
  );
  return rows[0].id;
}

async function getEvent(id) {
  const { rows } = await pool.query('SELECT * FROM events WHERE id=$1', [id]);
  return rows[0];
}
async function getLead(userId) {
  const { rows } = await pool.query('SELECT * FROM leads WHERE user_id=$1', [userId]);
  return rows[0];
}

function setupCrmEnv(crm) {
  process.env.CRM_BASE_URL  = crm.url;
  process.env.CRM_ACCESS_KEY = crm.state.accessKey;
  process.env.CRM_SECRET_KEY = crm.state.secretKey;
  process.env.CRM_ACTIVITY_CODE_COMPLETED = '482';
  process.env.CRM_ACTIVITY_CODE_CALLBACK  = '485';
  process.env.CRM_PROGRAM_TAG = 'opgp_ai_fluency';
}

(async () => {
  console.log('CRM sync worker tests\n');

  await ensureSchema();
  await cleanup();

  // Fresh require so env vars are read at module load time? Worker reads at call time, so ok to require once.
  delete require.cache[require.resolve('../lib/sync-worker')];
  delete require.cache[require.resolve('../lib/crm')];
  delete require.cache[require.resolve('../lib/crm-payloads')];

  // Test 1 — happy path: new lead, completed event → CreateLeadAndActivity → marked synced.
  {
    const crm = await mock.start();
    setupCrmEnv(crm);
    const worker = require('../lib/sync-worker');

    const userId = TEST_PREFIX + 'happy-1';
    await makeLead({ id: userId, email: 'happy@example.com' });
    const eventId = await makeEvent({ userId });

    await worker.tick(pool);

    const ev = await getEvent(eventId);
    const ld = await getLead(userId);
    assert(ev.crm_synced_at !== null, 'happy: event marked synced');
    assert(ld.crm_prospect_id != null, 'happy: lead got CRM prospect id cached');
    assert(crm.state.counters.GET === 1, 'happy: looked up by email (count=1)', `got ${crm.state.counters.GET}`);
    assert(crm.state.counters.CreateLeadAndActivity === 1, 'happy: created lead+activity once');
    assert(crm.state.counters.Create === 0, 'happy: did not call Create');
    await crm.close();

    delete require.cache[require.resolve('../lib/sync-worker')];
  }

  // Test 2 — second event for same lead → uses cached id, calls Create only.
  {
    const crm = await mock.start();
    setupCrmEnv(crm);
    const worker = require('../lib/sync-worker');

    const userId = TEST_PREFIX + 'cached-1';
    await makeLead({ id: userId, email: 'cached@example.com' });
    await pool.query(`UPDATE leads SET crm_prospect_id='preset-uuid' WHERE user_id=$1`, [userId]);
    // Pre-register prospect in mock so Create accepts it.
    crm.state.leadsByEmail.set('cached@example.com', 'preset-uuid');
    const eventId = await makeEvent({ userId });

    await worker.tick(pool);

    const ev = await getEvent(eventId);
    assert(ev.crm_synced_at !== null, 'cached: event marked synced');
    assert(crm.state.counters.GET === 0, 'cached: skipped email lookup');
    assert(crm.state.counters.CreateLeadAndActivity === 0, 'cached: did not call CreateLeadAndActivity');
    assert(crm.state.counters.Create === 1, 'cached: called Create once');
    await crm.close();

    delete require.cache[require.resolve('../lib/sync-worker')];
  }

  // Test 3 — stale id recovery: cached id rejected → clears + recreates.
  {
    const crm = await mock.start();
    setupCrmEnv(crm);
    crm.state.behaviour = 'stale-then-ok';
    const worker = require('../lib/sync-worker');

    const userId = TEST_PREFIX + 'stale-1';
    await makeLead({ id: userId, email: 'stale@example.com' });
    await pool.query(`UPDATE leads SET crm_prospect_id='ghost-uuid' WHERE user_id=$1`, [userId]);
    const eventId = await makeEvent({ userId });

    await worker.tick(pool);

    const ev = await getEvent(eventId);
    const ld = await getLead(userId);
    assert(ev.crm_synced_at !== null, 'stale: event eventually synced');
    assert(ld.crm_prospect_id !== 'ghost-uuid', 'stale: prospect id rotated');
    assert(crm.state.counters.CreateLeadAndActivity === 1, 'stale: fell back to CreateLeadAndActivity');
    await crm.close();

    delete require.cache[require.resolve('../lib/sync-worker')];
  }

  // Test 4 — non-pushed event (started) → marked synced without any CRM call.
  {
    const crm = await mock.start();
    setupCrmEnv(crm);
    const worker = require('../lib/sync-worker');

    const userId = TEST_PREFIX + 'noise-1';
    await makeLead({ id: userId, email: 'noise@example.com' });
    const eventId = await makeEvent({ userId, event: 'started' });

    await worker.tick(pool);

    const ev = await getEvent(eventId);
    assert(ev.crm_synced_at !== null, 'filter: started marked synced (skipped)');
    assert(
      crm.state.counters.GET + crm.state.counters.CreateLeadAndActivity + crm.state.counters.Create === 0,
      'filter: no CRM calls for non-pushed event'
    );
    await crm.close();

    delete require.cache[require.resolve('../lib/sync-worker')];
  }

  // Test 5 — validation error is terminal: attempts jumps to MAX_ATTEMPTS, error recorded.
  {
    const crm = await mock.start();
    setupCrmEnv(crm);
    crm.state.behaviour = 'validation-fail';
    const worker = require('../lib/sync-worker');

    const userId = TEST_PREFIX + 'badreq-1';
    await makeLead({ id: userId, email: 'bad@example.com' });
    const eventId = await makeEvent({ userId });

    await worker.tick(pool);

    const ev = await getEvent(eventId);
    assert(ev.crm_synced_at === null, 'validation: event NOT marked synced');
    assert(ev.crm_sync_attempts >= 5, 'validation: attempts maxed (terminal)', `attempts=${ev.crm_sync_attempts}`);
    assert(/validation/i.test(ev.crm_sync_error || ''), 'validation: error tagged validation', ev.crm_sync_error);
    await crm.close();

    delete require.cache[require.resolve('../lib/sync-worker')];
  }

  // Test 6 — transient 5xx: attempts increments by 1 (retryable next tick).
  {
    const crm = await mock.start();
    setupCrmEnv(crm);
    crm.state.behaviour = '5xx-once';
    const worker = require('../lib/sync-worker');

    const userId = TEST_PREFIX + 'flake-1';
    await makeLead({ id: userId, email: 'flake@example.com' });
    const eventId = await makeEvent({ userId });

    // First tick → 503, attempts = 1.
    await worker.tick(pool);
    let ev = await getEvent(eventId);
    assert(ev.crm_synced_at === null, 'transient: not synced after 503');
    assert(ev.crm_sync_attempts === 1, 'transient: attempts=1 after first failure', `got ${ev.crm_sync_attempts}`);

    // Mock auto-recovers; second tick should succeed.
    await worker.tick(pool);
    ev = await getEvent(eventId);
    assert(ev.crm_synced_at !== null, 'transient: synced on retry');
    await crm.close();
  }

  await cleanup();
  await pool.end();

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) {
    failures.forEach(f => console.log(`  ✗ ${f.name}: ${f.detail}`));
    process.exit(1);
  }
})().catch(err => {
  console.error('test runner crashed:', err);
  process.exit(2);
});
