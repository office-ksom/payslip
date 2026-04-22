export async function onRequestGet(context) {
  try {
    const { results } = await context.env.ksom_payslip_db.prepare(
      "SELECT * FROM employees ORDER BY name ASC"
    ).all();
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
    const { emp_id, name, designation, date_of_birth, date_of_joining, scale_of_pay, category, email_id, mob_no, is_active, epf_uan } = data;
    const activeVal = typeof is_active !== 'undefined' ? Number(is_active) : 1;
    
    await context.env.ksom_payslip_db.prepare(
      `INSERT INTO employees (emp_id, name, designation, date_of_birth, date_of_joining, scale_of_pay, category, email_id, mob_no, is_active, epf_uan) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(emp_id, name, designation, date_of_birth, date_of_joining, scale_of_pay, category, email_id || null, mob_no || null, activeVal, epf_uan || null).run();

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
    const { emp_id, name, designation, date_of_birth, date_of_joining, scale_of_pay, category, email_id, mob_no, is_active, epf_uan } = data;
    const activeVal = typeof is_active !== 'undefined' ? Number(is_active) : 1;

    await context.env.ksom_payslip_db.prepare(
      `UPDATE employees 
       SET name = ?, designation = ?, date_of_birth = ?, date_of_joining = ?, 
           scale_of_pay = ?, category = ?, email_id = ?, mob_no = ?, is_active = ?, epf_uan = ?
       WHERE emp_id = ?`
    ).bind(name, designation, date_of_birth, date_of_joining, scale_of_pay, category, email_id || null, mob_no || null, activeVal, epf_uan || null, emp_id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
