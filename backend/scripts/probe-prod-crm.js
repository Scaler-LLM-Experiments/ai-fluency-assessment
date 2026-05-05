// Reproduce the exact CreateLeadAndActivity call for the failing lead
// to capture the prod CRM error body.
const { Pool } = require('pg');
const { buildCreateLeadAndActivity } = require('../lib/crm-payloads');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL missing'); process.exit(2); }

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('localhost') || DATABASE_URL.includes('railway.internal')
    ? false : { rejectUnauthorized: false },
  max: 2,
});

const USER_ID = '9ccbe0b0-6015-420c-a73d-b5bc3e06a244';
const EVENT_ID = 278;

(async () => {
  const lead = (await pool.query('SELECT * FROM leads WHERE user_id=$1', [USER_ID])).rows[0];
  const event = (await pool.query('SELECT * FROM events WHERE id=$1', [EVENT_ID])).rows[0];
  console.log('lead:', JSON.stringify(lead, null, 2));
  console.log('event:', JSON.stringify(event, null, 2));

  const payload = buildCreateLeadAndActivity(lead, event);
  console.log('\n--- PAYLOAD ---');
  console.log(JSON.stringify(payload, null, 2));
  console.log('--- END ---\n');

  const url = `${process.env.CRM_BASE_URL.replace(/\/+$/, '')}/ActivityManagement.svc/CreateLeadAndActivity`;
  console.log('POST', url);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Key': process.env.CRM_ACCESS_KEY,
      'X-Secret-Key': process.env.CRM_SECRET_KEY,
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  console.log('status:', res.status);
  console.log('body:', text);

  await pool.end();
})().catch(e => { console.error('crashed:', e); process.exit(2); });
