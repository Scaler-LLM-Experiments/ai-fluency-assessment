const https = require('https');

const LICENSE = process.env.WEBENGAGE_LICENSE_CODE || '';
const API_KEY = process.env.WEBENGAGE_API_KEY || '';

function isConfigured() {
  return !!(LICENSE && API_KEY);
}

function post(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          Authorization: `Bearer ${API_KEY}`,
        },
      },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => resolve({ status: res.statusCode, body: buf }));
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function trackEvent(userId, eventName, eventData = {}, userAttributes = {}) {
  if (!isConfigured()) {
    console.log(`[webengage] skipped "${eventName}" — not configured`);
    return;
  }

  const url = `https://api.webengage.com/v2/accounts/${LICENSE}/events`;
  const payload = {
    userId,
    events: [
      {
        eventName,
        eventTime: new Date().toISOString(),
        eventData,
      },
    ],
  };

  if (Object.keys(userAttributes).length > 0) {
    payload.userAttributes = userAttributes;
  }

  try {
    const { status, body } = await post(url, payload);
    if (status < 200 || status >= 300) {
      console.error(`[webengage] "${eventName}" failed: HTTP ${status} — ${body}`);
    } else {
      console.log(`[webengage] "${eventName}" sent successfully`);
    }
  } catch (err) {
    console.error(`[webengage] "${eventName}" error:`, err.message);
  }
}

module.exports = { trackEvent, isConfigured };
