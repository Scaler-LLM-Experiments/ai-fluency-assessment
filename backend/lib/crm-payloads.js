// Builds CRM-shaped payloads from our (lead, event) rows.
//
// All numeric ActivityEvent codes and the mx_Custom_* slot meanings are
// PLACEHOLDERS until the CRM admin returns the program's lookup table.
// Override at runtime via env vars without redeploying:
//   CRM_ACTIVITY_CODE_COMPLETED=482
//   CRM_ACTIVITY_CODE_CALLBACK=485
//   CRM_PROGRAM_TAG=opgp_ai_fluency
//   CRM_SEARCH_BY=Phone

const PUSHED_EVENTS = new Set(['completed', 'requested_callback']);

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
  if (eventName === 'completed') {
    return [
      `AI Fluency Assessment completed`,
      `Score: ${lead.score ?? '—'}  Band: ${lead.band ?? '—'}`,
      `Role: ${lead.role ?? '—'}`,
      `Source: ${lead.traffic_source ?? 'direct'}  Campaign: ${lead.utm_campaign ?? '—'}`,
      `Completed at: ${event.timestamp_ist ?? lead.last_seen_ist ?? ''}`,
    ].join('\n');
  }
  if (eventName === 'requested_callback') {
    return [
      `Callback requested from AI Fluency Assessment`,
      `Score: ${lead.score ?? '—'}  Band: ${lead.band ?? '—'}`,
      `Role: ${lead.role ?? '—'}`,
      `Requested at: ${event.timestamp_ist ?? lead.last_seen_ist ?? ''}`,
    ].join('\n');
  }
  return `Event: ${eventName}`;
}

// mx_Custom_1..8 mapping. Lock with CRM admin before going live.
function customFields(lead, event) {
  return [
    { SchemaName: 'mx_Custom_1', Value: safeStr(programTag()) },
    { SchemaName: 'mx_Custom_2', Value: lead.score != null ? Number(lead.score) : null },
    { SchemaName: 'mx_Custom_3', Value: safeStr(lead.band) },
    { SchemaName: 'mx_Custom_4', Value: safeStr(lead.role) },
    { SchemaName: 'mx_Custom_5', Value: safeStr(lead.utm_source) },
    { SchemaName: 'mx_Custom_6', Value: safeStr(lead.utm_campaign) },
    { SchemaName: 'mx_Custom_7', Value: safeStr(event.timestamp_ist || lead.last_seen_ist) },
    { SchemaName: 'mx_Custom_8', Value: safeStr(lead.user_id) },
  ];
}

function buildActivity(lead, event) {
  const a = {
    ActivityEvent: activityCodeFor(event.event),
    ActivityNote: activityNote(event.event, lead, event),
    Fields: customFields(lead, event),
  };
  if (event.timestamp_ist) a.ActivityTime = event.timestamp_ist;
  return a;
}

function buildLeadDetails(lead) {
  const [first, last] = splitName(lead.name);
  const phone = lead.phone ? (String(lead.phone).startsWith('+') ? lead.phone : `+91-${lead.phone}`) : null;
  return [
    { Attribute: 'EmailAddress',       Value: lead.email || null },
    { Attribute: 'FirstName',          Value: first || null },
    { Attribute: 'LastName',           Value: last  || null },
    { Attribute: 'Phone',              Value: phone },
    { Attribute: 'mx_Normalized_Role', Value: safeStr(lead.role) },
    { Attribute: 'mx_Signup_Url',      Value: safeStr(lead.referrer) },
    { Attribute: 'SourceCampaign',     Value: safeStr(lead.utm_campaign) },
    { Attribute: 'SearchBy',           Value: searchBy() },
  ];
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
