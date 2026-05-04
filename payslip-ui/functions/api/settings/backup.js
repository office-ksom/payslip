export async function onRequestGet(context) {
  try {
    const { results } = await context.env.ksom_payslip_db.prepare(
      "SELECT * FROM backup_settings WHERE id = 1"
    ).all();
    return new Response(JSON.stringify(results[0] || {}), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { backup_email, frequency, is_enabled } = data;
    
    await context.env.ksom_payslip_db.prepare(
      `UPDATE backup_settings 
       SET backup_email = ?, frequency = ?, is_enabled = ?
       WHERE id = 1`
    ).bind(backup_email || null, frequency || 'weekly', is_enabled ? 1 : 0).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
