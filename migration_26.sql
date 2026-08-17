-- Migration 26: Add approval and lock columns to epf_entries table
ALTER TABLE epf_entries ADD COLUMN is_approved INTEGER DEFAULT 0;
ALTER TABLE epf_entries ADD COLUMN approved_on TEXT;
ALTER TABLE epf_entries ADD COLUMN approved_by TEXT;
