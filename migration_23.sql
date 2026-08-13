-- Migration 23: Remove FOREIGN KEY constraints from bill tables
-- to allow visiting, contract, and daily wage employees (who live in separate tables)
-- to have records in these shared bill tables.

-- SQLite does not support ALTER TABLE DROP CONSTRAINT, so we must recreate each table.

PRAGMA foreign_keys = OFF;

-- 1. arrear_bills
CREATE TABLE arrear_bills_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    arrear_type TEXT NOT NULL,
    arrear_type_other TEXT,
    category TEXT NOT NULL,
    arrear_amount REAL DEFAULT 0,
    income_tax REAL DEFAULT 0,
    net_amount REAL DEFAULT 0,
    bill_date TEXT NOT NULL,
    description TEXT,
    is_approved INTEGER DEFAULT 0,
    approved_on TEXT,
    approved_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(emp_id, bill_date, arrear_type)
);
INSERT INTO arrear_bills_new SELECT * FROM arrear_bills;
DROP TABLE arrear_bills;
ALTER TABLE arrear_bills_new RENAME TO arrear_bills;

-- 2. festival_allowance_bills
CREATE TABLE festival_allowance_bills_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    amount REAL DEFAULT 0,
    bill_date TEXT NOT NULL,
    description TEXT,
    is_approved INTEGER DEFAULT 0,
    approved_on TEXT,
    approved_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category TEXT DEFAULT 'permanent',
    UNIQUE(emp_id, bill_date)
);
INSERT INTO festival_allowance_bills_new SELECT * FROM festival_allowance_bills;
DROP TABLE festival_allowance_bills;
ALTER TABLE festival_allowance_bills_new RENAME TO festival_allowance_bills;

-- 3. supplementary_earnings
CREATE TABLE supplementary_earnings_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    num_days INTEGER DEFAULT 0,
    regular_basic REAL DEFAULT 0,
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
    days_worked INTEGER DEFAULT 0,
    daily_wage REAL DEFAULT 0,
    total_wage REAL DEFAULT 0,
    UNIQUE(emp_id, month_year)
);
INSERT INTO supplementary_earnings_new SELECT * FROM supplementary_earnings;
DROP TABLE supplementary_earnings;
ALTER TABLE supplementary_earnings_new RENAME TO supplementary_earnings;

-- 4. supplementary_deductions
CREATE TABLE supplementary_deductions_new (
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
INSERT INTO supplementary_deductions_new SELECT * FROM supplementary_deductions;
DROP TABLE supplementary_deductions;
ALTER TABLE supplementary_deductions_new RENAME TO supplementary_deductions;

PRAGMA foreign_keys = ON;
