export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const fy = url.searchParams.get('fy');
    let empId = url.searchParams.get('emp_id');
    const userEmail = request.headers.get('X-User-Email');
    const userRole = request.headers.get('X-User-Role');

    if (!fy) {
      return new Response(JSON.stringify({ error: "Financial year (fy) is required" }), { status: 400 });
    }

    if (userRole !== 'admin' && userRole !== 'super_admin') {
      const emp = await env.ksom_payslip_db.prepare(
        "SELECT emp_id FROM contract_employees WHERE LOWER(email_id) = LOWER(?)"
      ).bind(userEmail).first();
      
      if (!emp) {
        return new Response(JSON.stringify({ error: "Contract employee record not found for your email" }), { status: 404 });
      }
      empId = emp.emp_id;
    } else if (!empId) {
      return new Response(JSON.stringify({ error: "emp_id is required" }), { status: 400 });
    }

    const startMonth = `${fy}-03`;
    const endMonth = `${parseInt(fy) + 1}-02`;

    const employee = await env.ksom_payslip_db.prepare(
      "SELECT *, 'contract' as category FROM contract_employees WHERE emp_id = ?"
    ).bind(empId).first();

    if (!employee) {
      return new Response(JSON.stringify({ error: "Contract employee not found" }), { status: 404 });
    }

    const { results: earnings } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM contract_monthly_earnings WHERE emp_id = ? AND month_year >= ? AND month_year <= ? ORDER BY month_year ASC"
    ).bind(empId, startMonth, endMonth).all();

    const { results: deductions } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM contract_monthly_deductions WHERE emp_id = ? AND month_year >= ? AND month_year <= ? ORDER BY month_year ASC"
    ).bind(empId, startMonth, endMonth).all();

    return new Response(JSON.stringify({
      employee,
      earnings,
      deductions,
      arrears: [],
      surrender: [],
      festival: [],
      supplementaryEarnings: [],
      supplementaryDeductions: [],
      settings: []
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
