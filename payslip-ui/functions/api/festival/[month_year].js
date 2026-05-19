export async function onRequestGet(context) {
  try {
    const monthYear = context.params.month_year;
    const userRole = context.request.headers.get('X-User-Role');
    const userEmail = context.request.headers.get('X-User-Email');

    let query = `
      SELECT e.emp_id, e.name, e.designation, e.scale_of_pay, e.category, e.is_active, e.email_id, e.title, e.sort_order,
             f.id as bill_id, f.amount, f.bill_date, f.description,
             f.is_approved, f.approved_on, f.approved_by
      FROM employees e
      LEFT JOIN festival_allowance_bills f ON e.emp_id = f.emp_id AND substr(f.bill_date, 1, 7) = ?
    `;
    let params = [monthYear];

    if (userRole === 'viewer' && userEmail) {
      query += ` WHERE LOWER(e.email_id) = LOWER(?)`;
      params.push(userEmail);
    } else {
      query += ` WHERE e.is_active = 1 OR f.id IS NOT NULL`;
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
      const isApprovedRecord = await db.prepare(
        "SELECT is_approved FROM festival_allowance_bills WHERE emp_id = ? AND substr(bill_date, 1, 7) = ? AND is_approved = 1 LIMIT 1"
      ).bind(record.emp_id, monthYear).first('is_approved');
 
      if (isApprovedRecord === 1 && userRole !== 'super_admin') {
        continue; // Skip approved records silently from saving
      }
 
      if (record.amount && record.amount > 0) {
        statements.push(
          db.prepare(`
            INSERT INTO festival_allowance_bills (emp_id, amount, bill_date, description, is_approved)
            VALUES (?, ?, ?, ?, 2)
            ON CONFLICT(emp_id, bill_date) DO UPDATE SET
              amount = excluded.amount,
              description = excluded.description,
              is_approved = 2
          `).bind(
            record.emp_id,
            record.amount || 0,
            record.bill_date,
            record.description || null
          )
        );
      } else {
        // If amount set to 0, delete the record if it exists
        if (record.bill_date) {
          statements.push(
            db.prepare(`
              DELETE FROM festival_allowance_bills 
              WHERE emp_id = ? AND bill_date = ?
            `).bind(record.emp_id, record.bill_date)
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
