-- Migration 27: Add appointment_type column to employees table
ALTER TABLE employees ADD COLUMN appointment_type TEXT DEFAULT 'Permanent';
