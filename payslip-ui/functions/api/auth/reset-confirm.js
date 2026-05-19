import { hashPassword } from '../../lib/auth.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { email, token, password } = await request.json();

    if (!email || !token || !password) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const user = await env.ksom_payslip_db.prepare(
      "SELECT id, reset_token, reset_token_expiry FROM users WHERE email = ?"
    ).bind(email.toLowerCase()).first();

    if (!user || user.reset_token !== token || new Date(user.reset_token_expiry) < new Date()) {
      return new Response(JSON.stringify({ error: "Invalid or expired reset token" }), { status: 400 });
    }

    const hashed = await hashPassword(password);

    await env.ksom_payslip_db.prepare(
      "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?"
    ).bind(hashed, user.id).run();

    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
