-- Migration 8: Create users table for RBAC
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer', -- super_admin, admin, approver, viewer
    status TEXT NOT NULL DEFAULT 'active', -- active, inactive
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed the initial Super Admin
INSERT OR IGNORE INTO users (email, role, status) VALUES ('sreejith@ksom.res.in', 'super_admin', 'active');
