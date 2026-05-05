#!/usr/bin/env node
/* CRM unit tests — no Postgres required. Uses an in-memory pool stub.
 * Validates: payload shape, CRM client behaviour, sync worker state machine.
 */

const mock = require('./mock-crm');

let pass = 0, fail = 0;
const failures = [];
function assert(cond, name, detail = '') {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else      { fail++; failures.push({ name, detail }); console.log(`  ✗ ${name}${detail ? '  — ' + detail : ''}`); }
}
function assertEq(a, b, name) {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else    { fail++; failures.push({ name, detail: `got ${JSON.stringify(a)}` });
            console.log(`  ✗ ${name} — got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`); }
}

// In-memory Pool stub. Stores leads + events in JS Maps; supports the SQL shapes the worker uses.
function makePoolStub() {
  const leads = new Map();   // user_id → row
  const events = new Map();  // id → row
  let nextEventId = 1;

  function nowIso() { return new Date().toISOString(); }

  return {
    leads, events,
    addLead(row) { leads.set(row.user_id, { ...row }); },
    addEvent(row) {
      const id = nextEventId++;
      const full = { id, crm_sync_attempts: 0, crm_synced_at: null, crm_sync_error: null, ...row };
      events.set(id, full);
      return id;
    },
    async query(sql, params = []) {
      const s = sql.replace(/\s+/g, ' ').trim();

      // SELECT * FROM events WHERE crm_synced_at IS NULL AND attempts < $1 ORDER BY created_at LIMIT $2
      if (s.startsWith('SELECT * FROM events WHERE crm_synced_at IS NULL')) {
        const maxAttempts = params[0], limit = params[1];
        const rows = [...events.values()]
          .filter(e => e.crm_synced_at === null && (e.crm_sync_attempts || 0) < maxAttempts)
          .sort((a, b) => (a.created_at || 0) - (b.created_at || 0))
          .slice(0, limit);
        return { rows };
      }

      // SELECT * FROM leads WHERE user_id=$1
      if (s === 'SELECT * FROM leads WHERE user_id=$1') {
        const r = leads.get(params[0]);
        return { rows: r ? [r] : [] };
      }

      // UPDATE events SET crm_synced_at = NOW(), crm_sync_error = NULL, crm_sync_attempts = ... WHERE id=$1
      if (s.includes('SET crm_synced_at = NOW()')) {
        const ev = events.get(params[0]);
        if (ev) { ev.crm_synced_at = nowIso(); ev.crm_sync_error = null; ev.crm_sync_attempts = (ev.crm_sync_attempts || 0) + 1; }
        return { rows: [] };
      }

      // UPDATE events SET crm_sync_attempts = $2, crm_sync_error = $3 WHERE id=$1   (terminal)
      if (s.match(/UPDATE events SET crm_sync_attempts = \$2, crm_sync_error = \$3/)) {
        const ev = events.get(params[0]);
        if (ev) { ev.crm_sync_attempts = params[1]; ev.crm_sync_error = params[2]; }
        return { rows: [] };
      }

      // UPDATE events SET crm_sync_attempts = COALESCE(...) + 1, crm_sync_error = $2 WHERE id=$1
      if (s.match(/UPDATE events SET crm_sync_attempts = COALESCE/)) {
        const ev = events.get(params[0]);
        if (ev) { ev.crm_sync_attempts = (ev.crm_sync_attempts || 0) + 1; ev.crm_sync_error = params[1]; }
        return { rows: [] };
      }

      // UPDATE leads SET crm_prospect_id=$1 WHERE user_id=$2
      if (s === 'UPDATE leads SET crm_prospect_id=$1 WHERE user_id=$2') {
        const ld = leads.get(params[1]);
        if (ld) ld.crm_prospect_id = params[0];
        return { rows: [] };
      }

      // UPDATE leads SET crm_prospect_id=NULL WHERE user_id=$1
      if (s === 'UPDATE leads SET crm_prospect_id=NULL WHERE user_id=$1') {
        const ld = leads.get(params[0]);
        if (ld) ld.crm_prospect_id = null;
        return { rows: [] };
      }

      throw new Error('pool stub: unhandled SQL ' + s.slice(0, 80));
    },
  };
}

function makeLead(over = {}) {
  return {
    user_id: 'u1', name: 'Asha Kumar', email: 'asha@example.com', phone: '9999999999',
    role: 'Product Manager', status: 'completed', score: 32, band: 'AI Capable',
    last_question: 10, completed: true, requested_callback: false,
    clicked_curriculum: false, retook_test: false,
    traffic_source: 'google', utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'opgp_q2',
    referrer: 'https://google.com/', first_seen_ist: '2026-05-04 10:00:00',
    last_seen_ist: '2026-05-04 10:15:00', crm_prospect_id: null,
    ...over,
  };
}

function setupCrmEnv(crm) {
  process.env.CRM_BASE_URL  = crm.url;
  process.env.CRM_ACCESS_KEY = crm.state.accessKey;
  process.env.CRM_SECRET_KEY = crm.state.secretKey;
  process.env.CRM_ACTIVITY_CODE_COMPLETED = '482';
  process.env.CRM_ACTIVITY_CODE_CALLBACK  = '485';
  process.env.CRM_PROGRAM_TAG = 'opgp_ai_fluency';
}

async function main() {
  // ─── A. Payload builder ─────────────────────────────────────────────
  console.log('\nA. crm-payloads');
  const payloads = require('../lib/crm-payloads');
  process.env.CRM_ACTIVITY_CODE_COMPLETED = '482';
  process.env.CRM_ACTIVITY_CODE_CALLBACK  = '485';

  assert(payloads.shouldPush('completed'),          'pushes completed');
  assert(payloads.shouldPush('requested_callback'), 'pushes requested_callback');
  assert(!payloads.shouldPush('started'),           'skips started');
  assert(!payloads.shouldPush('question_answered'), 'skips question_answered');
  assert(!payloads.shouldPush('clicked_curriculum'),'skips clicked_curriculum');

  const lead = makeLead();
  const ev = { id: 1, event: 'completed', timestamp_ist: '2026-05-04 10:15:00' };

  const create = payloads.buildCreateLeadAndActivity(lead, ev);
  assert(create.LeadDetails.find(d => d.Attribute === 'EmailAddress')?.Value === 'asha@example.com', 'CreateLeadAndActivity has email');
  assert(create.LeadDetails.find(d => d.Attribute === 'FirstName')?.Value === 'Asha',                'splits name → FirstName');
  assert(create.LeadDetails.find(d => d.Attribute === 'LastName')?.Value === 'Kumar',                'splits name → LastName');
  assert(create.LeadDetails.find(d => d.Attribute === 'Phone')?.Value === '+91-9999999999',          'normalises phone with +91 prefix');
  assert(create.LeadDetails.find(d => d.Attribute === 'SearchBy')?.Value === 'Phone',                'SearchBy defaults to Phone');
  assertEq(create.Activity.ActivityEvent, 482, 'completed → ActivityEvent 482 (from env)');

  const fields = create.Activity.Fields;
  const get = (slot) => fields.find(f => f.SchemaName === slot)?.Value;
  assertEq(get('mx_Custom_1'), 32,                'mx_Custom_1 = score');
  assertEq(get('mx_Custom_2'), 'Product Manager', 'mx_Custom_2 = role');
  assert(/\/api\/leads\/u1\/report\?t=/.test(get('mx_Custom_3') || ''), 'mx_Custom_3 = signed report URL');

  const ca = payloads.buildCreateActivity('crm-uuid-123', lead, ev);
  assertEq(ca.RelatedProspectId, 'crm-uuid-123', 'CreateActivity carries RelatedProspectId');
  assertEq(ca.ActivityEvent, 482,                 'CreateActivity carries ActivityEvent');
  assert(Array.isArray(ca.Fields) && ca.Fields.length === 3, 'CreateActivity has 3 mx_Custom_* fields (score, role, link)');

  // role truncates >200 chars (mx_Custom_2)
  const longRole = 'X'.repeat(500);
  const long = payloads.buildCreateLeadAndActivity({ ...lead, role: longRole }, ev);
  const truncRole = long.Activity.Fields.find(f => f.SchemaName === 'mx_Custom_2')?.Value;
  assert(truncRole && truncRole.length === 200, 'long string fields truncated to 200 chars');

  // requested_callback uses CALLBACK code
  const callback = payloads.buildCreateLeadAndActivity(lead, { ...ev, event: 'requested_callback' });
  assertEq(callback.Activity.ActivityEvent, 485, 'requested_callback → ActivityEvent 485');

  // ─── B. CRM client against the mock ───────────────────────────────
  console.log('\nB. crm client');
  const crm1 = await mock.start();
  setupCrmEnv(crm1);
  delete require.cache[require.resolve('../lib/crm')];
  const client = require('../lib/crm');

  // Lookup of unknown email → null
  const lookup1 = await client.getLeadByEmail('nope@example.com');
  assertEq(lookup1, null, 'getLeadByEmail returns null for unknown');

  // Create lead+activity → returns id
  const id = await client.createLeadAndActivity({
    LeadDetails: [{ Attribute: 'EmailAddress', Value: 'first@example.com' }],
    Activity: { ActivityEvent: 482, Fields: [] },
  });
  assert(typeof id === 'string' && id.length === 36, 'createLeadAndActivity returns uuid', `got ${id}`);

  // Lookup of just-created email → returns same id
  const lookup2 = await client.getLeadByEmail('first@example.com');
  assertEq(lookup2, id, 'getLeadByEmail returns the cached id');

  // Create activity for known id → ok
  await client.createActivity({ RelatedProspectId: id, ActivityEvent: 482, Fields: [] });
  assert(crm1.state.counters.Create === 1, 'createActivity hit Create endpoint');

  // 4xx classification — validation
  crm1.state.behaviour = 'validation-fail';
  let kind = null;
  try { await client.createLeadAndActivity({ LeadDetails: [{ Attribute: 'EmailAddress', Value: 'x@y.com' }], Activity: {} }); }
  catch (e) { kind = e.kind; }
  assertEq(kind, 'validation', 'validation error classified as validation');

  // 5xx classification — transient
  crm1.state.behaviour = '5xx-once';
  kind = null;
  try { await client.createLeadAndActivity({ LeadDetails: [{ Attribute: 'EmailAddress', Value: 'x@y.com' }], Activity: {} }); }
  catch (e) { kind = e.kind; }
  assertEq(kind, 'transient', '5xx error classified as transient');

  // Stale-lead classification on Create
  crm1.state.behaviour = 'stale-then-ok';
  kind = null;
  try { await client.createActivity({ RelatedProspectId: 'ghost', ActivityEvent: 482, Fields: [] }); }
  catch (e) { kind = e.kind; }
  assertEq(kind, 'stale_lead', '404 "lead does not exist" classified as stale_lead');

  await crm1.close();

  // ─── C. Sync worker state machine ─────────────────────────────────
  console.log('\nC. sync-worker state machine');
  const crm2 = await mock.start();
  setupCrmEnv(crm2);
  delete require.cache[require.resolve('../lib/crm')];
  delete require.cache[require.resolve('../lib/sync-worker')];
  const worker = require('../lib/sync-worker');

  // C1 — happy path
  {
    const pool = makePoolStub();
    pool.addLead(makeLead({ user_id: 'h1', email: 'h1@example.com' }));
    const eid = pool.addEvent({ user_id: 'h1', event: 'completed', timestamp_ist: '2026-05-04 10:15', created_at: 1 });
    await worker.tick(pool);
    const e = pool.events.get(eid);
    const l = pool.leads.get('h1');
    assert(e.crm_synced_at !== null, 'C1 happy: event marked synced');
    assert(l.crm_prospect_id != null, 'C1 happy: lead got crm_prospect_id cached');
  }

  // C2 — non-pushed event marked synced with zero CRM calls
  {
    const before = { ...crm2.state.counters };
    const pool = makePoolStub();
    pool.addLead(makeLead({ user_id: 'n1', email: 'n1@example.com' }));
    const eid = pool.addEvent({ user_id: 'n1', event: 'started', timestamp_ist: '...', created_at: 2 });
    await worker.tick(pool);
    const e = pool.events.get(eid);
    assert(e.crm_synced_at !== null, 'C2 filter: started event marked synced');
    assert(crm2.state.counters.GET === before.GET &&
           crm2.state.counters.CreateLeadAndActivity === before.CreateLeadAndActivity &&
           crm2.state.counters.Create === before.Create,
           'C2 filter: no CRM calls for non-pushed event');
  }

  // C3 — second event for same lead uses cached id (Create only, no GET)
  {
    const pool = makePoolStub();
    pool.addLead(makeLead({ user_id: 'c1', email: 'c1@example.com', crm_prospect_id: 'preset-c1' }));
    crm2.state.leadsByEmail.set('c1@example.com', 'preset-c1');
    const before = { ...crm2.state.counters };
    const eid = pool.addEvent({ user_id: 'c1', event: 'requested_callback', timestamp_ist: '...', created_at: 3 });
    await worker.tick(pool);
    const e = pool.events.get(eid);
    assert(e.crm_synced_at !== null, 'C3 cached: synced');
    assert(crm2.state.counters.GET === before.GET, 'C3 cached: skipped email lookup');
    assert(crm2.state.counters.Create === before.Create + 1, 'C3 cached: called Create once');
  }

  // C4 — validation error is terminal
  {
    crm2.state.behaviour = 'validation-fail';
    const pool = makePoolStub();
    pool.addLead(makeLead({ user_id: 'v1', email: 'v1@example.com' }));
    const eid = pool.addEvent({ user_id: 'v1', event: 'completed', timestamp_ist: '...', created_at: 4 });
    await worker.tick(pool);
    const e = pool.events.get(eid);
    assert(e.crm_synced_at === null, 'C4 validation: not marked synced');
    assert(e.crm_sync_attempts >= 5, 'C4 validation: attempts maxed', `got ${e.crm_sync_attempts}`);
    assert(/validation/.test(e.crm_sync_error || ''), 'C4 validation: error tagged', e.crm_sync_error);
    crm2.state.behaviour = 'ok';
  }

  // C5 — transient 5xx increments by 1, retries on next tick
  {
    crm2.state.behaviour = '5xx-once';
    const pool = makePoolStub();
    pool.addLead(makeLead({ user_id: 't1', email: 't1@example.com' }));
    const eid = pool.addEvent({ user_id: 't1', event: 'completed', timestamp_ist: '...', created_at: 5 });
    await worker.tick(pool);
    let e = pool.events.get(eid);
    assert(e.crm_synced_at === null, 'C5 transient: not synced after first tick');
    assert(e.crm_sync_attempts === 1, 'C5 transient: attempts=1', `got ${e.crm_sync_attempts}`);
    await worker.tick(pool);
    e = pool.events.get(eid);
    assert(e.crm_synced_at !== null, 'C5 transient: synced on retry');
  }

  // C6 — stale id recovery
  {
    crm2.state.behaviour = 'stale-then-ok';
    const pool = makePoolStub();
    pool.addLead(makeLead({ user_id: 's1', email: 's1@example.com', crm_prospect_id: 'ghost-id' }));
    const eid = pool.addEvent({ user_id: 's1', event: 'completed', timestamp_ist: '...', created_at: 6 });
    await worker.tick(pool);
    const e = pool.events.get(eid);
    const l = pool.leads.get('s1');
    assert(e.crm_synced_at !== null, 'C6 stale: synced after recovery');
    assert(l.crm_prospect_id !== 'ghost-id', 'C6 stale: prospect id rotated');
  }

  await crm2.close();

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) {
    failures.forEach(f => console.log(`  ✗ ${f.name}${f.detail ? ': ' + f.detail : ''}`));
    process.exit(1);
  }
}

main().catch(err => { console.error('runner crashed:', err); process.exit(2); });
