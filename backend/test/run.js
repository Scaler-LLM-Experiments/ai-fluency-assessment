#!/usr/bin/env node
/* Backend smoke + integration tests. Usage:
 *   API_URL=http://localhost:8080 API_TOKEN=test node test/run.js
 *   API_URL=https://ai-fluency-backend.up.railway.app API_TOKEN=xxx node test/run.js
 */

const API_URL   = (process.env.API_URL   || 'http://localhost:8080').replace(/\/$/, '');
const API_TOKEN = process.env.API_TOKEN  || '';
const VERBOSE   = process.env.VERBOSE === '1';

let pass = 0, fail = 0;
const failures = [];

function uuid() {
  return 'test-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
}

async function req(method, path, { body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch(API_URL + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, body: json, raw: text };
}

function assert(cond, name, detail = '') {
  if (cond) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    failures.push({ name, detail });
    console.log(`  ✗ ${name}${detail ? '  — ' + detail : ''}`);
  }
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function test(name, fn) {
  console.log('\n• ' + name);
  try { await fn(); }
  catch (e) {
    fail++;
    failures.push({ name, detail: e.message });
    console.log(`  ✗ THREW: ${e.message}`);
  }
}

(async () => {
  console.log(`\nRunning tests against ${API_URL}\n`);

  await test('health endpoint', async () => {
    const r = await req('GET', '/health');
    assert(r.status === 200, 'returns 200', `got ${r.status}`);
    assert(r.body && r.body.status === 'ok', 'status=ok');
    assert(r.body && (r.body.db === 'ok' || r.body.db === 'disabled'), 'db field present', `got ${r.body && r.body.db}`);
  });

  await test('root identity', async () => {
    const r = await req('GET', '/');
    assert(r.status === 200, 'returns 200');
    assert(r.body && r.body.service === 'ai-fluency-backend', 'service name correct');
  });

  await test('CORS preflight', async () => {
    const res = await fetch(API_URL + '/api/track', { method: 'OPTIONS' });
    assert(res.status === 204, '204 No Content');
    assert(!!res.headers.get('access-control-allow-origin'), 'CORS header present');
  });

  await test('auth: /api/leads without token → 401 or 503', async () => {
    const r = await req('GET', '/api/leads');
    assert(r.status === 401 || r.status === 503, `blocked (got ${r.status})`);
  });

  await test('auth: /api/leads with wrong token → 401', async () => {
    const r = await req('GET', '/api/leads', { token: 'wrong' });
    assert(r.status === 401 || r.status === 503, `blocked (got ${r.status})`);
  });

  if (!API_TOKEN) {
    console.log('\n⚠️  API_TOKEN not set — skipping authed read-path tests');
  } else {
    const userId = uuid();

    await test('full lead lifecycle', async () => {
      // 1. started
      let r = await req('POST', '/api/track', {
        body: { user_id: userId, event: 'started', name: 'Test User', email: 'test@example.com', phone: '9999999999',
                traffic_source: 'direct', timestamp_ist: '2026-04-28 18:00:00' },
      });
      assert(r.status === 200, 'started accepted');

      // 2. role_selected
      r = await req('POST', '/api/track', { body: { user_id: userId, event: 'role_selected', role: 'Product Manager' } });
      assert(r.status === 200, 'role_selected accepted');

      // 3. answer 10 questions
      for (let q = 1; q <= 10; q++) {
        r = await req('POST', '/api/track', {
          body: { user_id: userId, event: 'question_answered', question_number: q, question_name: 'q' + q, answer_level: 'often' },
        });
        assert(r.status === 200, `Q${q} accepted`);
      }

      // 4. completed
      r = await req('POST', '/api/track', {
        body: { user_id: userId, event: 'completed', score: 35, band: 'AI Capable' },
      });
      assert(r.status === 200, 'completed accepted');

      // 5. requested_callback
      r = await req('POST', '/api/track', { body: { user_id: userId, event: 'requested_callback' } });
      assert(r.status === 200, 'callback accepted');

      // give DB writes a moment to settle
      await sleep(800);

      // 6. read it back
      r = await req('GET', '/api/leads/' + userId, { token: API_TOKEN });
      if (r.status === 503) {
        console.log('  ⚠️  DB disabled on backend — skipping read-back');
        return;
      }
      assert(r.status === 200, 'lead readable', `got ${r.status}: ${r.raw.slice(0, 200)}`);
      const lead = r.body && r.body.lead;
      assert(!!lead, 'lead object present');
      if (lead) {
        assert(lead.user_id === userId, 'user_id matches');
        assert(lead.email === 'test@example.com', 'email persisted', `got ${lead.email}`);
        assert(lead.role === 'Product Manager', 'role persisted', `got ${lead.role}`);
        assert(lead.score === 35, 'score persisted', `got ${lead.score}`);
        assert(lead.band === 'AI Capable', 'band persisted', `got ${lead.band}`);
        assert(lead.completed === true, 'completed=true', `got ${lead.completed}`);
        assert(lead.requested_callback === true, 'callback=true', `got ${lead.requested_callback}`);
        assert(lead.last_question === 10, 'last_question=10', `got ${lead.last_question}`);
        assert(lead.status === 'completed', 'status=completed', `got ${lead.status}`);
      }
      const events = (r.body && r.body.events) || [];
      assert(events.length >= 13, `event log has ≥13 entries (got ${events.length})`);
    });

    await test('idempotency: same user_id does not duplicate lead row', async () => {
      const u = uuid();
      await req('POST', '/api/track', { body: { user_id: u, event: 'started', name: 'A' } });
      await req('POST', '/api/track', { body: { user_id: u, event: 'started', name: 'B' } });
      await sleep(400);
      const list = await req('GET', '/api/leads', { token: API_TOKEN });
      if (list.status !== 200) return; // db disabled
      const matches = list.body.leads.filter(l => l.user_id === u);
      assert(matches.length === 1, `exactly 1 lead row for user (got ${matches.length})`);
    });

    await test('list leads + filters', async () => {
      let r = await req('GET', '/api/leads?limit=5', { token: API_TOKEN });
      if (r.status === 503) return;
      assert(r.status === 200, 'list ok');
      assert(Array.isArray(r.body && r.body.leads), 'leads is array');
      assert((r.body.leads || []).length <= 5, 'limit respected');

      r = await req('GET', '/api/leads?callback=true', { token: API_TOKEN });
      assert(r.status === 200, 'callback filter ok');
      const allCallback = (r.body.leads || []).every(l => l.requested_callback === true);
      assert(allCallback, 'all returned leads have callback=true');
    });

    await test('404 on unknown lead', async () => {
      const r = await req('GET', '/api/leads/does-not-exist-xyz', { token: API_TOKEN });
      if (r.status === 503) return;
      assert(r.status === 404, '404 for unknown user_id', `got ${r.status}`);
    });

    await test('stats endpoint', async () => {
      const r = await req('GET', '/api/stats', { token: API_TOKEN });
      if (r.status === 503) return;
      assert(r.status === 200, 'stats ok');
      assert(typeof r.body.total !== 'undefined', 'has total');
      assert(typeof r.body.completed !== 'undefined', 'has completed');
    });
  }

  console.log(`\n──────────────────────────────────────`);
  console.log(`  ${pass} passed, ${fail} failed`);
  if (fail > 0) {
    console.log(`\nFailures:`);
    failures.forEach(f => console.log(`  - ${f.name}${f.detail ? ': ' + f.detail : ''}`));
    process.exit(1);
  }
  console.log(`──────────────────────────────────────\n`);
})();
