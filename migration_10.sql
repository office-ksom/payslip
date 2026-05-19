-- Migration 10: Add password support to users table
ALTER TABLE users ADD COLUMN password_hash TEXT;
ALTER TABLE users ADD COLUMN reset_token TEXT;
ALTER TABLE users ADD COLUMN reset_token_expiry TIMESTAMP;

-- Set initial password 'admin123' for the super admin
UPDATE users SET password_hash = '100000.0ab8c4472508abdae63e7d7318091e8c.fe66238ef21000472f3521516aafd786ad2afd82d8a6027a6ec70acf1e3b31d5' 
WHERE email = 'sreejith@ksom.res.in';
