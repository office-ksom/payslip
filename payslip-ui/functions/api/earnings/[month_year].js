import { logActivity } from '../../lib/logger.js';

export async function onRequestGet(context) {
  try {
    const monthYear = context.params.month_year;
    const userRole = context.request.headers.get('X-User-Role');
    const userEmail = context.request.headers.get('X-User-Email');

    let query = `
      SELECT e.emp_id, e.name, e.designation, e.scale_of_pay, e.category, e.is_active, e.date_of_joining, e.email_id, e.date_of_birth, e.epf_uan, e.title, e.sort_order,
             m.id as earnings_id, m.basic_pay, m.dp_gp, m.da_state, m.da_ugc, m.hra_state, m.hra_ugc, m.cca, m.other_earnings,
             m.spl_pay, m.tr_allow, m.spl_allow, m.fest_allow, m.other_earnings_breakdown,
             d.id as deductions_id, d.epf, d.professional_tax, d.sli, d.gis, d.lic, d.income_tax, d.onam_advance, d.other_deductions,
             d.cpf, d.hra_recovery, d.other_deductions_breakdown
      FROM employees e
      LEFT JOIN monthly_earnings m ON e.emp_id = m.emp_id AND m.month_year = ?
      LEFT JOIN monthly_deductions d ON e.emp_id = d.emp_id AND d.month_year = ?
    `;
    let params = [monthYear, monthYear];

    if (userRole === 'viewer' && userEmail) {
      query += ` WHERE LOWER(e.email_id) = LOWER(?)`;
      params.push(userEmail);
    } else {
      // In active bill generation page, we want only active employees or those who have earnings records
      query += ` WHERE e.is_active = 1 OR m.id IS NOT NULL`;
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

    // Check if month is approved
    const approvalCheck = await db.prepare("SELECT is_approved FROM monthly_earnings WHERE month_year = ? AND is_approved = 1 LIMIT 1").bind(monthYear).first();
    if (approvalCheck && userRole !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'This month is approved and locked. Only super_admin can modify it.' }), { status: 403 });
    }

    const statements = [];

    for (const record of records) {
      // 1. Insert/Update Earnings
      statements.push(
        db.prepare(`
          INSERT INTO monthly_earnings (
            emp_id, month_year, basic_pay, dp_gp, da_state, da_ugc, hra_state, hra_ugc, cca, other_earnings,
            spl_pay, tr_allow, spl_allow, fest_allow, other_earnings_breakdown
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(emp_id, month_year) DO UPDATE SET
            basic_pay = excluded.basic_pay,
            dp_gp = excluded.dp_gp,
            da_state = excluded.da_state,
            da_ugc = excluded.da_ugc,
            hra_state = excluded.hra_state,
            hra_ugc = excluded.hra_ugc,
            cca = excluded.cca,
            other_earnings = excluded.other_earnings,
            spl_pay = excluded.spl_pay,
            tr_allow = excluded.tr_allow,
            spl_allow = excluded.spl_allow,
            fest_allow = excluded.fest_allow,
            other_earnings_breakdown = excluded.other_earnings_breakdown
        `).bind(
          record.emp_id,
          monthYear,
          record.basic_pay || 0,
          record.dp_gp || 0,
          record.da_state || 0,
          record.da_ugc || 0,
          record.hra_state || 0,
          record.hra_ugc || 0,
          record.cca || 0,
          record.other_earnings || 0,
          record.spl_pay || 0,
          record.tr_allow || 0,
          record.spl_allow || 0,
          record.fest_allow || 0,
          record.other_earnings_breakdown ? JSON.stringify(record.other_earnings_breakdown) : null
        )
      );

      // 2. Insert/Update Deductions
      statements.push(
        db.prepare(`
          INSERT INTO monthly_deductions (
            emp_id, month_year, epf, professional_tax, sli, gis, lic, income_tax, onam_advance, other_deductions,
            cpf, hra_recovery, other_deductions_breakdown
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(emp_id, month_year) DO UPDATE SET
            epf = excluded.epf,
            professional_tax = excluded.professional_tax,
            sli = excluded.sli,
            gis = excluded.gis,
            lic = excluded.lic,
            income_tax = excluded.income_tax,
            onam_advance = excluded.onam_advance,
            other_deductions = excluded.other_deductions,
            cpf = excluded.cpf,
            hra_recovery = excluded.hra_recovery,
            other_deductions_breakdown = excluded.other_deductions_breakdown
        `).bind(
          record.emp_id,
          monthYear,
          record.epf || 0,
          record.professional_tax || 0,
          record.sli || 0,
          record.gis || 0,
          record.lic || 0,
          record.income_tax || 0,
          record.onam_advance || 0,
          record.other_deductions || 0,
          record.cpf || 0,
          record.hra_recovery || 0,
          record.other_deductions_breakdown ? JSON.stringify(record.other_deductions_breakdown) : null
        )
      );
    }

    if (statements.length > 0) {
      await db.batch(statements);
      await logActivity(db, userEmail, 'Update Paybill', `Updated paybill records for ${monthYear}`);
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
    const approvalCheck = await db.prepare("SELECT is_approved FROM monthly_earnings WHERE month_year = ? AND is_approved = 1 LIMIT 1").bind(monthYear).first();
    if (approvalCheck && userRole !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'This month is approved and locked. Only super_admin can modify it.' }), { status: 403 });
    }

    // Delete from monthly_earnings and monthly_deductions
    const deleteEarnings = db.prepare("DELETE FROM monthly_earnings WHERE emp_id = ? AND month_year = ?").bind(empId, monthYear);
    const deleteDeductions = db.prepare("DELETE FROM monthly_deductions WHERE emp_id = ? AND month_year = ?").bind(empId, monthYear);

    await db.batch([deleteEarnings, deleteDeductions]);

    await logActivity(db, userEmail, 'Delete Paybill Record', `Deleted paybill record for employee ${empId} for ${monthYear}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

