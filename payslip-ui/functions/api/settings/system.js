import { logActivity } from '../../lib/logger.js';

export async function onRequestGet(context) {
  try {
    const db = context.env.ksom_payslip_db;
    const settings = await db.prepare("SELECT * FROM system_settings").all();
    const settingsMap = {};
    settings.results.forEach(row => {
      settingsMap[row.key] = row.value;
    });
    return new Response(JSON.stringify(settingsMap), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const userRole = context.request.headers.get('X-User-Role');
  const userEmail = context.request.headers.get('X-User-Email');
  if (userRole !== 'super_admin') {
    return new Response(JSON.stringify({ error: 'Forbidden. Only super admin can change system settings.' }), { status: 403 });
  }

  try {
    const data = await context.request.json();
    const db = context.env.ksom_payslip_db;
    
    const statements = [];
    for (const [key, value] of Object.entries(data)) {
      statements.push(
        db.prepare("INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)")
          .bind(key, String(value))
      );
    }

    if (statements.length > 0) {
      await db.batch(statements);
    }

    // Log the change
    if ('require_approval' in data) {
      const mode = data.require_approval === '1' ? 'Enabled (Approval Required)' : 'Disabled (Direct Lock Allowed)';
      logActivity(db, userEmail, 'Update System Settings', `Changed approval requirement to ${mode}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
