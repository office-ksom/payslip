import { hashPassword } from '../../lib/auth.js';

export async function onRequestPost(context) {
  const { request, env, data } = context;
  
  // RBAC check is already done in _middleware.js for /api/users
  // But let's double check role if needed.
  if (data.user.role !== 'super_admin') {
     return new Response(JSON.stringify({ error: "Forbidden: Super Admin only" }), { 
      status: 403, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword) {
      return new Response(JSON.stringify({ error: "User ID and password are required" }), { 
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), { 
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. Hash the new password
    const hashed = await hashPassword(newPassword);

    // 2. Update the DB
    await env.ksom_payslip_db.prepare(
      "UPDATE users SET password_hash = ? WHERE id = ?"
    ).bind(hashed, userId).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
