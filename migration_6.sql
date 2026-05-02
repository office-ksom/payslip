-- Migration 6: Add title and sort_order to employees
ALTER TABLE employees ADD COLUMN title TEXT;
ALTER TABLE employees ADD COLUMN sort_order INTEGER DEFAULT 0;
