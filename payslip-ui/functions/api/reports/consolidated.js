export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const fy = url.searchParams.get('fy'); // e.g. 2024
    let empId = url.searchParams.get('emp_id');
    const userEmail = request.headers.get('X-User-Email');
    const userRole = request.headers.get('X-User-Role');

    if (!fy) {
      return new Response(JSON.stringify({ error: "Financial year (fy) is required" }), { status: 400 });
    }

    // Security check
    if (userRole === 'viewer') {
      // Find own emp_id
      const emp = await env.ksom_payslip_db.prepare(
        "SELECT emp_id FROM employees WHERE email_id = ?"
      ).bind(userEmail).first();
      
      if (!emp) {
        return new Response(JSON.stringify({ error: "Employee record not found for your email" }), { status: 404 });
      }
      empId = emp.emp_id;
    } else if (!empId) {
      // For admins, if no emp_id is provided, they might want to fetch all or just error out.
      // The request says "Admin and Super admin users should have this facility for all users(by selecting the required user)".
      // So they will provide emp_id.
      return new Response(JSON.stringify({ error: "emp_id is required" }), { status: 400 });
    }

    // Months range: April of fy to March of fy+1
    const startMonth = `${fy}-04`;
    const endMonth = `${parseInt(fy) + 1}-03`;

    // Fetch employee details
    const employee = await env.ksom_payslip_db.prepare(
      "SELECT * FROM employees WHERE emp_id = ?"
    ).bind(empId).first();

    if (!employee) {
      return new Response(JSON.stringify({ error: "Employee not found" }), { status: 404 });
    }

    // Fetch earnings for the range
    const { results: earnings } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM monthly_earnings WHERE emp_id = ? AND month_year >= ? AND month_year <= ? ORDER BY month_year ASC"
    ).bind(empId, startMonth, endMonth).all();

    // Fetch deductions for the range
    const { results: deductions } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM monthly_deductions WHERE emp_id = ? AND month_year >= ? AND month_year <= ? ORDER BY month_year ASC"
    ).bind(empId, startMonth, endMonth).all();

    // Fetch approved arrears for the range
    const { results: arrears } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM arrear_bills WHERE emp_id = ? AND substr(bill_date, 1, 7) >= ? AND substr(bill_date, 1, 7) <= ? AND is_approved = 1 ORDER BY bill_date ASC"
    ).bind(empId, startMonth, endMonth).all();

    // Fetch approved surrender bills for the range
    const { results: surrender } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM surrender_bills WHERE emp_id = ? AND substr(bill_date, 1, 7) >= ? AND substr(bill_date, 1, 7) <= ? AND is_approved = 1 ORDER BY bill_date ASC"
    ).bind(empId, startMonth, endMonth).all();

    // Fetch approved festival allowance bills for the range
    const { results: festival } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM festival_allowance_bills WHERE emp_id = ? AND substr(bill_date, 1, 7) >= ? AND substr(bill_date, 1, 7) <= ? AND is_approved = 1 ORDER BY bill_date ASC"
    ).bind(empId, startMonth, endMonth).all();

    // Fetch settings to get rules that might apply during this period
    const { results: settings } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM allowances_settings ORDER BY effective_from ASC"
    ).all();

    return new Response(JSON.stringify({
      employee,
      earnings,
      deductions,
      arrears,
      surrender,
      festival,
      settings
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
