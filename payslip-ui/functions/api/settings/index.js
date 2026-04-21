export async function onRequestGet(context) {
  try {
    const { results } = await context.env.ksom_payslip_db.prepare(
      "SELECT * FROM allowances_settings ORDER BY effective_from DESC"
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
    const { effective_from, da_state_percentage, da_ugc_percentage, hra_state_percentage, hra_ugc_percentage } = data;
    
    // We insert, or if there is conflict on effective_from, we replace
    await context.env.ksom_payslip_db.prepare(
      `INSERT INTO allowances_settings (effective_from, da_state_percentage, da_ugc_percentage, hra_state_percentage, hra_ugc_percentage) 
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(effective_from) DO UPDATE SET 
        da_state_percentage=excluded.da_state_percentage,
        da_ugc_percentage=excluded.da_ugc_percentage,
        hra_state_percentage=excluded.hra_state_percentage,
        hra_ugc_percentage=excluded.hra_ugc_percentage`
    ).bind(effective_from, da_state_percentage || 0, da_ugc_percentage || 0, hra_state_percentage || 0, hra_ugc_percentage || 0).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 201
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
