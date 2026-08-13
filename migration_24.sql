-- Migration 24: Remove foreign key constraints from all earnings, deductions, and bill tables
PRAGMA foreign_keys = OFF;

-- 1. monthly_earnings
CREATE TABLE monthly_earnings_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    basic_pay REAL DEFAULT 0,
    dp_gp REAL DEFAULT 0,
    da_state REAL DEFAULT 0,
    da_ugc REAL DEFAULT 0,
    hra_state REAL DEFAULT 0,
    hra_ugc REAL DEFAULT 0,
    cca REAL DEFAULT 0,
    other_earnings REAL DEFAULT 0,
    spl_pay REAL DEFAULT 0,
    tr_allow REAL DEFAULT 0,
    spl_allow REAL DEFAULT 0,
    fest_allow REAL DEFAULT 0,
    other_earnings_breakdown TEXT,
    is_approved INTEGER DEFAULT 0,
    approved_on TEXT,
    approved_by TEXT,
    UNIQUE(emp_id, month_year)
);
INSERT INTO monthly_earnings_new SELECT * FROM monthly_earnings;
DROP TABLE monthly_earnings;
ALTER TABLE monthly_earnings_new RENAME TO monthly_earnings;

-- 2. monthly_deductions
CREATE TABLE monthly_deductions_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    epf REAL DEFAULT 0,
    professional_tax REAL DEFAULT 0,
    sli REAL DEFAULT 0,
    gis REAL DEFAULT 0,
    lic REAL DEFAULT 0,
    income_tax REAL DEFAULT 0,
    onam_advance REAL DEFAULT 0,
    other_deductions REAL DEFAULT 0,
    cpf REAL DEFAULT 0,
    hra_recovery REAL DEFAULT 0,
    other_deductions_breakdown TEXT,
    UNIQUE(emp_id, month_year)
);
INSERT INTO monthly_deductions_new SELECT * FROM monthly_deductions;
DROP TABLE monthly_deductions;
ALTER TABLE monthly_deductions_new RENAME TO monthly_deductions;

-- 3. visiting_monthly_earnings
CREATE TABLE visiting_monthly_earnings_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    basic_pay REAL DEFAULT 0,
    other_earnings REAL DEFAULT 0,
    other_earnings_breakdown TEXT,
    is_approved INTEGER DEFAULT 0,
    approved_on TEXT,
    approved_by TEXT,
    UNIQUE(emp_id, month_year)
);
INSERT INTO visiting_monthly_earnings_new SELECT * FROM visiting_monthly_earnings;
DROP TABLE visiting_monthly_earnings;
ALTER TABLE visiting_monthly_earnings_new RENAME TO visiting_monthly_earnings;

-- 4. visiting_monthly_deductions
CREATE TABLE visiting_monthly_deductions_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    income_tax REAL DEFAULT 0,
    hra REAL DEFAULT 0,
    other_deductions REAL DEFAULT 0,
    other_deductions_breakdown TEXT,
    UNIQUE(emp_id, month_year)
);
INSERT INTO visiting_monthly_deductions_new SELECT * FROM visiting_monthly_deductions;
DROP TABLE visiting_monthly_deductions;
ALTER TABLE visiting_monthly_deductions_new RENAME TO visiting_monthly_deductions;

-- 5. contract_monthly_earnings
CREATE TABLE contract_monthly_earnings_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    basic_pay REAL DEFAULT 0,
    other_earnings REAL DEFAULT 0,
    other_earnings_breakdown TEXT,
    is_approved INTEGER DEFAULT 0,
    approved_on TEXT,
    approved_by TEXT,
    UNIQUE(emp_id, month_year)
);
INSERT INTO contract_monthly_earnings_new SELECT * FROM contract_monthly_earnings;
DROP TABLE contract_monthly_earnings;
ALTER TABLE contract_monthly_earnings_new RENAME TO contract_monthly_earnings;

-- 6. contract_monthly_deductions
CREATE TABLE contract_monthly_deductions_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    income_tax REAL DEFAULT 0,
    hra REAL DEFAULT 0,
    epf REAL DEFAULT 0,
    other_deductions REAL DEFAULT 0,
    other_deductions_breakdown TEXT,
    UNIQUE(emp_id, month_year)
);
INSERT INTO contract_monthly_deductions_new SELECT * FROM contract_monthly_deductions;
DROP TABLE contract_monthly_deductions;
ALTER TABLE contract_monthly_deductions_new RENAME TO contract_monthly_deductions;

-- 7. daily_wage_monthly_earnings
CREATE TABLE daily_wage_monthly_earnings_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    days_worked REAL DEFAULT 0,
    daily_wage REAL DEFAULT 0,
    total_wage REAL DEFAULT 0,
    basic_pay REAL DEFAULT 0,
    other_earnings REAL DEFAULT 0,
    other_earnings_breakdown TEXT,
    is_approved INTEGER DEFAULT 0,
    approved_on TEXT,
    approved_by TEXT,
    UNIQUE(emp_id, month_year)
);
INSERT INTO daily_wage_monthly_earnings_new SELECT * FROM daily_wage_monthly_earnings;
DROP TABLE daily_wage_monthly_earnings;
ALTER TABLE daily_wage_monthly_earnings_new RENAME TO daily_wage_monthly_earnings;

-- 8. daily_wage_monthly_deductions
CREATE TABLE daily_wage_monthly_deductions_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    income_tax REAL DEFAULT 0,
    hra REAL DEFAULT 0,
    epf REAL DEFAULT 0,
    other_deductions REAL DEFAULT 0,
    other_deductions_breakdown TEXT,
    UNIQUE(emp_id, month_year)
);
INSERT INTO daily_wage_monthly_deductions_new SELECT * FROM daily_wage_monthly_deductions;
DROP TABLE daily_wage_monthly_deductions;
ALTER TABLE daily_wage_monthly_deductions_new RENAME TO daily_wage_monthly_deductions;

-- 9. surrender_bills
CREATE TABLE surrender_bills_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    bill_date TEXT NOT NULL, 
    financial_year TEXT NOT NULL, 
    basic_pay REAL DEFAULT 0,
    da REAL DEFAULT 0,
    hra REAL DEFAULT 0,
    num_els INTEGER NOT NULL,
    total_amount REAL DEFAULT 0,
    is_approved INTEGER DEFAULT 0,
    approved_on TEXT,
    approved_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_terminal INTEGER DEFAULT 0,
    UNIQUE(emp_id, bill_date)
);
INSERT INTO surrender_bills_new SELECT * FROM surrender_bills;
DROP TABLE surrender_bills;
ALTER TABLE surrender_bills_new RENAME TO surrender_bills;

PRAGMA foreign_keys = ON;
