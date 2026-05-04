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
  try {
    const data = await context.request.json();
    const { email, role, status } = data;
    
    if (!email || !role) {
      return new Response(JSON.stringify({ error: "Email and role are required." }), { status: 400 });
    }

    await context.env.ksom_payslip_db.prepare(
      `INSERT INTO users (email, role, status) VALUES (?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET role=excluded.role, status=excluded.status`
    ).bind(email.toLowerCase(), role, status || 'active').run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestDelete(context) {
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');
    
    if (!id) return new Response(JSON.stringify({ error: "ID required." }), { status: 400 });

    // Prevent deleting the last super admin or self?
    // For now, simple delete
    await context.env.ksom_payslip_db.prepare("DELETE FROM users WHERE id = ?").bind(id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
