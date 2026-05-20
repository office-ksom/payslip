import { logActivity } from '../../lib/logger.js';

export async function onRequestGet(context) {
  try {
    const { results } = await context.env.ksom_payslip_db.prepare(
      "SELECT * FROM users ORDER BY created_at DESC"
    ).all();
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const userEmail = context.request.headers.get('X-User-Email');
  try {
    const data = await context.request.json();
    const { email, role, status, name, designation } = data;
    
    if (!email || !role) {
      return new Response(JSON.stringify({ error: "Email and role are required." }), { status: 400 });
    }

    await context.env.ksom_payslip_db.prepare(
      `INSERT INTO users (email, role, status, name, designation) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET 
         role=excluded.role, 
         status=excluded.status, 
         name=excluded.name, 
         designation=excluded.designation`
    ).bind(email.toLowerCase(), role, status || 'active', name || null, designation || null).run();

    logActivity(context.env.ksom_payslip_db, userEmail, 'Save/Update User', `Saved/Updated user ${email} (Role: ${role}, Status: ${status || 'active'})`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestDelete(context) {
  const userEmail = context.request.headers.get('X-User-Email');
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');
    
    if (!id) return new Response(JSON.stringify({ error: "ID required." }), { status: 400 });

    // Fetch user details first for logging info
    const userToDel = await context.env.ksom_payslip_db.prepare("SELECT email FROM users WHERE id = ?").bind(id).first();

    // Prevent deleting the last super admin or self?
    // For now, simple delete
    await context.env.ksom_payslip_db.prepare("DELETE FROM users WHERE id = ?").bind(id).run();

    logActivity(context.env.ksom_payslip_db, userEmail, 'Delete User', `Deleted user with ID ${id}${userToDel ? ` (${userToDel.email})` : ''}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
