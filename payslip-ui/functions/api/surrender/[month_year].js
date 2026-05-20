import { logActivity } from '../../lib/logger.js';

export async function onRequestGet(context) {
  try {
    const monthYear = context.params.month_year;
    const userRole = context.request.headers.get('X-User-Role');
    const userEmail = context.request.headers.get('X-User-Email');

    const isYearOnly = monthYear.length === 4;
    const dateLen = isYearOnly ? 4 : 7;

    let query = `
      SELECT e.emp_id, e.name, e.designation, e.scale_of_pay, e.category, e.is_active, e.email_id, e.title, e.sort_order,
             s.id as bill_id, s.bill_date, s.financial_year, s.basic_pay, s.da, s.hra, s.num_els, s.total_amount,
             s.is_approved, s.approved_on, s.approved_by
      FROM employees e
      LEFT JOIN surrender_bills s ON e.emp_id = s.emp_id AND substr(s.bill_date, 1, ${dateLen}) = ?
    `;
    let params = [monthYear];

    if (userRole === 'viewer' && userEmail) {
      query += ` WHERE LOWER(e.email_id) = LOWER(?)`;
      params.push(userEmail);
    } else {
      // In active bill generation page, we want only active employees or those who have bills
      query += ` WHERE e.is_active = 1 OR s.id IS NOT NULL`;
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
  const userEmail = context.request.headers.get('X-User-Email');
  if (userRole === 'viewer') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    const monthYear = context.params.month_year;
    const { records } = await context.request.json();
    const db = context.env.ksom_payslip_db;

    // Check if any of the records being updated/deleted are already approved
    for (const record of records) {
      const isApprovedRecord = await db.prepare(
        "SELECT is_approved FROM surrender_bills WHERE emp_id = ? AND substr(bill_date, 1, 7) = ? AND is_approved = 1 LIMIT 1"
      ).bind(record.emp_id, monthYear).first('is_approved');

      if (isApprovedRecord === 1 && userRole !== 'super_admin') {
        return new Response(JSON.stringify({ error: `Record for employee ${record.emp_id} is approved and locked. Only super_admin can modify it.` }), { status: 403 });
      }
    }

    const statements = [];

    for (const record of records) {
      if (record.num_els && record.num_els > 0) {
        // Limit to 30 ELs check on backend as well
        if (record.num_els > 30) {
          return new Response(JSON.stringify({ error: 'Maximum 30 Earned Leaves can be surrendered.' }), { status: 400 });
        }

        statements.push(
          db.prepare(`
            INSERT INTO surrender_bills (emp_id, bill_date, financial_year, basic_pay, da, hra, num_els, total_amount, is_approved)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 2)
            ON CONFLICT(emp_id, bill_date) DO UPDATE SET
              financial_year = excluded.financial_year,
              basic_pay = excluded.basic_pay,
              da = excluded.da,
              hra = excluded.hra,
              num_els = excluded.num_els,
              total_amount = excluded.total_amount,
              is_approved = 2
          `).bind(
            record.emp_id,
            record.bill_date,
            record.financial_year,
            record.basic_pay || 0,
            record.da || 0,
            record.hra || 0,
            record.num_els,
            record.total_amount || 0
          )
        );
      } else {
        // If leaves set to 0, delete the record if it exists for this employee on this bill_date
        if (record.bill_date) {
          statements.push(
            db.prepare(`
              DELETE FROM surrender_bills 
              WHERE emp_id = ? AND bill_date = ?
            `).bind(record.emp_id, record.bill_date)
          );
        }
      }
    }

    if (statements.length > 0) {
      await db.batch(statements);
      for (const record of records) {
        if (record.num_els && record.num_els > 0) {
          await logActivity(db, userEmail, 'Save Surrender Bill', `Saved/Updated surrender bill for employee ${record.emp_id} with ${record.num_els} ELs`);
        } else if (record.bill_date) {
          await logActivity(db, userEmail, 'Delete Surrender Bill', `Deleted surrender bill for employee ${record.emp_id} on date ${record.bill_date}`);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
