export async function onRequestGet(context) {
  try {
    const monthYear = context.params.month_year;
    
    // We join with employees to return names and designations alongside earnings
    const { results } = await context.env.ksom_payslip_db.prepare(`
      SELECT e.emp_id, e.name, e.designation, e.scale_of_pay, e.category, 
             m.basic_pay, m.dp_gp, m.da_state, m.da_ugc, m.hra_state, m.hra_ugc, m.cca, m.other_earnings 
      FROM employees e
      LEFT JOIN monthly_earnings m ON e.emp_id = m.emp_id AND m.month_year = ?
      ORDER BY e.name ASC
    `).bind(monthYear).all();

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const monthYear = context.params.month_year;
    const { records } = await context.request.json();
    
    const db = context.env.ksom_payslip_db;
    
    // Cloudflare D1 supports batching statements to execute multiple inserts/updates at once
    const statements = [];
    
    for (const record of records) {
      statements.push(
        db.prepare(`
          INSERT INTO monthly_earnings (emp_id, month_year, basic_pay, dp_gp, da_state, da_ugc, hra_state, hra_ugc, cca, other_earnings)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(emp_id, month_year) DO UPDATE SET 
            basic_pay=excluded.basic_pay,
            dp_gp=excluded.dp_gp,
            da_state=excluded.da_state,
            da_ugc=excluded.da_ugc,
            hra_state=excluded.hra_state,
            hra_ugc=excluded.hra_ugc,
            cca=excluded.cca,
            other_earnings=excluded.other_earnings
        `).bind(
          record.emp_id, monthYear, 
          record.basic_pay || 0, record.dp_gp || 0, 
          record.da_state || 0, record.da_ugc || 0, 
          record.hra_state || 0, record.hra_ugc || 0, 
          record.cca || 0, record.other_earnings || 0
        )
      );
    }

    if (statements.length > 0) {
      await db.batch(statements);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
