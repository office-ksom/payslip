export async function onRequestGet(context) {
  try {
    const monthYear = context.params.month_year;
    const userRole = context.request.headers.get('X-User-Role');
    const userEmail = context.request.headers.get('X-User-Email');

    const url = new URL(context.request.url);
    const arrearType = url.searchParams.get('type');

    let query = `
      SELECT e.emp_id, e.name, e.designation, e.scale_of_pay, e.category, e.is_active, e.email_id, e.title, e.sort_order,
             a.id as bill_id, a.arrear_type, a.arrear_type_other, a.arrear_amount, a.income_tax, a.net_amount, a.bill_date, a.description,
             a.is_approved, a.approved_on, a.approved_by
      FROM employees e
      LEFT JOIN arrear_bills a ON e.emp_id = a.emp_id AND substr(a.bill_date, 1, 7) = ?
    `;
    let params = [monthYear];

    if (arrearType) {
      query = `
        SELECT e.emp_id, e.name, e.designation, e.scale_of_pay, e.category, e.is_active, e.email_id, e.title, e.sort_order,
               a.id as bill_id, a.arrear_type, a.arrear_type_other, a.arrear_amount, a.income_tax, a.net_amount, a.bill_date, a.description,
               a.is_approved, a.approved_on, a.approved_by
        FROM employees e
        LEFT JOIN arrear_bills a ON e.emp_id = a.emp_id AND substr(a.bill_date, 1, 7) = ? AND a.arrear_type = ?
      `;
      params.push(arrearType);
    }

    if (userRole === 'viewer' && userEmail) {
      query += ` WHERE LOWER(e.email_id) = LOWER(?)`;
      params.push(userEmail);
    } else {
      query += ` WHERE e.is_active = 1 OR a.id IS NOT NULL`;
    }

    query += ` ORDER BY e.sort_order ASC, e.name ASC`;

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

    const statements = [];

    for (const record of records) {
      if (!record.arrear_type) continue;

      const isApprovedRecord = await db.prepare(
        "SELECT is_approved FROM arrear_bills WHERE emp_id = ? AND substr(bill_date, 1, 7) = ? AND arrear_type = ? AND is_approved = 1 LIMIT 1"
      ).bind(record.emp_id, monthYear, record.arrear_type).first('is_approved');

      if (isApprovedRecord === 1 && userRole !== 'super_admin') {
        continue; // Skip approved records silently from saving
      }

      if (record.arrear_amount && record.arrear_amount > 0) {
        statements.push(
          db.prepare(`
            INSERT INTO arrear_bills (emp_id, arrear_type, arrear_type_other, category, arrear_amount, income_tax, net_amount, bill_date, description, is_approved)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 2)
            ON CONFLICT(emp_id, bill_date, arrear_type) DO UPDATE SET
              arrear_type_other = excluded.arrear_type_other,
              category = excluded.category,
              arrear_amount = excluded.arrear_amount,
              income_tax = excluded.income_tax,
              net_amount = excluded.net_amount,
              description = excluded.description,
              is_approved = 2
          `).bind(
            record.emp_id,
            record.arrear_type,
            record.arrear_type_other || null,
            record.category,
            record.arrear_amount || 0,
            record.income_tax || 0,
            record.net_amount || 0,
            record.bill_date,
            record.description || null
          )
        );
      } else {
        // If amount set to 0, delete the record if it exists
        if (record.bill_date && record.arrear_type) {
          statements.push(
            db.prepare(`
              DELETE FROM arrear_bills 
              WHERE emp_id = ? AND bill_date = ? AND arrear_type = ?
            `).bind(record.emp_id, record.bill_date, record.arrear_type)
          );
        }
      }
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
