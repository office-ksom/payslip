import { logActivity } from '../../../lib/logger.js';

export async function onRequestGet(context) {
  try {
    const monthYear = context.params.month_year;
    const userRole = context.request.headers.get('X-User-Role');
    const userEmail = context.request.headers.get('X-User-Email');

    let query = `
      SELECT e.emp_id, e.name, e.designation, e.pay_type, e.pay, e.is_active, e.date_of_joining, e.email_id, e.date_of_birth, e.title, e.sort_order, e.epf_uan,
             'daily_wage' as category,
             m.id as earnings_id, m.days_worked, m.daily_wage, m.total_wage, m.basic_pay, m.other_earnings, m.other_earnings_breakdown, m.is_approved, m.approved_on, m.approved_by,
             d.id as deductions_id, d.income_tax, d.hra, d.epf, d.other_deductions, d.other_deductions_breakdown
      FROM daily_wage_employees e
      LEFT JOIN daily_wage_monthly_earnings m ON e.emp_id = m.emp_id AND m.month_year = ?
      LEFT JOIN daily_wage_monthly_deductions d ON e.emp_id = d.emp_id AND d.month_year = ?
    `;
    let params = [monthYear, monthYear];

    if (userRole === 'viewer' && userEmail) {
      query += ` WHERE LOWER(e.email_id) = LOWER(?)`;
      params.push(userEmail);
    } else {
      query += ` WHERE e.is_active = 1 OR m.id IS NOT NULL`;
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
  const userEmail = context.request.headers.get('X-User-Email');
  if (userRole === 'viewer') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    const monthYear = context.params.month_year;
    const { records } = await context.request.json();
    const db = context.env.ksom_payslip_db;

    // Check if month is approved
    const approvalCheck = await db.prepare("SELECT is_approved FROM daily_wage_monthly_earnings WHERE month_year = ? AND is_approved = 1 LIMIT 1").bind(monthYear).first();
    if (approvalCheck && userRole !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'This month is approved and locked. Only super_admin can modify it.' }), { status: 403 });
    }

    const statements = [];

    for (const record of records) {
      // 1. Insert/Update Daily Wage Earnings
      statements.push(
        db.prepare(`
          INSERT INTO daily_wage_monthly_earnings (
            emp_id, month_year, days_worked, daily_wage, total_wage, basic_pay, other_earnings, other_earnings_breakdown
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(emp_id, month_year) DO UPDATE SET
            days_worked = excluded.days_worked,
            daily_wage = excluded.daily_wage,
            total_wage = excluded.total_wage,
            basic_pay = excluded.basic_pay,
            other_earnings = excluded.other_earnings,
            other_earnings_breakdown = excluded.other_earnings_breakdown
        `).bind(
          record.emp_id,
          monthYear,
          record.days_worked || 0,
          record.daily_wage || 0,
          record.total_wage || 0,
          record.total_wage || 0, // basic_pay maps to total_wage
          record.other_earnings || 0,
          record.other_earnings_breakdown ? JSON.stringify(record.other_earnings_breakdown) : null
        )
      );

      // 2. Insert/Update Daily Wage Deductions
      statements.push(
        db.prepare(`
          INSERT INTO daily_wage_monthly_deductions (
            emp_id, month_year, income_tax, hra, epf, other_deductions, other_deductions_breakdown
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(emp_id, month_year) DO UPDATE SET
            income_tax = excluded.income_tax,
            hra = excluded.hra,
            epf = excluded.epf,
            other_deductions = excluded.other_deductions,
            other_deductions_breakdown = excluded.other_deductions_breakdown
        `).bind(
          record.emp_id,
          monthYear,
          record.income_tax || 0,
          record.hra || 0,
          record.epf || 0,
          record.other_deductions || 0,
          record.other_deductions_breakdown ? JSON.stringify(record.other_deductions_breakdown) : null
        )
      );
    }

    if (statements.length > 0) {
      await db.batch(statements);
      await logActivity(db, userEmail, 'Update Daily Wage Paybill', `Updated daily wage paybill records for ${monthYear}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestDelete(context) {
  const userRole = context.request.headers.get('X-User-Role');
  const userEmail = context.request.headers.get('X-User-Email');
  if (userRole === 'viewer') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    const monthYear = context.params.month_year;
    const url = new URL(context.request.url);
    const empId = url.searchParams.get('emp_id');

    if (!empId) {
      return new Response(JSON.stringify({ error: 'Missing emp_id parameter.' }), { status: 400 });
    }

    const db = context.env.ksom_payslip_db;

    // Check if month is approved
    const approvalCheck = await db.prepare("SELECT is_approved FROM daily_wage_monthly_earnings WHERE month_year = ? AND is_approved = 1 LIMIT 1").bind(monthYear).first();
    if (approvalCheck && userRole !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'This month is approved and locked. Only super_admin can modify it.' }), { status: 403 });
    }

    const deleteEarnings = db.prepare("DELETE FROM daily_wage_monthly_earnings WHERE emp_id = ? AND month_year = ?").bind(empId, monthYear);
    const deleteDeductions = db.prepare("DELETE FROM daily_wage_monthly_deductions WHERE emp_id = ? AND month_year = ?").bind(empId, monthYear);

    await db.batch([deleteEarnings, deleteDeductions]);

    await logActivity(db, userEmail, 'Delete Daily Wage Paybill Record', `Deleted daily wage paybill record for employee ${empId} for ${monthYear}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
