-- Migration 18: Add is_terminal column to surrender_bills
ALTER TABLE surrender_bills ADD COLUMN is_terminal INTEGER DEFAULT 0;
