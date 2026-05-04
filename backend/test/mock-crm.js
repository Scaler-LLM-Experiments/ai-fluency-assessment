// In-process mock of the Scaler CRM API.
//
// Mimics the 3 endpoints from crm-api-contract.md with injectable behaviours.
// Used by test/run-crm.js to drive the sync worker end-to-end.

const http = require('http');
const crypto = require('crypto');

function uuid() { return crypto.randomUUID(); }

function start({ port = 0 } = {}) {
  const state = {
    leadsByEmail: new Map(),   // email → prospect id
    activities: [],            // append-only log
    behaviour: 'ok',           // 'ok' | '5xx-once' | 'auth-fail' | 'stale-then-ok' | 'validation-fail'
    counters: { GET: 0, CreateLeadAndActivity: 0, Create: 0 },
    accessKey: 'test-access',
    secretKey: 'test-secret',
  };

  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', c => (body += c));
    req.on('end', () => handle(req, res, body, state));
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      const { port: p } = server.address();
      resolve({
        url: `http://127.0.0.1:${p}/api/v1`,
        state,
        close: () => new Promise(r => server.close(r)),
      });
    });
  });
}

function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(obj));
}

function handle(req, res, body, state) {
  // auth check
  if (req.headers['x-access-key'] !== state.accessKey || req.headers['x-secret-key'] !== state.secretKey) {
    return send(res, 401, { error: 'unauthorized' });
  }

  if (state.behaviour === 'auth-fail') return send(res, 401, { error: 'token rejected' });

  const url = new URL(req.url, 'http://x');
  const path = url.pathname;

  // API 1
  if (req.method === 'GET' && path.endsWith('/LeadManagement.svc/Lead.GetByEmailaddress')) {
    state.counters.GET++;
    const email = url.searchParams.get('emailaddress');
    if (!email) return send(res, 400, { error: 'emailaddress required' });
    const id = state.leadsByEmail.get(email);
    if (!id) return send(res, 200, []);
    return send(res, 200, { ProspectID: id });
  }

  // API 2
  if (req.method === 'POST' && path.endsWith('/ActivityManagement.svc/CreateLeadAndActivity')) {
    state.counters.CreateLeadAndActivity++;
    if (state.behaviour === 'validation-fail') return send(res, 400, { error: 'invalid LeadDetails' });
    if (state.behaviour === '5xx-once') {
      state.behaviour = 'ok';
      return send(res, 503, { error: 'service unavailable' });
    }
    const payload = JSON.parse(body || '{}');
    const email = (payload.LeadDetails || []).find(d => d.Attribute === 'EmailAddress')?.Value;
    if (!email) return send(res, 400, { error: 'EmailAddress missing' });
    const id = uuid();
    state.leadsByEmail.set(email, id);
    state.activities.push({ prospectId: id, ...payload.Activity });
    return send(res, 200, { ProspectID: id });
  }

  // API 3
  if (req.method === 'POST' && path.endsWith('/ActivityManagement.svc/Create')) {
    state.counters.Create++;
    const payload = JSON.parse(body || '{}');
    if (state.behaviour === 'stale-then-ok') {
      state.behaviour = 'ok';
      return send(res, 404, { error: 'lead does not exist' });
    }
    if (state.behaviour === 'validation-fail') return send(res, 400, { error: 'invalid Fields' });
    if (state.behaviour === '5xx-once') {
      state.behaviour = 'ok';
      return send(res, 503, { error: 'service unavailable' });
    }
    const known = [...state.leadsByEmail.values()].includes(payload.RelatedProspectId);
    if (!known) return send(res, 404, { error: 'lead does not exist' });
    state.activities.push(payload);
    return send(res, 200, { ok: true });
  }

  send(res, 404, { error: 'unknown route', path });
}

module.exports = { start };
