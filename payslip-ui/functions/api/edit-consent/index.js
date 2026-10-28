import { logActivity } from '../../lib/logger.js';
import { getConsentStatus, setConsentStatus, hasAdminConsent } from '../../lib/consent_helper.js';

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const module = url.searchParams.get('module');
    const periodKey = url.searchParams.get('period_key') || '';
    const db = context.env.ksom_payslip_db;

    if (!periodKey) {
      return new Response(JSON.stringify({ error: 'Missing period_key parameter' }), { status: 400 });
    }

    // If single module is specified (used by individual pages: Paybill, Supplementary, Surrender, Arrears, Festival, EPF)
    if (module && module !== 'all') {
      const consent = await getConsentStatus(db, module, periodKey);
      const isActive = consent ? consent.status === 'active' : false;

      return new Response(JSON.stringify({
        has_consent: isActive,
        consent: consent
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Batch status for Settings page: return status of all 6 pages
    const modulesList = [
      { id: 'paybill', name: 'Paybill' },
      { id: 'supplementary', name: 'Supplementary paybill' },
      { id: 'surrender', name: 'Surrender Bill' },
      { id: 'arrears', name: 'Arrear Bill' },
      { id: 'festival', name: 'Festival allowance Bill' },
      { id: 'epf', name: 'EPF Entry' }
    ];

    const isAllMonths = periodKey === 'ALL';
    const statuses = {};

    for (const m of modulesList) {
      const consent = await getConsentStatus(db, m.id, periodKey);
      const isConsentActive = consent ? consent.status === 'active' : false;

      let lockedCount = 0;
      try {
        if (m.id === 'paybill') {
          const res = isAllMonths
            ? await db.prepare("SELECT count(*) as count FROM monthly_earnings WHERE is_approved = 1").first('count')
            : await db.prepare("SELECT count(*) as count FROM monthly_earnings WHERE month_year = ? AND is_approved = 1").bind(periodKey).first('count');
          lockedCount = res || 0;
        } else if (m.id === 'supplementary') {
          const res = isAllMonths
            ? await db.prepare("SELECT count(*) as count FROM supplementary_earnings WHERE is_approved = 1").first('count')
            : await db.prepare("SELECT count(*) as count FROM supplementary_earnings WHERE month_year = ? AND is_approved = 1").bind(periodKey).first('count');
          lockedCount = res || 0;
        } else if (m.id === 'surrender') {
          const res = isAllMonths
            ? await db.prepare("SELECT count(*) as count FROM surrender_bills WHERE is_approved = 1").first('count')
            : await db.prepare("SELECT count(*) as count FROM surrender_bills WHERE substr(bill_date, 1, 7) = ? AND is_approved = 1").bind(periodKey).first('count');
          lockedCount = res || 0;
        } else if (m.id === 'arrears') {
          const res = isAllMonths
            ? await db.prepare("SELECT count(*) as count FROM arrear_bills WHERE is_approved = 1").first('count')
            : await db.prepare("SELECT count(*) as count FROM arrear_bills WHERE substr(bill_date, 1, 7) = ? AND is_approved = 1").bind(periodKey).first('count');
          lockedCount = res || 0;
        } else if (m.id === 'festival') {
          const res = isAllMonths
            ? await db.prepare("SELECT count(*) as count FROM festival_allowance_bills WHERE is_approved = 1").first('count')
            : await db.prepare("SELECT count(*) as count FROM festival_allowance_bills WHERE substr(bill_date, 1, 7) = ? AND is_approved = 1").bind(periodKey).first('count');
          lockedCount = res || 0;
        } else if (m.id === 'epf') {
          const res = isAllMonths
            ? await db.prepare("SELECT count(*) as count FROM epf_entries WHERE is_approved = 1").first('count')
            : await db.prepare("SELECT count(*) as count FROM epf_entries WHERE month_year = ? AND is_approved = 1").bind(periodKey).first('count');
          lockedCount = res || 0;
        }
      } catch (err) {
        console.error(`Error querying locked count for ${m.id}:`, err);
      }

      // A page is locked ONLY if it has verified/locked records AND consent is not active.
      const isLocked = lockedCount > 0 && !isConsentActive;
      const isUnlocked = !isLocked;

      statuses[m.id] = {
        id: m.id,
        name: m.name,
        is_locked: isLocked,
        unlocked: isUnlocked,
        is_consent_active: isConsentActive,
        locked_count: lockedCount,
        consent: consent
      };
    }

    return new Response(JSON.stringify({
      period_key: periodKey,
      statuses: statuses
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
    const { module, modules, period_key, action, notes } = body;
    const db = context.env.ksom_payslip_db;

    const targetModules = Array.isArray(modules) && modules.length > 0
      ? modules
      : (module ? [module] : []);

    if (targetModules.length === 0 || !period_key) {
      return new Response(JSON.stringify({ error: 'Missing module(s) or period_key' }), { status: 400 });
    }

    if (action === 'request') {
      // Admin requests consent
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
      }
      await logActivity(db, userEmail, 'Request Edit Permission', `Admin requested edit consent for locked ${targetModules.join(', ')} (${period_key}): ${notes || 'No note'}`);
      return new Response(JSON.stringify({ success: true, message: 'Edit request submitted to Super Admin.' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Grant/Unlock or Revoke/Lock: Allowed for Admins and Super Admins
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Only Admins and Super Admins can unlock locked pages.' }), { status: 403 });
    }

    const isUnlock = action === 'grant' || action === 'unlock';
    const newStatus = isUnlock ? 'active' : 'revoked';

    const results = [];
    for (const mod of targetModules) {
      // For paybill, ensure both parent 'paybill' and all sub-modules are updated
      const subMods = mod === 'paybill'
        ? ['paybill', 'paybill_permanent', 'paybill_contract', 'paybill_daily_wage', 'paybill_visiting']
        : [mod];

      for (const m of subMods) {
        const res = await setConsentStatus(db, m, period_key, userEmail, newStatus, notes || '');
        results.push(res);
      }
    }

    const logAction = isUnlock ? 'Unlock Pages for Admin' : 'Lock / Revoke Page Unlock';
    const logDesc = `${isUnlock ? 'Unlocked' : 'Locked/Revoked unlock for'} pages: ${targetModules.join(', ')} (${period_key}) by ${userEmail}`;
    await logActivity(db, userEmail, logAction, logDesc);

    // When locking an active period (not ALL), sync approval date & time to earnings tables
    if (!isUnlock && period_key && period_key !== 'ALL') {
      const now = new Date().toISOString();
      for (const mod of targetModules) {
        if (mod === 'paybill' || mod === 'paybill_permanent') {
          await db.prepare("UPDATE monthly_earnings SET is_approved = 1, approved_on = ?, approved_by = ? WHERE month_year = ?").bind(now, userEmail, period_key).run().catch(() => {});
        }
        if (mod === 'paybill' || mod === 'paybill_contract') {
          await db.prepare("UPDATE contract_monthly_earnings SET is_approved = 1, approved_on = ?, approved_by = ? WHERE month_year = ?").bind(now, userEmail, period_key).run().catch(() => {});
        }
        if (mod === 'paybill' || mod === 'paybill_visiting') {
          await db.prepare("UPDATE visiting_monthly_earnings SET is_approved = 1, approved_on = ?, approved_by = ? WHERE month_year = ?").bind(now, userEmail, period_key).run().catch(() => {});
        }
        if (mod === 'paybill' || mod === 'paybill_daily_wage') {
          await db.prepare("UPDATE daily_wage_monthly_earnings SET is_approved = 1, approved_on = ?, approved_by = ? WHERE month_year = ?").bind(now, userEmail, period_key).run().catch(() => {});
        }
        if (mod === 'supplementary') {
          await db.prepare("UPDATE supplementary_earnings SET is_approved = 1, approved_on = ?, approved_by = ? WHERE month_year = ?").bind(now, userEmail, period_key).run().catch(() => {});
        }
      }
    }

    return new Response(JSON.stringify({ success: true, updated: results, status: newStatus }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
