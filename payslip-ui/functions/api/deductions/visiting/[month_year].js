export async function onRequestGet(context) {
  try {
    const monthYear = context.params.month_year;
    const userRole = context.request.headers.get('X-User-Role');
    const userEmail = context.request.headers.get('X-User-Email');
    
    let query = `
      SELECT e.emp_id, e.name, e.designation, e.pay_type, e.pay, e.is_active, e.title, e.sort_order,
             d.income_tax, d.hra, d.other_deductions, d.other_deductions_breakdown
      FROM visiting_employees e
      LEFT JOIN visiting_monthly_deductions d ON e.emp_id = d.emp_id AND d.month_year = ?
    `;
    let params = [monthYear];

    if (userRole === 'viewer') {
      query += ` WHERE LOWER(e.email_id) = LOWER(?)`;
      params.push(userEmail);
    }

    query += ` ORDER BY (CASE WHEN e.is_active = 0 THEN 1 ELSE 0 END) ASC, e.sort_order ASC, e.name ASC`;

    const { results } = await context.env.ksom_payslip_db.prepare(query).bind(...params).all();

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const userRole = context.request.headers.get('X-User-Role');
  if (userRole === 'viewer') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    const monthYear = context.params.month_year;
    const { records } = await context.request.json();
    const db = context.env.ksom_payslip_db;

    // Check if month is approved (status is stored in visiting_monthly_earnings)
    const approvalCheck = await db.prepare("SELECT is_approved FROM visiting_monthly_earnings WHERE month_year = ? AND is_approved = 1 LIMIT 1").bind(monthYear).first();
    if (approvalCheck && userRole !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'This month is approved and locked. Only super_admin can modify it.' }), { status: 403 });
    }

    const statements = [];
    
    for (const record of records) {
      statements.push(
        db.prepare(`
          INSERT INTO visiting_monthly_deductions (emp_id, month_year, income_tax, hra, other_deductions, other_deductions_breakdown)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(emp_id, month_year) DO UPDATE SET 
            income_tax=excluded.income_tax,
            hra=excluded.hra,
            other_deductions=excluded.other_deductions,
            other_deductions_breakdown=excluded.other_deductions_breakdown
        `).bind(
          record.emp_id, monthYear, 
          record.income_tax || 0, record.hra || 0, record.other_deductions || 0,
          record.other_deductions_breakdown ? JSON.stringify(record.other_deductions_breakdown) : null
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
