// Convert live data.js into per-role JSON files used by app.jsx.
// Run: node data/build-role-data.js
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'live-data.js'), 'utf8');
// Eval in a sandbox-ish way (it's plain const declarations, no DOM access)
const ctx = {};
const wrapped = src + '\nctx.ROLES = ROLES; ctx.ROLE_DESCS = ROLE_DESCS; ctx.ROLE_TRANSITIONS = ROLE_TRANSITIONS; ctx.ROLE_TRANSITION_SKILLS = ROLE_TRANSITION_SKILLS; ctx.ROLE_SKILLS = ROLE_SKILLS; ctx.BANDS = BANDS;';
new Function('ctx', wrapped)(ctx);

const roleSlug = {
  'Product Manager': 'product',
  'Business / Strategy Consultant': 'consult',
  'Operations / Supply Chain Manager': 'ops',
  'Marketing / Growth Manager': 'marketing',
  'Tech Professional transitioning to Business': 'tech',
  'Founder / Entrepreneur': 'founder',
  'Finance / Commercial Manager': 'finance',
};

const curriculumLine = '95% of these skills are covered in the Scaler Online PGP in Business & AI curriculum — through live sessions, hands-on projects, and real-world case studies across 12 months.';

for (const role of ctx.ROLES) {
  const slug = roleSlug[role];
  if (!slug) continue;

  // questions_<slug>.json: array of { title, sub, levels[] }
  const skills = ctx.ROLE_SKILLS[role];
  const questions = skills.map(s => ({
    title: s.area,
    sub: 'Select the level that best describes where you are today.',
    levels: s.levels.map((txt, i) => `Level ${i + 1} — ${txt}`),
  }));
  fs.writeFileSync(
    path.join(__dirname, `questions_${slug}.json`),
    JSON.stringify(questions, null, 2)
  );

  // results_<slug>.json
  const results = {
    currentRole: role,
    targetRole: ctx.ROLE_TRANSITIONS[role],
    bands: ctx.BANDS.map(b => b.label),
    transitionSkills: ctx.ROLE_TRANSITION_SKILLS[role].map(s => ({
      name: s.label,
      desc: s.detail,
    })),
    curriculumLine,
  };
  fs.writeFileSync(
    path.join(__dirname, `results_${slug}.json`),
    JSON.stringify(results, null, 2)
  );

  console.log(`wrote ${slug}: ${questions.length} questions, ${results.transitionSkills.length} transition skills`);
}

// Also dump consolidated bands meta for the app
fs.writeFileSync(
  path.join(__dirname, 'bands.json'),
  JSON.stringify(ctx.BANDS.map(b => ({
    min: b.min, max: b.max, name: b.label, desc: b.meaning,
  })), null, 2)
);
console.log('wrote bands.json');
