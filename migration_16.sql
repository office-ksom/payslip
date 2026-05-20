-- Migration 16: Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    email TEXT,
    action TEXT,
    description TEXT
);
