export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const empId = url.searchParams.get('emp_id');
    const fy = url.searchParams.get('financial_year');

    if (!empId || !fy) {
      return new Response(JSON.stringify({ error: 'emp_id and financial_year query parameters are required.' }), { status: 400 });
    }

    const db = context.env.ksom_payslip_db;
    
    // Sum of surrendered leaves in this FY for this employee
    const result = await db.prepare(`
      SELECT SUM(num_els) as total_surrendered 
      FROM surrender_bills 
      WHERE emp_id = ? AND financial_year = ?
    `).bind(empId, fy).first();

    return new Response(JSON.stringify({ 
      total_surrendered: result ? (result.total_surrendered || 0) : 0 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
