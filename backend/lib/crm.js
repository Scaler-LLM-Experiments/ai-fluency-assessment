// CRM client — implements the 3-call flow from crm-api-contract.md.
//
// Stateless. All config comes from env vars at call time.
// Throws CrmError with kind = 'validation' | 'transient' | 'stale_lead' | 'auth' | 'unknown'.
// Sync worker uses 'kind' to decide retry vs fail-fast vs stale-id recovery.

const TIMEOUT_MS = 20_000;

class CrmError extends Error {
  constructor(message, kind, status, body) {
    super(message);
    this.name = 'CrmError';
    this.kind = kind;
    this.status = status;
    this.body = body;
  }
}

function classify(status, body) {
  if (status === 401 || status === 403) return 'auth';
  if (status >= 400 && status < 500) {
    const txt = JSON.stringify(body || '').toLowerCase();
    if (txt.includes('not found') || txt.includes('no permission') || txt.includes('does not exist')) {
      return 'stale_lead';
    }
    return 'validation';
  }
  if (status >= 500 || status === 0) return 'transient';
  return 'unknown';
}

function authHeaders() {
  const accessKey = process.env.CRM_ACCESS_KEY || '';
  const secretKey = process.env.CRM_SECRET_KEY || '';
  if (!accessKey || !secretKey) {
    throw new CrmError('CRM_ACCESS_KEY / CRM_SECRET_KEY not set', 'auth', 0, null);
  }
  return {
    'Content-Type': 'application/json',
    'X-Access-Key': accessKey,
    'X-Secret-Key': secretKey,
  };
}

function baseUrl() {
  const url = process.env.CRM_BASE_URL || '';
  if (!url) throw new CrmError('CRM_BASE_URL not set', 'auth', 0, null);
  return url.replace(/\/+$/, '');
}

async function httpJson(method, url, body) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
  } catch (e) {
    clearTimeout(t);
    throw new CrmError(`${method} ${url} → network: ${e.message}`, 'transient', 0, null);
  }
  clearTimeout(t);

  let parsed = null;
  const text = await res.text();
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }

  if (!res.ok) {
    throw new CrmError(
      `${method} ${url} → HTTP ${res.status}`,
      classify(res.status, parsed),
      res.status,
      parsed
    );
  }
  return parsed;
}

// API 1 — Find lead by email. Returns CRM prospect id or null.
async function getLeadByEmail(email) {
  if (!email) return null;
  const url = `${baseUrl()}/LeadManagement.svc/Lead.GetByEmailaddress?emailaddress=${encodeURIComponent(email)}`;
  let data;
  try {
    data = await httpJson('GET', url);
  } catch (e) {
    // Some CRMs return 404 when not found rather than empty list — treat as null, not an error.
    if (e.kind === 'stale_lead' || e.status === 404) return null;
    throw e;
  }
  // Response shape varies; pick the first id-like field we find.
  return extractProspectId(data);
}

function extractProspectId(data) {
  if (!data) return null;
  if (typeof data === 'string' && /^[0-9a-f-]{36}$/i.test(data)) return data;
  if (Array.isArray(data) && data.length) return extractProspectId(data[0]);
  if (typeof data === 'object') {
    // CreateLeadAndActivity response: { Message: { Id: <activityId>, RelatedId: <prospectId> } }
    if (data.Message && typeof data.Message === 'object') {
      const fromMsg = extractProspectId(data.Message);
      if (fromMsg) return fromMsg;
    }
    const keys = ['RelatedId', 'RelatedProspectId', 'ProspectID', 'ProspectId', 'LeadId', 'LeadID'];
    for (const k of keys) if (data[k]) return data[k];
  }
  return null;
}

// API 2 — Create lead + first activity. Returns CRM prospect id.
async function createLeadAndActivity(payload) {
  const data = await httpJson(
    'POST',
    `${baseUrl()}/ActivityManagement.svc/CreateLeadAndActivity`,
    payload
  );
  const id = extractProspectId(data);
  if (!id) {
    throw new CrmError('CreateLeadAndActivity succeeded but no prospect id returned', 'unknown', 200, data);
  }
  return id;
}

// API 3 — Create activity for an existing lead.
async function createActivity(payload) {
  return httpJson(
    'POST',
    `${baseUrl()}/ActivityManagement.svc/Create`,
    payload
  );
}

module.exports = {
  CrmError,
  getLeadByEmail,
  createLeadAndActivity,
  createActivity,
};
