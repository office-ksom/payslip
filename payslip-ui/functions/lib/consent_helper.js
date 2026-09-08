export async function ensureConsentTable(db) {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS edit_consents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module TEXT NOT NULL,
        period_key TEXT NOT NULL,
        granted_by TEXT NOT NULL,
        granted_at TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        notes TEXT,
        UNIQUE(module, period_key)
      )
    `).run();
  } catch (e) {
    console.error("ensureConsentTable error:", e);
  }
}

export async function hasAdminConsent(db, module, periodKey) {
  try {
    await ensureConsentTable(db);
    // Period key check: if periodKey is provided, check exact match or prefix if relevant
    const row = await db.prepare(
      "SELECT status FROM edit_consents WHERE module = ? AND period_key = ? AND status = 'active' LIMIT 1"
    ).bind(module, periodKey).first();
    return !!row;
  } catch (err) {
    console.error("hasAdminConsent check error:", err);
    return false;
  }
}

export async function getConsentStatus(db, module, periodKey) {
  try {
    await ensureConsentTable(db);
    const row = await db.prepare(
      "SELECT module, period_key, granted_by, granted_at, status, notes FROM edit_consents WHERE module = ? AND period_key = ? LIMIT 1"
    ).bind(module, periodKey).first();
    return row || null;
  } catch (err) {
    console.error("getConsentStatus error:", err);
    return null;
  }
}

export async function setConsentStatus(db, module, periodKey, grantedBy, status = 'active', notes = '') {
  try {
    await ensureConsentTable(db);
    const now = new Date().toISOString();
    await db.prepare(`
      INSERT INTO edit_consents (module, period_key, granted_by, granted_at, status, notes)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(module, period_key) DO UPDATE SET
        granted_by = excluded.granted_by,
        granted_at = excluded.granted_at,
        status = excluded.status,
        notes = excluded.notes
    `).bind(module, periodKey, grantedBy, now, status, notes).run();
    return { success: true, module, period_key: periodKey, granted_by: grantedBy, granted_at: now, status, notes };
  } catch (err) {
    console.error("setConsentStatus error:", err);
    throw err;
  }
}
