export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const fy = url.searchParams.get('fy');
    const userRole = request.headers.get('X-User-Role');

    if (!fy) {
      return new Response(JSON.stringify({ error: "Financial year (fy) is required" }), { status: 400 });
    }

    if (userRole !== 'admin' && userRole !== 'super_admin') {
      return new Response(JSON.stringify({ error: "Access denied. Admins only." }), { status: 403 });
    }

    const startMonth = `${fy}-03`;
    const endMonth = `${parseInt(fy) + 1}-02`;

    const { results: employees } = await env.ksom_payslip_db.prepare(
      `SELECT *, 'contract' as category FROM contract_employees 
       WHERE emp_id IN (
         SELECT DISTINCT emp_id 
         FROM contract_monthly_earnings 
         WHERE month_year >= ? AND month_year <= ?
       )
       ORDER BY sort_order ASC, name ASC`
    ).bind(startMonth, endMonth).all();

    const { results: earnings } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM contract_monthly_earnings WHERE month_year >= ? AND month_year <= ?"
    ).bind(startMonth, endMonth).all();

    const { results: deductions } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM contract_monthly_deductions WHERE month_year >= ? AND month_year <= ?"
    ).bind(startMonth, endMonth).all();

    return new Response(JSON.stringify({
      employees,
      earnings,
      deductions,
      arrears: [],
      surrender: [],
      festival: [],
      supplementaryEarnings: [],
      supplementaryDeductions: []
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
