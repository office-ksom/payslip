import { logActivity } from '../../../lib/logger.js';

export async function onRequestPost(context) {
  const userRole = context.request.headers.get('X-User-Role');
  const userEmail = context.request.headers.get('X-User-Email');

  try {
    const monthYear = context.params.month_year;
    const db = context.env.ksom_payslip_db;

    // Fetch require_approval setting
    const settingsCheck = await db.prepare("SELECT value FROM system_settings WHERE key = 'require_approval'").first('value');
    const requireApproval = settingsCheck !== '0';

    const isAllowed = userRole === 'approver' || userRole === 'super_admin' || (!requireApproval && userRole === 'admin');
    if (!isAllowed) {
      return new Response(JSON.stringify({ error: 'Only approvers, super admins (or admins under current settings) can approve bills.' }), { status: 403 });
    }

    const now = new Date().toISOString();

    const body = await context.request.json().catch(() => ({}));
    const empIds = body.emp_ids;
    const arrearType = body.arrear_type;
    const action = body.action; // 'reject' or 'approve'

    // Check if any records exist for this month
    let existsQuery = "SELECT count(*) as count FROM arrear_bills WHERE substr(bill_date, 1, 7) = ?";
    let existsParams = [monthYear];
    if (empIds && empIds.length > 0) {
      existsQuery += ` AND emp_id IN (${empIds.map(() => '?').join(',')})`;
      existsParams.push(...empIds);
    }
    if (arrearType) {
      existsQuery += " AND arrear_type = ?";
      existsParams.push(arrearType);
    }

    const exists = await db.prepare(existsQuery).bind(...existsParams).first('count');

    if (exists === 0) {
      return new Response(JSON.stringify({ error: 'No arrear bills found for this month to process.' }), { status: 400 });
    }

    let updateQuery = '';
    let updateParams = [];

    if (action === 'reject') {
      updateQuery = `
        UPDATE arrear_bills 
        SET is_approved = 3, approved_on = NULL, approved_by = NULL
        WHERE substr(bill_date, 1, 7) = ?
      `;
      updateParams = [monthYear];
    } else {
      updateQuery = `
        UPDATE arrear_bills 
        SET is_approved = 1, approved_on = ?, approved_by = ?
        WHERE substr(bill_date, 1, 7) = ?
      `;
      updateParams = [now, userEmail, monthYear];
    }

    if (empIds && empIds.length > 0) {
      updateQuery += ` AND emp_id IN (${empIds.map(() => '?').join(',')})`;
      updateParams.push(...empIds);
    }
    if (arrearType) {
      updateQuery += " AND arrear_type = ?";
      updateParams.push(arrearType);
    }

    await db.prepare(updateQuery).bind(...updateParams).run();

    const actionText = action === 'reject' ? 'Rejected' : 'Verified & Locked';
    const typeText = arrearType ? ` (${arrearType})` : '';
    logActivity(db, userEmail, 'Arrear Bill Action', `${actionText} arrear bill(s)${typeText} for ${monthYear}`);

    return new Response(JSON.stringify({ success: true, approved_on: action === 'reject' ? null : now, approved_by: action === 'reject' ? null : userEmail }), {
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

    const url = new URL(context.request.url);
    const arrearType = url.searchParams.get('type');

    let query = `
      SELECT is_approved, approved_on, approved_by 
      FROM arrear_bills 
      WHERE substr(bill_date, 1, 7) = ? AND is_approved = 1
    `;
    let params = [monthYear];

    if (arrearType) {
      query += " AND arrear_type = ?";
      params.push(arrearType);
    }

    query += " LIMIT 1";

    const approvalInfo = await db.prepare(query).bind(...params).first();

    return new Response(JSON.stringify(approvalInfo || { is_approved: 0 }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
