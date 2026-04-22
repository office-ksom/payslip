export async function onRequestGet(context) {
  try {
    const monthYear = context.params.month_year;
    
    const { results } = await context.env.ksom_payslip_db.prepare(`
      SELECT e.emp_id, e.name, e.designation, e.scale_of_pay, e.category, e.is_active,
             d.epf, d.professional_tax, d.sli, d.gis, d.lic, d.income_tax, d.onam_advance, d.other_deductions,
             d.cpf, d.hra_recovery
      FROM employees e
      LEFT JOIN monthly_deductions d ON e.emp_id = d.emp_id AND d.month_year = ?
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
    const statements = [];
    
    for (const record of records) {
      statements.push(
        db.prepare(`
          INSERT INTO monthly_deductions (emp_id, month_year, epf, professional_tax, sli, gis, lic, income_tax, onam_advance, other_deductions, cpf, hra_recovery)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(emp_id, month_year) DO UPDATE SET 
            epf=excluded.epf,
            professional_tax=excluded.professional_tax,
            sli=excluded.sli,
            gis=excluded.gis,
            lic=excluded.lic,
            income_tax=excluded.income_tax,
            onam_advance=excluded.onam_advance,
            other_deductions=excluded.other_deductions,
            cpf=excluded.cpf,
            hra_recovery=excluded.hra_recovery
        `).bind(
          record.emp_id, monthYear, 
          record.epf || 0, record.professional_tax || 0, 
          record.sli || 0, record.gis || 0, 
          record.lic || 0, record.income_tax || 0, 
          record.onam_advance || 0, record.other_deductions || 0,
          record.cpf || 0, record.hra_recovery || 0
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
