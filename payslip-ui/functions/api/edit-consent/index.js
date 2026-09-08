import { logActivity } from '../../lib/logger.js';
import { getConsentStatus, setConsentStatus, hasAdminConsent } from '../../lib/consent_helper.js';

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const module = url.searchParams.get('module');
    const periodKey = url.searchParams.get('period_key');
    const db = context.env.ksom_payslip_db;

    if (!module || !periodKey) {
      return new Response(JSON.stringify({ error: 'Missing module or period_key parameter' }), { status: 400 });
    }

    const consent = await getConsentStatus(db, module, periodKey);
    const isActive = consent ? consent.status === 'active' : false;

    return new Response(JSON.stringify({
      has_consent: isActive,
      consent: consent
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const userRole = context.request.headers.get('X-User-Role');
  const userEmail = context.request.headers.get('X-User-Email');

  try {
    const body = await context.request.json().catch(() => ({}));
    const { module, period_key, action, notes } = body;
    const db = context.env.ksom_payslip_db;

    if (!module || !period_key) {
      return new Response(JSON.stringify({ error: 'Missing module or period_key' }), { status: 400 });
    }

    if (action === 'request') {
      // Admin requests consent
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
      }
      await logActivity(db, userEmail, 'Request Edit Permission', `Admin requested edit consent for locked ${module} (${period_key}): ${notes || 'No note'}`);
      return new Response(JSON.stringify({ success: true, message: 'Edit request submitted to Super Admin.' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Grant or Revoke: Only Super Admin
    if (userRole !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Only Super Admins can grant or revoke edit consent.' }), { status: 403 });
    }

    const newStatus = action === 'revoke' ? 'revoked' : 'active';
    const result = await setConsentStatus(db, module, period_key, userEmail, newStatus, notes || '');

    const logAction = newStatus === 'active' ? 'Grant Edit Consent' : 'Revoke Edit Consent';
    const logDesc = `${newStatus === 'active' ? 'Granted' : 'Revoked'} edit consent to Admin for locked ${module} (${period_key})`;
    await logActivity(db, userEmail, logAction, logDesc);

    return new Response(JSON.stringify({ success: true, consent: result }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
