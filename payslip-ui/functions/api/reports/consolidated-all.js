export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const fy = url.searchParams.get('fy'); // e.g. 2026
    const userRole = request.headers.get('X-User-Role');

    if (!fy) {
      return new Response(JSON.stringify({ error: "Financial year (fy) is required" }), { status: 400 });
    }

    if (userRole !== 'admin' && userRole !== 'super_admin') {
      return new Response(JSON.stringify({ error: "Access denied. Admins only." }), { status: 403 });
    }

    // Months range: March of fy to February of fy+1 (salary entered)
    const startMonth = `${fy}-03`;
    const endMonth = `${parseInt(fy) + 1}-02`;

    // Fetch all active employees during this range:
    // If an employee has at least one monthly earnings record, they are active.
    const { results: employees } = await env.ksom_payslip_db.prepare(
      `SELECT * FROM employees 
       WHERE emp_id IN (
         SELECT DISTINCT emp_id 
         FROM monthly_earnings 
         WHERE month_year >= ? AND month_year <= ?
       )
       ORDER BY sort_order ASC, name ASC`
    ).bind(startMonth, endMonth).all();

    // Fetch all monthly_earnings in range
    const { results: earnings } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM monthly_earnings WHERE month_year >= ? AND month_year <= ?"
    ).bind(startMonth, endMonth).all();

    // Fetch all monthly_deductions in range
    const { results: deductions } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM monthly_deductions WHERE month_year >= ? AND month_year <= ?"
    ).bind(startMonth, endMonth).all();

    // Fetch all approved arrear bills in range
    const { results: arrears } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM arrear_bills WHERE substr(bill_date, 1, 7) >= ? AND substr(bill_date, 1, 7) <= ? AND is_approved = 1"
    ).bind(startMonth, endMonth).all();

    // Fetch all approved surrender bills in range
    const { results: surrender } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM surrender_bills WHERE substr(bill_date, 1, 7) >= ? AND substr(bill_date, 1, 7) <= ? AND is_approved = 1"
    ).bind(startMonth, endMonth).all();

    // Fetch all approved festival allowance bills in range
    const { results: festival } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM festival_allowance_bills WHERE substr(bill_date, 1, 7) >= ? AND substr(bill_date, 1, 7) <= ? AND is_approved = 1"
    ).bind(startMonth, endMonth).all();

    return new Response(JSON.stringify({
      employees,
      earnings,
      deductions,
      arrears,
      surrender,
      festival
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
