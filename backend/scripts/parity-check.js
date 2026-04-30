#!/usr/bin/env node
// Parity check between the Sheet and the Postgres backend.
//
// Pulls the Apps Script "Sheet" mirror via its public read endpoint (?action=list),
// pulls the equivalent window from the backend, and reports gaps on either side.
//
// Usage:
//   API_TOKEN=... SHEET_LIST_URL=... BACKEND_URL=... node scripts/parity-check.js [--since 2026-04-30]
//
// Exits non-zero if either side has user_ids the other is missing, so it can be wired into cron.

const https = require('https');

const BACKEND_URL    = process.env.BACKEND_URL    || 'https://ai-fluency-backend-production.up.railway.app';
const API_TOKEN      = process.env.API_TOKEN      || '';
const SHEET_LIST_URL = process.env.SHEET_LIST_URL || '';

const sinceArgIdx = process.argv.indexOf('--since');
const SINCE = sinceArgIdx > -1 ? process.argv[sinceArgIdx + 1] : null;

function fetchJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, res => {
      let buf = '';
      res.on('data', c => (buf += c));
      res.on('end', () => {
        if (res.statusCode >= 400) return reject(new Error(`${url} → HTTP ${res.statusCode}: ${buf.slice(0, 200)}`));
        try { resolve(JSON.parse(buf)); } catch (e) { reject(new Error(`${url} → bad JSON: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

async function loadBackend() {
  const params = new URLSearchParams({ limit: '1000' });
  if (SINCE) params.set('since', SINCE);
  const data = await fetchJson(`${BACKEND_URL}/api/leads?${params}`, {
    Authorization: `Bearer ${API_TOKEN}`,
  });
  return data.leads || [];
}

async function loadSheet() {
  if (!SHEET_LIST_URL) {
    console.warn('[parity] SHEET_LIST_URL not set — skipping sheet side. Set it to the Apps Script ?action=list URL.');
    return [];
  }
  const url = SINCE ? `${SHEET_LIST_URL}${SHEET_LIST_URL.includes('?') ? '&' : '?'}since=${encodeURIComponent(SINCE)}` : SHEET_LIST_URL;
  const data = await fetchJson(url);
  return Array.isArray(data) ? data : (data.rows || data.leads || []);
}

function indexBy(rows, key) {
  const m = new Map();
  for (const r of rows) if (r && r[key]) m.set(r[key], r);
  return m;
}

(async () => {
  if (!API_TOKEN) {
    console.error('[parity] API_TOKEN env var required');
    process.exit(2);
  }

  const [backendLeads, sheetLeads] = await Promise.all([loadBackend(), loadSheet()]);

  const bByUser = indexBy(backendLeads, 'user_id');
  const sByUser = indexBy(sheetLeads,   'user_id');

  const onlyInBackend = [...bByUser.keys()].filter(k => !sByUser.has(k));
  const onlyInSheet   = [...sByUser.keys()].filter(k => !bByUser.has(k));

  console.log(`window           : ${SINCE || 'all-time'}`);
  console.log(`backend leads    : ${bByUser.size}`);
  console.log(`sheet leads      : ${sByUser.size}`);
  console.log(`only in backend  : ${onlyInBackend.length}`);
  console.log(`only in sheet    : ${onlyInSheet.length}`);

  if (onlyInBackend.length) console.log('  backend-only sample:', onlyInBackend.slice(0, 5));
  if (onlyInSheet.length)   console.log('  sheet-only sample  :', onlyInSheet.slice(0, 5));

  const drift = onlyInBackend.length + onlyInSheet.length;
  if (drift === 0) {
    console.log('PARITY: OK');
    process.exit(0);
  } else {
    console.log(`PARITY: DRIFT (${drift})`);
    process.exit(1);
  }
})().catch(err => {
  console.error('[parity] error:', err.message);
  process.exit(2);
});
