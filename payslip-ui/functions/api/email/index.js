export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { to, subject, text, attachments } = data;

    const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN } = context.env;

    if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
      return new Response(JSON.stringify({
        error: "Gmail OAuth2 credentials (ID, Secret, or Refresh Token) are not configured."
      }), { status: 500 });
    }

    // 1. Get Access Token using Refresh Token
    const accessToken = await getAccessToken(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN);

    // 2. Build Raw MIME Message
    const rawMessage = buildMimeMessage({
      from: "KSoM Office <office@ksom.res.in>",
      to,
      subject: subject || "Your Payslip",
      text: text || "Please find your payslip attached.",
      attachments: attachments || []
    });

    // 3. Send via Gmail API
    const response = await fetch("https://www.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        raw: base64url(rawMessage)
      })
    });

    const result = await response.json();

    if (response.ok) {
      return new Response(JSON.stringify({ success: true, id: result.id }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } else {
      return new Response(JSON.stringify({ error: result.error?.message || "Failed to send email via Gmail" }), { status: response.status });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

async function getAccessToken(clientId, clientSecret, refreshToken) {
  const url = "https://oauth2.googleapis.com/token";
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Google OAuth error: ${data.error_description || data.error}`);
  }
  return data.access_token;
}

function buildMimeMessage({ from, to, subject, text, attachments }) {
  const boundary = "boundary_" + Math.random().toString(36).substring(2);
  let message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    text,
    ""
  ];

  for (const attachment of attachments) {
    message.push(`--${boundary}`);
    message.push(`Content-Type: application/pdf; name="${attachment.filename}"`);
    message.push(`Content-Disposition: attachment; filename="${attachment.filename}"`);
    message.push("Content-Transfer-Encoding: base64");
    message.push("");
    message.push(attachment.content);
    message.push("");
  }

  message.push(`--${boundary}--`);
  return message.join("\r\n");
}

function base64url(str) {
  // Use btoa for encoding strings to base64, then make it URL safe for Gmail API
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
