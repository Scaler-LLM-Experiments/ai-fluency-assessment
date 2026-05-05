const express = require('express');
const { Pool } = require('pg');
const crmSync = require('./lib/sync-worker');
const { verifyToken, renderReport } = require('./lib/report');

const app = express();
const PORT = process.env.PORT || 8080;
const API_TOKEN = process.env.API_TOKEN || '';
const DATABASE_URL = process.env.DATABASE_URL || '';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim());

const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    })
  : null;

app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

async function ensureSchema() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leads (
      user_id        TEXT PRIMARY KEY,
      name           TEXT,
      email          TEXT,
      phone          TEXT,
      role           TEXT,
      status         TEXT DEFAULT 'started',
      score          INTEGER,
      band           TEXT,
      last_question  INTEGER DEFAULT 0,
      completed      BOOLEAN DEFAULT FALSE,
      requested_callback BOOLEAN DEFAULT FALSE,
      clicked_curriculum BOOLEAN DEFAULT FALSE,
      retook_test    BOOLEAN DEFAULT FALSE,
      traffic_source TEXT,
      utm_source     TEXT,
      utm_medium     TEXT,
      utm_campaign   TEXT,
      utm_term       TEXT,
      utm_content    TEXT,
      referrer       TEXT,
      first_seen_ist TEXT,
      last_seen_ist  TEXT,
      created_at     TIMESTAMPTZ DEFAULT NOW(),
      updated_at     TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_leads_email   ON leads(email);
    CREATE INDEX IF NOT EXISTS idx_leads_phone   ON leads(phone);
    CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_leads_updated ON leads(updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_leads_status  ON leads(status);

    CREATE TABLE IF NOT EXISTS events (
      id              BIGSERIAL PRIMARY KEY,
      user_id         TEXT NOT NULL,
      event           TEXT NOT NULL,
      timestamp_ist   TEXT,
      date_ist        TEXT,
      time_ist        TEXT,
      question_number INTEGER,
      question_name   TEXT,
      answer_level    TEXT,
      score           INTEGER,
      band            TEXT,
      payload         JSONB,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_events_user    ON events(user_id);
    CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_events_event   ON events(event);

    ALTER TABLE leads  ADD COLUMN IF NOT EXISTS crm_prospect_id   TEXT;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS crm_synced_at     TIMESTAMPTZ;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS crm_sync_attempts INTEGER DEFAULT 0;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS crm_sync_error    TEXT;
    CREATE INDEX IF NOT EXISTS idx_events_crm_pending
      ON events(created_at) WHERE crm_synced_at IS NULL;
  `);
}

function requireAuth(req, res, next) {
  if (!API_TOKEN) return res.status(503).json({ error: 'API_TOKEN not configured' });
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== API_TOKEN) return res.status(401).json({ error: 'unauthorized' });
  next();
}

app.get('/', (req, res) => {
  res.json({ service: 'ai-fluency-backend', status: 'ok' });
});

app.get('/health', async (req, res) => {
  let db = 'disabled';
  if (pool) {
    try {
      await pool.query('SELECT 1');
      db = 'ok';
    } catch (e) {
      db = 'error: ' + e.message;
    }
  }
  res.json({
    status: 'ok',
    db,
    auth: API_TOKEN ? 'on' : 'off',
    time: new Date().toISOString(),
  });
});

app.post('/api/track', async (req, res) => {
  res.json({ ok: true });
  if (!pool) return;

  const d = req.body || {};
  if (!d.user_id || !d.event) return;

  try {
    await pool.query(
      `INSERT INTO events (user_id, event, timestamp_ist, date_ist, time_ist,
        question_number, question_name, answer_level, score, band, payload)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        d.user_id, d.event,
        d.timestamp_ist || null, d.date_ist || null, d.time_ist || null,
        d.question_number || null, d.question_name || null, d.answer_level || null,
        d.score != null && d.score !== '' ? Number(d.score) : null,
        d.band || null,
        d,
      ]
    );

    const ts = d.timestamp_ist || null;
    await pool.query(
      `INSERT INTO leads (user_id, name, email, phone, traffic_source,
         utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer,
         first_seen_ist, last_seen_ist)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$12)
       ON CONFLICT (user_id) DO UPDATE SET
         name           = COALESCE(NULLIF(EXCLUDED.name,''),  leads.name),
         email          = COALESCE(NULLIF(EXCLUDED.email,''), leads.email),
         phone          = COALESCE(NULLIF(EXCLUDED.phone,''), leads.phone),
         traffic_source = COALESCE(leads.traffic_source, EXCLUDED.traffic_source),
         utm_source     = COALESCE(leads.utm_source,     EXCLUDED.utm_source),
         utm_medium     = COALESCE(leads.utm_medium,     EXCLUDED.utm_medium),
         utm_campaign   = COALESCE(leads.utm_campaign,   EXCLUDED.utm_campaign),
         utm_term       = COALESCE(leads.utm_term,       EXCLUDED.utm_term),
         utm_content    = COALESCE(leads.utm_content,    EXCLUDED.utm_content),
         referrer       = COALESCE(leads.referrer,       EXCLUDED.referrer),
         last_seen_ist  = EXCLUDED.last_seen_ist,
         updated_at     = NOW()`,
      [
        d.user_id, d.name || '', d.email || '', d.phone || '',
        d.traffic_source || '', d.utm_source || '', d.utm_medium || '',
        d.utm_campaign || '', d.utm_term || '', d.utm_content || '',
        d.referrer || '', ts,
      ]
    );

    switch (d.event) {
      case 'role_selected':
        await pool.query(
          `UPDATE leads SET role=$2, status='in_assessment', updated_at=NOW() WHERE user_id=$1`,
          [d.user_id, d.role || '']
        );
        break;
      case 'question_answered':
        await pool.query(
          `UPDATE leads SET last_question=$2, status=$3, updated_at=NOW() WHERE user_id=$1`,
          [d.user_id, d.question_number || 0, `in_assessment (Q${d.question_number || 0}/10)`]
        );
        break;
      case 'completed':
        await pool.query(
          `UPDATE leads SET status='completed', score=$2, band=$3, last_question=10,
             completed=TRUE, updated_at=NOW() WHERE user_id=$1`,
          [d.user_id, d.score != null && d.score !== '' ? Number(d.score) : null, d.band || null]
        );
        break;
      case 'requested_callback':
        await pool.query(`UPDATE leads SET requested_callback=TRUE, updated_at=NOW() WHERE user_id=$1`, [d.user_id]);
        break;
      case 'clicked_curriculum':
        await pool.query(`UPDATE leads SET clicked_curriculum=TRUE, updated_at=NOW() WHERE user_id=$1`, [d.user_id]);
        break;
      case 'retook_test':
        await pool.query(`UPDATE leads SET retook_test=TRUE, updated_at=NOW() WHERE user_id=$1`, [d.user_id]);
        break;
    }
  } catch (err) {
    console.error('[track] error:', err.message);
  }
});

app.get('/api/leads', requireAuth, async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'db disabled' });
  const limit  = Math.min(Number(req.query.limit) || 100, 1000);
  const offset = Number(req.query.offset) || 0;
  const since  = req.query.since;
  const status = req.query.status;
  const callback = req.query.callback;

  const where = [];
  const args = [];
  if (since)    { args.push(since);    where.push(`updated_at >= $${args.length}`); }
  if (status)   { args.push(status);   where.push(`status = $${args.length}`); }
  if (callback === 'true') where.push(`requested_callback = TRUE`);

  const sql = `SELECT * FROM leads ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
               ORDER BY updated_at DESC LIMIT ${limit} OFFSET ${offset}`;
  try {
    const { rows } = await pool.query(sql, args);
    res.json({ count: rows.length, leads: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/leads/:user_id', requireAuth, async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'db disabled' });
  try {
    const lead   = await pool.query('SELECT * FROM leads WHERE user_id=$1', [req.params.user_id]);
    if (!lead.rows[0]) return res.status(404).json({ error: 'not found' });
    const events = await pool.query(
      'SELECT * FROM events WHERE user_id=$1 ORDER BY created_at ASC',
      [req.params.user_id]
    );
    res.json({ lead: lead.rows[0], events: events.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// BDA-facing one-click report. Signed token in URL — no login.
app.get('/api/leads/:user_id/report', async (req, res) => {
  if (!pool) return res.status(503).send('db disabled');
  const userId = req.params.user_id;
  if (!verifyToken(userId, req.query.t)) {
    return res.status(403).type('text/plain').send('invalid or missing token');
  }
  try {
    const lead = await pool.query('SELECT * FROM leads WHERE user_id=$1', [userId]);
    if (!lead.rows[0]) return res.status(404).type('text/plain').send('lead not found');
    const events = await pool.query(
      'SELECT * FROM events WHERE user_id=$1 ORDER BY created_at ASC',
      [userId]
    );
    res.setHeader('Cache-Control', 'private, max-age=60');
    res.type('html').send(renderReport({ lead: lead.rows[0], events: events.rows }));
  } catch (e) {
    res.status(500).type('text/plain').send('error: ' + e.message);
  }
});

app.get('/api/sync-failures', requireAuth, async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'db disabled' });
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  try {
    const { rows } = await pool.query(
      `SELECT id, user_id, event, crm_sync_attempts, crm_sync_error, created_at
       FROM events
       WHERE crm_synced_at IS NULL AND crm_sync_error IS NOT NULL
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );
    res.json({ count: rows.length, failures: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/sync-failures/:id/retry', requireAuth, async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'db disabled' });
  try {
    const { rowCount } = await pool.query(
      `UPDATE events SET crm_sync_attempts = 0, crm_sync_error = NULL
       WHERE id = $1 AND crm_synced_at IS NULL`,
      [req.params.id]
    );
    res.json({ reset: rowCount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/stats', requireAuth, async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'db disabled' });
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)                               AS total,
        COUNT(*) FILTER (WHERE completed)      AS completed,
        COUNT(*) FILTER (WHERE requested_callback) AS callbacks,
        AVG(score) FILTER (WHERE completed)    AS avg_score
      FROM leads
    `);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

(async () => {
  try {
    await ensureSchema();
    console.log(`[db] schema ready (db=${pool ? 'on' : 'off'})`);
  } catch (e) {
    console.error('[db] schema init failed:', e.message);
  }
  if (pool) crmSync.start(pool);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ai-fluency-backend listening on 0.0.0.0:${PORT}  db=${pool ? 'on' : 'off'}  auth=${API_TOKEN ? 'on' : 'off'}`);
  });
})();
