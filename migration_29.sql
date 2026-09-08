-- Migration 29: Create edit_consents table for Super Admin consent/permission system
CREATE TABLE IF NOT EXISTS edit_consents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module TEXT NOT NULL,
    period_key TEXT NOT NULL,
    granted_by TEXT NOT NULL,
    granted_at TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    notes TEXT,
    UNIQUE(module, period_key)
);
