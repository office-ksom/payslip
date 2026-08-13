-- Migration 21: Add columns for Daily Wage staff supplementary calculations
ALTER TABLE supplementary_earnings ADD COLUMN days_worked REAL DEFAULT 0;
ALTER TABLE supplementary_earnings ADD COLUMN daily_wage REAL DEFAULT 0;
ALTER TABLE supplementary_earnings ADD COLUMN total_wage REAL DEFAULT 0;
