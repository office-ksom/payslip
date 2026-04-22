-- Add is_active flag to employees
ALTER TABLE employees ADD COLUMN is_active INTEGER DEFAULT 1;
