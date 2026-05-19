import { hashPassword } from '../../lib/auth.js';

export async function onRequestPost(context) {
  const { request, env, data } = context;
  
  if (!data.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { password } = await request.json();

    if (!password || password.length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), { 
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const hashed = await hashPassword(password);

    await env.ksom_payslip_db.prepare(
      "UPDATE users SET password_hash = ? WHERE id = ?"
    ).bind(hashed, data.user.id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
