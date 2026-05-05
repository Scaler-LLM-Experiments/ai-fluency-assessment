// Builds CRM-shaped payloads from our (lead, event) rows.
//
// Activity codes and tenant-specific config come from env so we can rotate
// without redeploying. Staging values:
//   CRM_ACTIVITY_CODE_COMPLETED=651   # AI Fluency Test Completed
//   CRM_ACTIVITY_CODE_CALLBACK=652    # AI Fluency Callback Requested
//   CRM_PROGRAM_TAG=opgp_ai_fluency
//   CRM_SEARCH_BY=Phone

const { reportUrl } = require('./report');

const PUSHED_EVENTS = new Set(['completed', 'requested_callback']);

function publicBaseUrl() {
  return process.env.PUBLIC_BASE_URL
      || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : '');
}

function shouldPush(eventName) {
  return PUSHED_EVENTS.has(eventName);
}

function activityCodeFor(eventName) {
  if (eventName === 'completed')          return Number(process.env.CRM_ACTIVITY_CODE_COMPLETED || 0);
  if (eventName === 'requested_callback') return Number(process.env.CRM_ACTIVITY_CODE_CALLBACK  || 0);
  return 0;
}

function programTag() {
  return process.env.CRM_PROGRAM_TAG || 'opgp_ai_fluency';
}

function searchBy() {
  return process.env.CRM_SEARCH_BY || 'Phone';
}

function splitName(full) {
  if (!full) return ['', ''];
  const parts = String(full).trim().split(/\s+/);
  if (parts.length === 1) return [parts[0], ''];
  return [parts[0], parts.slice(1).join(' ')];
}

function safeStr(v, max = 200) {
  if (v == null) return null;
  const s = String(v);
  return s.length > max ? s.slice(0, max) : s;
}

function activityNote(eventName, lead, event) {
  // Role + report link live in their own subactivity fields (mx_Custom_2/3).
  // Note carries only band, traffic context, and timestamp.
  if (eventName === 'completed') {
    return [
      `AI Fluency Assessment completed · Band: ${lead.band ?? '—'}`,
      `Source: ${lead.traffic_source ?? 'direct'}  Campaign: ${lead.utm_campaign ?? '—'}`,
      `Completed at: ${event.timestamp_ist ?? lead.last_seen_ist ?? ''}`,
    ].join('\n');
  }
  if (eventName === 'requested_callback') {
    return [
      `Callback requested · Band: ${lead.band ?? '—'}`,
      `Requested at: ${event.timestamp_ist ?? lead.last_seen_ist ?? ''}`,
    ].join('\n');
  }
  return `Event: ${eventName}`;
}

// Activity-level custom fields. Schema names are tenant-defined.
// Confirmed on staging activity 651 (and assumed identical on prod 2818):
//   mx_Custom_1 → AI Fluency Score (number)
//   mx_Custom_2 → Role (string)
//   mx_Custom_3 → AI Fluency user inputs / BDA report URL (string)
function customFields(lead /*, event */) {
  const base = publicBaseUrl();
  const link = base ? reportUrl(base, lead.user_id) : null;
  const all = [
    { SchemaName: 'mx_Custom_1', Value: lead.score != null ? Number(lead.score) : null },
    { SchemaName: 'mx_Custom_2', Value: safeStr(lead.role) },
    { SchemaName: 'mx_Custom_3', Value: safeStr(link) },
  ];
  // Drop empty/null; tenant rejects "".
  return all.filter(f => f.Value != null && f.Value !== '');
}

function buildActivity(lead, event) {
  const a = {
    ActivityEvent: activityCodeFor(event.event),
    ActivityNote: activityNote(event.event, lead, event),
    Fields: customFields(lead, event),
  };
  // Skip ActivityTime if event is older than 24h — CRM sorts the timeline by
  // ActivityTime, so back-dated stamps bury backlog drains. Live events still
  // get an accurate timestamp.
  if (event.timestamp_ist) {
    const eventMs = new Date(event.created_at || event.timestamp_ist).getTime();
    const stale = Date.now() - eventMs > 24 * 60 * 60 * 1000;
    if (!stale) a.ActivityTime = event.timestamp_ist;
  }
  return a;
}

function buildLeadDetails(lead) {
  const [first, last] = splitName(lead.name);
  const phone = lead.phone ? (String(lead.phone).startsWith('+') ? lead.phone : `+91-${lead.phone}`) : null;
  // Tenant rejects empty strings on mandatory attributes (e.g. SourceCampaign).
  // Drop any attribute whose value is null / undefined / empty so we never send "".
  const all = [
    { Attribute: 'EmailAddress',       Value: lead.email || null },
    { Attribute: 'FirstName',          Value: first || null },
    { Attribute: 'LastName',           Value: last  || null },
    { Attribute: 'Phone',              Value: phone },
    { Attribute: 'mx_Normalized_Role', Value: safeStr(lead.role) },
    { Attribute: 'mx_Signup_Url',      Value: safeStr(lead.referrer) },
    { Attribute: 'SourceCampaign',     Value: safeStr(lead.utm_campaign) },
    { Attribute: 'SearchBy',           Value: searchBy() },
  ];
  return all.filter(a => a.Value != null && a.Value !== '');
}

function buildCreateLeadAndActivity(lead, event) {
  return {
    LeadDetails: buildLeadDetails(lead),
    Activity: buildActivity(lead, event),
  };
}

function buildCreateActivity(crmProspectId, lead, event) {
  const a = buildActivity(lead, event);
  return {
    RelatedProspectId: crmProspectId,
    ActivityEvent: a.ActivityEvent,
    ActivityNote: a.ActivityNote,
    Fields: a.Fields,
    ...(a.ActivityTime ? { ActivityTime: a.ActivityTime } : {}),
  };
}

module.exports = {
  shouldPush,
  buildCreateLeadAndActivity,
  buildCreateActivity,
  // exported for tests
  _internals: { activityCodeFor, customFields, splitName },
};
