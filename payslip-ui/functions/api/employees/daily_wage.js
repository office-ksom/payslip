export async function onRequestGet(context) {
  try {
    const userEmail = context.request.headers.get('X-User-Email');
    const userRole = context.request.headers.get('X-User-Role');

    const url = new URL(context.request.url);
    const fy = url.searchParams.get('fy');

    let query = "SELECT *, 'daily_wage' as category FROM daily_wage_employees ORDER BY (CASE WHEN is_active = 0 THEN 1 ELSE 0 END) ASC, sort_order ASC, name ASC";
    let params = [];

    if (userRole !== 'admin' && userRole !== 'super_admin' && userEmail) {
      query = "SELECT *, 'daily_wage' as category FROM daily_wage_employees WHERE LOWER(email_id) = LOWER(?) ORDER BY (CASE WHEN is_active = 0 THEN 1 ELSE 0 END) ASC, sort_order ASC, name ASC";
      params = [userEmail];
    } else if (fy) {
      const startMonth = `${fy}-03`;
      const endMonth = `${parseInt(fy) + 1}-02`;
      query = `SELECT *, 'daily_wage' as category FROM daily_wage_employees 
               WHERE emp_id IN (
                 SELECT DISTINCT emp_id FROM daily_wage_monthly_earnings WHERE month_year >= ? AND month_year <= ?
               ) 
               ORDER BY (CASE WHEN is_active = 0 THEN 1 ELSE 0 END) ASC, sort_order ASC, name ASC`;
      params = [startMonth, endMonth];
    }

    const { results } = await context.env.ksom_payslip_db.prepare(
      query
    ).bind(...params).all();
    
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { emp_id, name, designation, date_of_birth, date_of_joining, pay_type, pay, email_id, mob_no, is_active, title, sort_order, epf_uan } = data;
    const activeVal = typeof is_active !== 'undefined' ? Number(is_active) : 1;
    const sOrder = typeof sort_order !== 'undefined' ? Number(sort_order) : 0;
    const payVal = typeof pay !== 'undefined' ? Number(pay) : 0;
    
    await context.env.ksom_payslip_db.prepare(
      `INSERT INTO daily_wage_employees (emp_id, name, designation, date_of_birth, date_of_joining, pay_type, pay, email_id, mob_no, is_active, title, sort_order, epf_uan) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(emp_id, name, designation, date_of_birth, date_of_joining, pay_type, payVal, email_id || null, mob_no || null, activeVal, title || null, sOrder, epf_uan || null).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 201
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPut(context) {
  try {
    const data = await context.request.json();
    const { emp_id, name, designation, date_of_birth, date_of_joining, pay_type, pay, email_id, mob_no, is_active, title, sort_order, epf_uan } = data;
    const activeVal = typeof is_active !== 'undefined' ? Number(is_active) : 1;
    const sOrder = typeof sort_order !== 'undefined' ? Number(sort_order) : 0;
    const payVal = typeof pay !== 'undefined' ? Number(pay) : 0;

    await context.env.ksom_payslip_db.prepare(
      `UPDATE daily_wage_employees 
       SET name = ?, designation = ?, date_of_birth = ?, date_of_joining = ?, 
           pay_type = ?, pay = ?, email_id = ?, mob_no = ?, is_active = ?, title = ?, sort_order = ?, epf_uan = ?
       WHERE emp_id = ?`
    ).bind(name, designation, date_of_birth, date_of_joining, pay_type, payVal, email_id || null, mob_no || null, activeVal, title || null, sOrder, epf_uan || null, emp_id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
