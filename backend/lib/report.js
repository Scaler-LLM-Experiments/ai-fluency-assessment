// BDA-facing per-lead report. Renders one HTML page showing each question and
// the answer level the learner picked, alongside what the other levels said.
//
// Auth: HMAC-signed token in URL (?t=<sig>). Token = HMAC_SHA256(API_TOKEN, user_id),
// truncated to 16 hex chars. Shareable, not enumerable.

const crypto = require('crypto');
const { ROLE_SKILLS } = require('./question-bank');

function signToken(userId) {
  const secret = process.env.API_TOKEN || '';
  return crypto.createHmac('sha256', secret).update(String(userId)).digest('hex').slice(0, 16);
}
function verifyToken(userId, t) {
  if (!t || typeof t !== 'string') return false;
  const expected = signToken(userId);
  // constant-time compare
  if (expected.length !== t.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(t));
}

function reportUrl(baseUrl, userId) {
  const t = signToken(userId);
  return `${baseUrl.replace(/\/$/, '')}/api/leads/${encodeURIComponent(userId)}/report?t=${t}`;
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function bandColor(band) {
  const map = {
    'AI Beginner':   '#dc2626',
    'AI Aware':      '#ea580c',
    'AI Capable':    '#16a34a',
    'AI Leader':     '#0ea5e9',
  };
  return map[band] || '#374151';
}

// Build an array of { area, levelChosen, levels: [...] } for the lead.
// Source of truth for each Q is the question_answered events; bank fills in level text.
function buildAnswerTrail(role, events) {
  const skills = ROLE_SKILLS[role] || [];
  const byArea = new Map(skills.map((s, idx) => [s.area, { idx, levels: s.levels }]));

  const answered = events
    .filter(e => e.event === 'question_answered')
    .sort((a, b) => (a.question_number || 0) - (b.question_number || 0));

  const seen = new Set();
  const rows = [];
  for (const e of answered) {
    const area = e.question_name || '';
    if (seen.has(area)) continue; // dedupe retakes — show first answer
    seen.add(area);
    const bankEntry = byArea.get(area);
    rows.push({
      qNum: e.question_number,
      area,
      answerLevel: e.answer_level,           // 1..5
      levels: bankEntry ? bankEntry.levels : [],
    });
  }
  return rows;
}

function renderReport({ lead, events }) {
  const trail = buildAnswerTrail(lead.role, events);
  const bandHex = bandColor(lead.band);
  const completed = events.find(e => e.event === 'completed');
  const requestedCb = events.find(e => e.event === 'requested_callback');

  const trailHtml = trail.length
    ? trail.map(t => {
        const levels = (t.levels || []).map((txt, i) => {
          const lvl = i + 1;
          const isAnswer = lvl === t.answerLevel;
          return `
            <li class="level ${isAnswer ? 'is-answer' : ''}">
              <span class="lvl-num">L${lvl}</span>
              <span class="lvl-text">${esc(txt)}</span>
              ${isAnswer ? '<span class="badge">Their answer</span>' : ''}
            </li>`;
        }).join('');
        return `
          <section class="q">
            <header>
              <span class="qnum">Q${t.qNum}</span>
              <h3>${esc(t.area)}</h3>
              <span class="answered">Answered: <b>L${t.answerLevel || '—'}</b> / 5</span>
            </header>
            <ul class="levels">${levels}</ul>
          </section>`;
      }).join('')
    : '<p class="empty">No question-level data found for this lead yet.</p>';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>AI Fluency report — ${esc(lead.name || lead.email || lead.user_id)}</title>
<style>
  :root { --fg:#0f172a; --muted:#64748b; --line:#e2e8f0; --bg:#f8fafc; --accent:${bandHex}; }
  * { box-sizing: border-box; }
  body { margin:0; font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; color:var(--fg); background:var(--bg); }
  .wrap { max-width: 880px; margin: 0 auto; padding: 32px 20px 80px; }
  .hero { background:#fff; border:1px solid var(--line); border-radius:14px; padding:24px; margin-bottom:24px; }
  .hero h1 { margin:0 0 4px; font-size:22px; }
  .hero .sub { color:var(--muted); font-size:13px; }
  .stats { display:flex; gap:24px; margin-top:18px; flex-wrap:wrap; }
  .stat { background:#f1f5f9; border-radius:10px; padding:12px 16px; min-width:120px; }
  .stat .k { font-size:11px; text-transform:uppercase; letter-spacing:.04em; color:var(--muted); }
  .stat .v { font-size:20px; font-weight:600; margin-top:2px; }
  .stat.score .v { color: var(--accent); }
  .pill { display:inline-block; padding:3px 10px; border-radius:999px; background:var(--accent); color:#fff; font-size:12px; font-weight:600; margin-left:6px; }
  .lead-meta { display:grid; grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); gap:8px 24px; margin-top:18px; font-size:13px; }
  .lead-meta div span { color:var(--muted); display:block; font-size:11px; text-transform:uppercase; letter-spacing:.04em; }
  .q { background:#fff; border:1px solid var(--line); border-radius:14px; padding:20px; margin-bottom:14px; }
  .q header { display:flex; align-items:baseline; gap:10px; margin-bottom:12px; flex-wrap:wrap; }
  .q .qnum { background:#0f172a; color:#fff; font-size:11px; font-weight:600; padding:3px 8px; border-radius:6px; }
  .q h3 { margin:0; font-size:16px; flex:1; }
  .q .answered { color:var(--muted); font-size:12px; }
  .q .answered b { color:var(--accent); font-size:13px; }
  ul.levels { list-style:none; margin:0; padding:0; }
  li.level { display:flex; gap:10px; padding:10px 12px; border-radius:8px; margin-bottom:6px; align-items:flex-start; }
  li.level.is-answer { background:#fffbeb; border:1px solid #fde68a; }
  li.level .lvl-num { font-size:11px; font-weight:700; color:var(--muted); width:24px; flex:none; padding-top:1px; }
  li.level.is-answer .lvl-num { color:#92400e; }
  li.level .lvl-text { flex:1; font-size:13.5px; color:#334155; }
  li.level.is-answer .lvl-text { color:#0f172a; }
  .badge { background:#92400e; color:#fff; font-size:10px; padding:2px 7px; border-radius:999px; font-weight:600; align-self:center; flex:none; }
  .empty { color:var(--muted); text-align:center; padding:40px; }
  .footer { color:var(--muted); font-size:12px; margin-top:32px; text-align:center; }
  @media print { body { background:#fff; } .q,.hero { break-inside: avoid; } }
</style>
</head>
<body>
  <div class="wrap">
    <div class="hero">
      <h1>${esc(lead.name || '—')} <span class="pill">${esc(lead.band || '—')}</span></h1>
      <div class="sub">AI Business Fluency Assessment · for BDA conversation</div>

      <div class="stats">
        <div class="stat score"><div class="k">Score</div><div class="v">${lead.score ?? '—'} / 50</div></div>
        <div class="stat"><div class="k">Band</div><div class="v">${esc(lead.band || '—')}</div></div>
        <div class="stat"><div class="k">Role</div><div class="v">${esc(lead.role || '—')}</div></div>
        <div class="stat"><div class="k">Callback</div><div class="v">${requestedCb ? 'Requested' : '—'}</div></div>
      </div>

      <div class="lead-meta">
        <div><span>Email</span>${esc(lead.email || '—')}</div>
        <div><span>Phone</span>${esc(lead.phone || '—')}</div>
        <div><span>Source</span>${esc(lead.utm_source || lead.traffic_source || '—')}</div>
        <div><span>Campaign</span>${esc(lead.utm_campaign || '—')}</div>
        <div><span>Completed</span>${esc(completed?.timestamp_ist || lead.last_seen_ist || '—')}</div>
        <div><span>User ID</span><code style="font-size:11px">${esc(lead.user_id)}</code></div>
      </div>
    </div>

    <h2 style="font-size:15px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin:28px 0 12px">Their answers — question by question</h2>
    ${trailHtml}

    <div class="footer">Highlighted answer is what the learner picked. Use these to drive the conversation — anchor on gaps between their level and L4/L5.</div>
  </div>
</body>
</html>`;
}

module.exports = { signToken, verifyToken, reportUrl, renderReport, buildAnswerTrail };
