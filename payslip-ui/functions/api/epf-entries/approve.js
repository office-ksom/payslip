import { logActivity } from '../../lib/logger.js';

export async function onRequestPost(context) {
  const userRole = context.request.headers.get('X-User-Role');
  const userEmail = context.request.headers.get('X-User-Email');

  try {
    const { month_year, category, action } = await context.request.json();
    const db = context.env.ksom_payslip_db;
    const now = new Date().toISOString();

    if (!month_year || !category) {
      return new Response(JSON.stringify({ error: 'month_year and category are required' }), { status: 400 });
    }

    if (action === 'approve') {
      const isAllowed = userRole === 'approver' || userRole === 'super_admin' || userRole === 'admin';
      if (!isAllowed) {
        return new Response(JSON.stringify({ error: 'Unauthorized to lock EPF entries.' }), { status: 403 });
      }

      // Check if saved entries exist first
      const exists = await db.prepare(
        "SELECT count(*) as count FROM epf_entries WHERE month_year = ? AND employee_category = ?"
      ).bind(month_year, category).first('count');

      if (exists === 0) {
        return new Response(JSON.stringify({ error: 'Please save the EPF entries first before locking.' }), { status: 400 });
      }

      await db.prepare(`
        UPDATE epf_entries 
        SET is_approved = 1, approved_on = ?, approved_by = ?
        WHERE month_year = ? AND employee_category = ?
      `).bind(now, userEmail, month_year, category).run();

      await logActivity(db, userEmail, 'EPF Lock', `Verified & Locked EPF entries for ${month_year} (${category})`);

      return new Response(JSON.stringify({ success: true, is_approved: 1, approved_on: now, approved_by: userEmail }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else if (action === 'unlock') {
      if (userRole !== 'super_admin') {
        return new Response(JSON.stringify({ error: 'Only super admins can unlock EPF entries.' }), { status: 403 });
      }

      await db.prepare(`
        UPDATE epf_entries 
        SET is_approved = 0, approved_on = NULL, approved_by = NULL
        WHERE month_year = ? AND employee_category = ?
      `).bind(month_year, category).run();

      await logActivity(db, userEmail, 'EPF Unlock', `Unlocked EPF entries for ${month_year} (${category})`);

      return new Response(JSON.stringify({ success: true, is_approved: 0 }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action.' }), { status: 400 });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
