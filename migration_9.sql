-- Migration 9: Add password column to users
ALTER TABLE users ADD COLUMN password TEXT;

-- Update the initial super admin with a default password 'ksom123'
-- In a real app, this should be a hash. For this portal, we will use the email + password approach.
UPDATE users SET password = 'password123' WHERE email = 'sreejith@ksom.res.in';
