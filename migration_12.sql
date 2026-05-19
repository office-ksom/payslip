ALTER TABLE monthly_earnings ADD COLUMN is_approved INTEGER DEFAULT 0;
ALTER TABLE monthly_earnings ADD COLUMN approved_on TEXT;
ALTER TABLE monthly_earnings ADD COLUMN approved_by TEXT;
