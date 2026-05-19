export async function getAccessToken(clientId, clientSecret, refreshToken) {
  const params = new URLSearchParams({ 
    client_id: clientId, 
    client_secret: clientSecret, 
    refresh_token: refreshToken, 
    grant_type: "refresh_token" 
  });
  const res = await fetch("https://oauth2.googleapis.com/token", { 
    method: "POST", 
    headers: { "Content-Type": "application/x-www-form-urlencoded" }, 
    body: params 
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error);
  return data.access_token;
}

export function buildMimeMessage({ from, to, subject, text, attachments = [] }) {
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

export function base64url(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
