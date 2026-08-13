-- Migration 22: Add category column to festival_allowance_bills table
ALTER TABLE festival_allowance_bills ADD COLUMN category TEXT DEFAULT 'permanent';
