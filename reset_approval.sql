-- Reset all approval statuses to 0
UPDATE monthly_earnings SET is_approved = 0, approved_on = NULL, approved_by = NULL;
