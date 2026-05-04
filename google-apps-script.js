/**
 * AI Fluency Assessment — Google Apps Script v2
 *
 * CHANGES IN v2:
 * - All timestamps in IST (separate date + time columns)
 * - UTM source tracking (utm_source, utm_medium, utm_campaign, utm_term, utm_content)
 * - Traffic source detection (referrer, parsed source)
 * - fixOldEntries() function to convert existing UTC timestamps to IST
 *
 * SETUP:
 * 1. Go to script.google.com → open your existing project
 * 2. Replace ALL code with this file
 * 3. Run "setup" to add new column headers
 * 4. Run "fixOldEntries" to convert existing timestamps to IST
 * 5. Re-deploy: Deploy → Manage deployments → Edit → New version → Deploy
 */

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Raw Events sheet
  var raw = ss.getSheetByName('Raw Events');
  if (!raw) {
    raw = ss.insertSheet('Raw Events');
  }
  // Set headers (overwrite row 1)
  var rawHeaders = [
    'timestamp_ist', 'date_ist', 'time_ist', 'user_id', 'event',
    'name', 'email', 'phone', 'role',
    'question_number', 'question_name', 'answer_level',
    'score', 'band',
    'referrer', 'traffic_source',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'skill_1_name', 'skill_1_level',
    'skill_2_name', 'skill_2_level',
    'skill_3_name', 'skill_3_level',
    'skill_4_name', 'skill_4_level',
    'skill_5_name', 'skill_5_level',
    'skill_6_name', 'skill_6_level',
    'skill_7_name', 'skill_7_level',
    'skill_8_name', 'skill_8_level',
    'skill_9_name', 'skill_9_level',
    'skill_10_name', 'skill_10_level'
  ];
  raw.getRange(1, 1, 1, rawHeaders.length).setValues([rawHeaders]);
  raw.getRange(1, 1, 1, rawHeaders.length).setFontWeight('bold');
  raw.setFrozenRows(1);

  // Users summary sheet
  var users = ss.getSheetByName('Users');
  if (!users) {
    users = ss.insertSheet('Users');
  }
  var userHeaders = [
    'user_id', 'name', 'email', 'phone', 'role',
    'status', 'score', 'band', 'last_question',
    'completed', 'requested_callback', 'clicked_curriculum', 'retook_test',
    'first_seen_ist', 'last_seen_ist',
    'traffic_source', 'utm_source', 'utm_medium', 'utm_campaign', 'referrer'
  ];
  users.getRange(1, 1, 1, userHeaders.length).setValues([userHeaders]);
  users.getRange(1, 1, 1, userHeaders.length).setFontWeight('bold');
  users.setFrozenRows(1);

  // Dashboard sheet
  var dash = ss.getSheetByName('Dashboard');
  if (!dash) {
    dash = ss.insertSheet('Dashboard');
  }

  dash.getRange('A1').setValue('METRIC').setFontWeight('bold');
  dash.getRange('B1').setValue('VALUE').setFontWeight('bold');

  dash.getRange('A2').setValue('Total Users Started');
  dash.getRange('B2').setFormula('=COUNTA(Users!A2:A)');

  dash.getRange('A3').setValue('Users Completed');
  dash.getRange('B3').setFormula('=COUNTIF(Users!J2:J,TRUE)');

  dash.getRange('A4').setValue('% Completed');
  dash.getRange('B4').setFormula('=IF(B2>0,B3/B2,0)');
  dash.getRange('B4').setNumberFormat('0.0%');

  dash.getRange('A5').setValue('% Requested Callback');
  dash.getRange('B5').setFormula('=IF(B2>0,COUNTIF(Users!K2:K,TRUE)/B2,0)');
  dash.getRange('B5').setNumberFormat('0.0%');

  dash.getRange('A6').setValue('% Clicked Curriculum');
  dash.getRange('B6').setFormula('=IF(B2>0,COUNTIF(Users!L2:L,TRUE)/B2,0)');
  dash.getRange('B6').setNumberFormat('0.0%');

  dash.getRange('A7').setValue('% Retook Test');
  dash.getRange('B7').setFormula('=IF(B2>0,COUNTIF(Users!M2:M,TRUE)/B2,0)');
  dash.getRange('B7').setNumberFormat('0.0%');

  dash.getRange('A8').setValue('Avg Score (completed)');
  dash.getRange('B8').setFormula('=IFERROR(AVERAGEIF(Users!J2:J,TRUE,Users!G2:G),0)');
  dash.getRange('B8').setNumberFormat('0.0');

  dash.getRange('A10').setValue('SCORE DISTRIBUTION').setFontWeight('bold');
  dash.getRange('B10').setValue('COUNT').setFontWeight('bold');
  dash.getRange('A11').setValue('AI Curious (10-18)');
  dash.getRange('B11').setFormula('=COUNTIF(Users!H2:H,"AI Curious")');
  dash.getRange('A12').setValue('AI Aware (19-28)');
  dash.getRange('B12').setFormula('=COUNTIF(Users!H2:H,"AI Aware")');
  dash.getRange('A13').setValue('AI Capable (29-38)');
  dash.getRange('B13').setFormula('=COUNTIF(Users!H2:H,"AI Capable")');
  dash.getRange('A14').setValue('AI Leader (39-50)');
  dash.getRange('B14').setFormula('=COUNTIF(Users!H2:H,"AI Leader")');

  dash.getRange('A16').setValue('DROP-OFF ANALYSIS').setFontWeight('bold');
  dash.getRange('B16').setValue('COUNT').setFontWeight('bold');
  dash.getRange('A17').setValue('Dropped at login');
  dash.getRange('B17').setFormula('=COUNTIF(Users!F2:F,"started")');
  dash.getRange('A18').setValue('Dropped during assessment');
  dash.getRange('B18').setFormula('=COUNTIFS(Users!F2:F,"in_assessment*",Users!J2:J,FALSE)');
  dash.getRange('A19').setValue('Completed but no callback');
  dash.getRange('B19').setFormula('=COUNTIFS(Users!J2:J,TRUE,Users!K2:K,FALSE)');

  dash.getRange('A21').setValue('TRAFFIC SOURCES').setFontWeight('bold');
  dash.getRange('B21').setValue('COUNT').setFontWeight('bold');
  dash.getRange('A22').setValue('Direct');
  dash.getRange('B22').setFormula('=COUNTIF(Users!P2:P,"direct")');
  dash.getRange('A23').setValue('WhatsApp');
  dash.getRange('B23').setFormula('=COUNTIF(Users!P2:P,"whatsapp")');
  dash.getRange('A24').setValue('Google');
  dash.getRange('B24').setFormula('=COUNTIF(Users!P2:P,"google")');
  dash.getRange('A25').setValue('Meta (Facebook/Instagram)');
  dash.getRange('B25').setFormula('=COUNTIF(Users!P2:P,"meta")');
  dash.getRange('A26').setValue('LinkedIn');
  dash.getRange('B26').setFormula('=COUNTIF(Users!P2:P,"linkedin")');

  dash.getRange('A28').setValue('ROLE BREAKDOWN').setFontWeight('bold');
  dash.getRange('B28').setValue('COUNT').setFontWeight('bold');
  dash.getRange('A29').setValue('Product Manager');
  dash.getRange('B29').setFormula('=COUNTIF(Users!E2:E,"Product Manager")');
  dash.getRange('A30').setValue('Business / Strategy Consultant');
  dash.getRange('B30').setFormula('=COUNTIF(Users!E2:E,"Business / Strategy Consultant")');
  dash.getRange('A31').setValue('Operations / Supply Chain Manager');
  dash.getRange('B31').setFormula('=COUNTIF(Users!E2:E,"Operations / Supply Chain Manager")');
  dash.getRange('A32').setValue('Marketing / Growth Manager');
  dash.getRange('B32').setFormula('=COUNTIF(Users!E2:E,"Marketing / Growth Manager")');
  dash.getRange('A33').setValue('Tech transitioning to Business');
  dash.getRange('B33').setFormula('=COUNTIF(Users!E2:E,"Tech Professional transitioning to Business")');
  dash.getRange('A34').setValue('Founder / Entrepreneur');
  dash.getRange('B34').setFormula('=COUNTIF(Users!E2:E,"Founder / Entrepreneur")');
  dash.getRange('A35').setValue('Finance / Commercial Manager');
  dash.getRange('B35').setFormula('=COUNTIF(Users!E2:E,"Finance / Commercial Manager")');

  dash.autoResizeColumn(1);
  dash.autoResizeColumn(2);

  Logger.log('Setup complete! Headers updated on Raw Events, Users, and Dashboard.');
}


/**
 * Run this ONCE to convert old UTC timestamps to IST and split into date/time columns.
 * Only works on the Raw Events sheet.
 */
function fixOldEntries() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var raw = ss.getSheetByName('Raw Events');
  if (!raw) return;

  var lastRow = raw.getLastRow();
  if (lastRow < 2) return;

  var data = raw.getDataRange().getValues();
  var fixed = 0;

  for (var r = 1; r < data.length; r++) {
    var ts = data[r][0]; // column A — timestamp
    if (!ts) continue;

    var tsStr = String(ts);

    // Check if it's an ISO UTC string (contains T and Z or +00:00)
    if (tsStr.includes('T') && (tsStr.includes('Z') || tsStr.includes('+') || tsStr.length > 19)) {
      try {
        var utcDate = new Date(tsStr);
        // Add 5:30 for IST
        var istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));

        var year = istDate.getUTCFullYear();
        var month = ('0' + (istDate.getUTCMonth() + 1)).slice(-2);
        var day = ('0' + istDate.getUTCDate()).slice(-2);
        var hours = ('0' + istDate.getUTCHours()).slice(-2);
        var mins = ('0' + istDate.getUTCMinutes()).slice(-2);
        var secs = ('0' + istDate.getUTCSeconds()).slice(-2);

        var dateIST = year + '-' + month + '-' + day;
        var timeIST = hours + ':' + mins + ':' + secs;
        var fullIST = dateIST + ' ' + timeIST;

        // Column A = timestamp_ist, B = date_ist, C = time_ist
        raw.getRange(r + 1, 1).setValue(fullIST);
        raw.getRange(r + 1, 2).setValue(dateIST);
        raw.getRange(r + 1, 3).setValue(timeIST);
        fixed++;
      } catch (e) {
        // skip malformed timestamps
      }
    }
  }

  // Also fix Users sheet
  var users = ss.getSheetByName('Users');
  if (users && users.getLastRow() > 1) {
    var userData = users.getDataRange().getValues();
    for (var r = 1; r < userData.length; r++) {
      // Column N (14) = first_seen, Column O (15) = last_seen
      for (var col = 13; col <= 14; col++) {
        var val = String(userData[r][col] || '');
        if (val.includes('T') && (val.includes('Z') || val.includes('+'))) {
          try {
            var d = new Date(val);
            var ist = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
            var y = ist.getUTCFullYear();
            var m = ('0' + (ist.getUTCMonth() + 1)).slice(-2);
            var dy = ('0' + ist.getUTCDate()).slice(-2);
            var h = ('0' + ist.getUTCHours()).slice(-2);
            var mi = ('0' + ist.getUTCMinutes()).slice(-2);
            var s = ('0' + ist.getUTCSeconds()).slice(-2);
            users.getRange(r + 1, col + 1).setValue(y + '-' + m + '-' + dy + ' ' + h + ':' + mi + ':' + s);
          } catch (e) {}
        }
      }
    }
  }

  Logger.log('Fixed ' + fixed + ' old entries to IST.');
}


function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var d = JSON.parse(e.postData.contents);

  // ── Write to Raw Events ──
  var raw = ss.getSheetByName('Raw Events');
  if (!raw) { setup(); raw = ss.getSheetByName('Raw Events'); }

  var row = [
    d.timestamp_ist || d.timestamp || '',
    d.date_ist || '',
    d.time_ist || '',
    d.user_id, d.event,
    d.name || '', d.email || '', d.phone || '', d.role || '',
    d.question_number || '', d.question_name || '', d.answer_level || '',
    d.score || '', d.band || '',
    d.referrer || '', d.traffic_source || '',
    d.utm_source || '', d.utm_medium || '', d.utm_campaign || '', d.utm_term || '', d.utm_content || ''
  ];
  for (var i = 1; i <= 10; i++) {
    row.push(d['skill_' + i + '_name'] || '', d['skill_' + i + '_level'] || '');
  }
  raw.appendRow(row);

  // ── Update Users summary ──
  var users = ss.getSheetByName('Users');
  if (!users) { setup(); users = ss.getSheetByName('Users'); }

  var data = users.getDataRange().getValues();
  var userRow = -1;
  for (var r = 1; r < data.length; r++) {
    if (data[r][0] === d.user_id) { userRow = r + 1; break; }
  }

  var tsIST = d.timestamp_ist || d.timestamp || new Date().toISOString();

  if (userRow === -1) {
    // New user — 20 columns
    users.appendRow([
      d.user_id, d.name || '', d.email || '', d.phone || '', '',
      'started', '', '', 0,
      false, false, false, false,
      tsIST, tsIST,
      d.traffic_source || '', d.utm_source || '', d.utm_medium || '', d.utm_campaign || '', d.referrer || ''
    ]);
    userRow = users.getLastRow();
  }

  // Always update last_seen
  users.getRange(userRow, 15).setValue(tsIST);

  // Update name/email/phone if provided
  if (d.name) users.getRange(userRow, 2).setValue(d.name);
  if (d.email) users.getRange(userRow, 3).setValue(d.email);
  if (d.phone) users.getRange(userRow, 4).setValue(d.phone);

  // Update traffic source on first event
  if (d.traffic_source && !users.getRange(userRow, 16).getValue()) {
    users.getRange(userRow, 16).setValue(d.traffic_source);
    users.getRange(userRow, 17).setValue(d.utm_source || '');
    users.getRange(userRow, 18).setValue(d.utm_medium || '');
    users.getRange(userRow, 19).setValue(d.utm_campaign || '');
    users.getRange(userRow, 20).setValue(d.referrer || '');
  }

  // Event-specific updates
  switch (d.event) {
    case 'role_selected':
      users.getRange(userRow, 5).setValue(d.role || '');
      users.getRange(userRow, 6).setValue('in_assessment');
      break;

    case 'question_answered':
      var qNum = d.question_number || 0;
      users.getRange(userRow, 9).setValue(qNum);
      users.getRange(userRow, 6).setValue('in_assessment (Q' + qNum + '/10)');
      break;

    case 'completed':
      users.getRange(userRow, 6).setValue('completed');
      users.getRange(userRow, 7).setValue(d.score || '');
      users.getRange(userRow, 8).setValue(d.band || '');
      users.getRange(userRow, 9).setValue(10);
      users.getRange(userRow, 10).setValue(true);
      break;

    case 'requested_callback':
      users.getRange(userRow, 11).setValue(true);
      break;

    case 'clicked_curriculum':
      users.getRange(userRow, 12).setValue(true);
      break;

    case 'retook_test':
      users.getRange(userRow, 13).setValue(true);
      break;
  }

  return ContentService.createTextOutput('ok');
}


/**
 * Read endpoint for parity checks against the Postgres backend.
 *
 * Usage:
 *   GET <webapp_url>?action=list                    → all users from the Users sheet
 *   GET <webapp_url>?action=list&since=2026-04-30   → users with last_seen_ist >= since
 *
 * Returns JSON: [{ user_id, name, email, phone, role, status, ..., last_seen_ist }, ...]
 *
 * IMPORTANT: After editing this function you MUST redeploy the Apps Script web app
 * (Deploy → Manage deployments → Edit → New version → Deploy) for the change to go live.
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || '';
  if (action !== 'list') {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'unknown action', hint: 'use ?action=list' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var since = (e.parameter.since || '').trim();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var users = ss.getSheetByName('Users');
  if (!users || users.getLastRow() < 2) {
    return ContentService
      .createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var values = users.getDataRange().getValues();
  var headers = values[0];
  var out = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    if (!row[0]) continue; // no user_id

    if (since) {
      var lastSeen = String(row[14] || ''); // column O = last_seen_ist
      if (lastSeen && lastSeen < since) continue;
    }

    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      var v = row[c];
      if (v instanceof Date) v = v.toISOString();
      obj[headers[c]] = v === '' ? null : v;
    }
    out.push(obj);
  }

  return ContentService
    .createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}
