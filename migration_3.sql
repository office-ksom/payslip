-- Add new earning fields to monthly_earnings
ALTER TABLE monthly_earnings ADD COLUMN spl_pay REAL DEFAULT 0;
ALTER TABLE monthly_earnings ADD COLUMN tr_allow REAL DEFAULT 0;
ALTER TABLE monthly_earnings ADD COLUMN spl_allow REAL DEFAULT 0;
ALTER TABLE monthly_earnings ADD COLUMN fest_allow REAL DEFAULT 0;

-- Add new deduction fields to monthly_deductions
ALTER TABLE monthly_deductions ADD COLUMN cpf REAL DEFAULT 0;
ALTER TABLE monthly_deductions ADD COLUMN hra_recovery REAL DEFAULT 0;
