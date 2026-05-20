import { logActivity } from '../../lib/logger.js';

export async function onRequestPost(context) {
  const userRole = context.request.headers.get('X-User-Role');
  const userEmail = context.request.headers.get('X-User-Email');

  try {
    const monthYear = context.params.month_year;
    const db = context.env.ksom_payslip_db;
    const now = new Date().toISOString();

    const body = await context.request.json().catch(() => ({}));
    const action = body.action || 'approve'; // 'submit', 'reject', 'approve'

    // Fetch the require_approval system setting
    const settingsCheck = await db.prepare("SELECT value FROM system_settings WHERE key = 'require_approval'").first('value');
    const requireApproval = settingsCheck !== '0';

    if (action === 'submit') {
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        return new Response(JSON.stringify({ error: 'Only admins or super admins can submit paybills.' }), { status: 403 });
      }
    } else if (action === 'approve' || action === 'reject') {
      const isAllowed = userRole === 'approver' || userRole === 'super_admin' || (!requireApproval && userRole === 'admin');
      if (!isAllowed) {
        return new Response(JSON.stringify({ error: 'Only approvers, super admins (or admins under current settings) can approve/reject paybills.' }), { status: 403 });
      }
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action.' }), { status: 400 });
    }

    // Check if any records exist for this month
    const exists = await db.prepare("SELECT count(*) as count FROM monthly_earnings WHERE month_year = ?").bind(monthYear).first('count');
    if (exists === 0) {
      return new Response(JSON.stringify({ error: 'No data found for this month to process.' }), { status: 400 });
    }

    let statusValue = 1;
    let approvedOnValue = now;
    let approvedByValue = userEmail;

    if (action === 'submit') {
      statusValue = 2;
      approvedOnValue = null;
      approvedByValue = null;
    } else if (action === 'reject') {
      statusValue = 3;
      approvedOnValue = null;
      approvedByValue = null;
    }

    await db.prepare(`
      UPDATE monthly_earnings 
      SET is_approved = ?, approved_on = ?, approved_by = ?
      WHERE month_year = ?
    `).bind(statusValue, approvedOnValue, approvedByValue, monthYear).run();

    const actionMap = { 'submit': 'Submitted', 'reject': 'Rejected', 'approve': 'Verified & Locked' };
    logActivity(db, userEmail, 'Paybill Action', `${actionMap[action] || action} paybill for ${monthYear}`);

    return new Response(JSON.stringify({ 
      success: true, 
      is_approved: statusValue,
      approved_on: approvedOnValue, 
      approved_by: approvedByValue 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestGet(context) {
  try {
    const monthYear = context.params.month_year;
    const db = context.env.ksom_payslip_db;

    const approvalInfo = await db.prepare(`
      SELECT is_approved, approved_on, approved_by 
      FROM monthly_earnings 
      WHERE month_year = ?
      ORDER BY is_approved DESC
      LIMIT 1
    `).bind(monthYear).first();

    return new Response(JSON.stringify(approvalInfo || { is_approved: 0 }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
