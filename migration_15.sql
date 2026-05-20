-- Migration 15: Create system settings table
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT OR IGNORE INTO system_settings (key, value) VALUES ('require_approval', '1');
