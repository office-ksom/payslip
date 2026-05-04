-- Migration 7: Create backup_settings table
CREATE TABLE IF NOT EXISTS backup_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    backup_email TEXT,
    frequency TEXT DEFAULT 'weekly', -- daily, weekly, monthly
    is_enabled INTEGER DEFAULT 0,
    last_backup_at TIMESTAMP
);

INSERT OR IGNORE INTO backup_settings (id, frequency, is_enabled) VALUES (1, 'weekly', 0);
