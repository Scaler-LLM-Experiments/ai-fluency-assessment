/**
 * AI Fluency Assessment — Google Apps Script
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com
 * 2. Click "New Project"
 * 3. Delete the default code and paste this entire file
 * 4. Click "Run" > "setup" (first time only — this creates the sheets)
 * 5. Authorize when prompted (click "Advanced" > "Go to project" if needed)
 * 6. Click "Deploy" > "New deployment"
 * 7. Type: "Web app"
 * 8. Execute as: "Me"
 * 9. Who has access: "Anyone"
 * 10. Click "Deploy" and copy the URL
 * 11. Paste that URL into index.html where it says YOUR_GOOGLE_SHEET_WEBHOOK_URL
 * 12. Redeploy on Netlify
 */

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Raw Events sheet
  var raw = ss.getSheetByName('Raw Events');
  if (!raw) {
    raw = ss.insertSheet('Raw Events');
    raw.appendRow([
      'timestamp', 'user_id', 'event', 'name', 'email', 'phone', 'role',
      'question_number', 'question_name', 'answer_level',
      'score', 'band',
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
    ]);
    raw.getRange(1, 1, 1, raw.getLastColumn()).setFontWeight('bold');
    raw.setFrozenRows(1);
  }

  // Users summary sheet
  var users = ss.getSheetByName('Users');
  if (!users) {
    users = ss.insertSheet('Users');
    users.appendRow([
      'user_id', 'name', 'email', 'phone', 'role',
      'status', 'score', 'band', 'last_question',
      'completed', 'requested_callback', 'clicked_curriculum', 'retook_test',
      'first_seen', 'last_seen'
    ]);
    users.getRange(1, 1, 1, users.getLastColumn()).setFontWeight('bold');
    users.setFrozenRows(1);
  }

  // Dashboard sheet
  var dash = ss.getSheetByName('Dashboard');
  if (!dash) {
    dash = ss.insertSheet('Dashboard');

    // Headers
    dash.getRange('A1').setValue('METRIC').setFontWeight('bold');
    dash.getRange('B1').setValue('VALUE').setFontWeight('bold');

    // Metrics
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

    dash.getRange('A17').setValue('Dropped at login (no role selected)');
    dash.getRange('B17').setFormula('=COUNTIF(Users!F2:F,"started")');

    dash.getRange('A18').setValue('Dropped during assessment');
    dash.getRange('B18').setFormula('=COUNTIFS(Users!F2:F,"in_assessment*",Users!J2:J,FALSE)');

    dash.getRange('A19').setValue('Completed but no callback');
    dash.getRange('B19').setFormula('=COUNTIFS(Users!J2:J,TRUE,Users!K2:K,FALSE)');

    dash.getRange('A21').setValue('ROLE BREAKDOWN').setFontWeight('bold');
    dash.getRange('B21').setValue('COUNT').setFontWeight('bold');

    dash.getRange('A22').setValue('Product Manager');
    dash.getRange('B22').setFormula('=COUNTIF(Users!E2:E,"Product Manager")');

    dash.getRange('A23').setValue('Business / Strategy Consultant');
    dash.getRange('B23').setFormula('=COUNTIF(Users!E2:E,"Business / Strategy Consultant")');

    dash.getRange('A24').setValue('Operations / Supply Chain Manager');
    dash.getRange('B24').setFormula('=COUNTIF(Users!E2:E,"Operations / Supply Chain Manager")');

    dash.getRange('A25').setValue('Marketing / Growth Manager');
    dash.getRange('B25').setFormula('=COUNTIF(Users!E2:E,"Marketing / Growth Manager")');

    dash.getRange('A26').setValue('Tech transitioning to Business');
    dash.getRange('B26').setFormula('=COUNTIF(Users!E2:E,"Tech Professional transitioning to Business")');

    dash.getRange('A27').setValue('Founder / Entrepreneur');
    dash.getRange('B27').setFormula('=COUNTIF(Users!E2:E,"Founder / Entrepreneur")');

    dash.getRange('A28').setValue('Finance / Commercial Manager');
    dash.getRange('B28').setFormula('=COUNTIF(Users!E2:E,"Finance / Commercial Manager")');

    // Auto-resize
    dash.autoResizeColumn(1);
    dash.autoResizeColumn(2);
  }

  Logger.log('Setup complete! 3 sheets created: Raw Events, Users, Dashboard');
}


function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var d = JSON.parse(e.postData.contents);

  // ── Write to Raw Events ──
  var raw = ss.getSheetByName('Raw Events');
  if (!raw) { setup(); raw = ss.getSheetByName('Raw Events'); }

  var row = [
    d.timestamp, d.user_id, d.event, d.name || '', d.email || '', d.phone || '', d.role || '',
    d.question_number || '', d.question_name || '', d.answer_level || '',
    d.score || '', d.band || ''
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

  if (userRow === -1) {
    // New user
    users.appendRow([
      d.user_id, d.name || '', d.email || '', d.phone || '', '',
      'started', '', '', 0,
      false, false, false, false,
      d.timestamp, d.timestamp
    ]);
    userRow = users.getLastRow();
  }

  // Always update last_seen
  users.getRange(userRow, 15).setValue(d.timestamp);

  // Update name/email/phone if provided (in case they were empty before)
  if (d.name) users.getRange(userRow, 2).setValue(d.name);
  if (d.email) users.getRange(userRow, 3).setValue(d.email);
  if (d.phone) users.getRange(userRow, 4).setValue(d.phone);

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
