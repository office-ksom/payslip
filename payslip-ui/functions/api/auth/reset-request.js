import { getAccessToken, buildMimeMessage, base64url } from '../../lib/gmail.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  try {
    const { email } = await request.json();
    if (!email) return new Response('Email required', { status: 400 });

    const user = await env.ksom_payslip_db.prepare(
      "SELECT id FROM users WHERE email = ? AND status = 'active'"
    ).bind(email.toLowerCase()).first();

    if (!user) {
      // Don't reveal if user exists, but don't send email
      return new Response(JSON.stringify({ success: true, message: "If the email is registered, a reset link will be sent." }));
    }

    // Generate token
    const token = crypto.randomUUID();
    const expiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    await env.ksom_payslip_db.prepare(
      "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?"
    ).bind(token, expiry, user.id).run();

    const resetLink = `${url.origin}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Send Email
    const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN } = env;
    if (GMAIL_CLIENT_ID && GMAIL_CLIENT_SECRET && GMAIL_REFRESH_TOKEN) {
      const accessToken = await getAccessToken(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN);
      const rawMessage = buildMimeMessage({
        from: "KSoM Office <office@ksom.res.in>",
        to: email,
        subject: "Password Reset Request - KSoM Portal",
        text: `You requested a password reset. Click the link below to set a new password:\n\n${resetLink}\n\nThis link expires in 1 hour.`
      });

      await fetch("https://www.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ raw: base64url(rawMessage) })
      });
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
