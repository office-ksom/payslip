-- Migration 28: Add epf_uan column to contract_employees table
ALTER TABLE contract_employees ADD COLUMN epf_uan TEXT;
