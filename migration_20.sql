-- Migration 20: Create tables for Contract and Daily Wage Employees, Earnings, and Deductions

-- 1. Contract Employees
CREATE TABLE IF NOT EXISTS contract_employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT UNIQUE NOT NULL,
    title TEXT,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    designation TEXT,
    pay_type TEXT,
    pay REAL DEFAULT 0,
    date_of_birth TEXT,
    date_of_joining TEXT,
    mob_no TEXT,
    email_id TEXT,
    is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS contract_monthly_earnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    basic_pay REAL DEFAULT 0,
    other_earnings REAL DEFAULT 0,
    other_earnings_breakdown TEXT,
    is_approved INTEGER DEFAULT 0,
    approved_on TEXT,
    approved_by TEXT,
    FOREIGN KEY(emp_id) REFERENCES contract_employees(emp_id),
    UNIQUE(emp_id, month_year)
);

CREATE TABLE IF NOT EXISTS contract_monthly_deductions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    income_tax REAL DEFAULT 0,
    hra REAL DEFAULT 0,
    epf REAL DEFAULT 0,
    other_deductions REAL DEFAULT 0,
    other_deductions_breakdown TEXT,
    FOREIGN KEY(emp_id) REFERENCES contract_employees(emp_id),
    UNIQUE(emp_id, month_year)
);

-- 2. Daily Wage Employees
CREATE TABLE IF NOT EXISTS daily_wage_employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT UNIQUE NOT NULL,
    title TEXT,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    designation TEXT,
    pay_type TEXT,
    pay REAL DEFAULT 0,
    date_of_birth TEXT,
    date_of_joining TEXT,
    mob_no TEXT,
    email_id TEXT,
    is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS daily_wage_monthly_earnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    days_worked REAL DEFAULT 0,
    daily_wage REAL DEFAULT 0,
    total_wage REAL DEFAULT 0,
    basic_pay REAL DEFAULT 0, -- same as total_wage for system compatibility
    other_earnings REAL DEFAULT 0,
    other_earnings_breakdown TEXT,
    is_approved INTEGER DEFAULT 0,
    approved_on TEXT,
    approved_by TEXT,
    FOREIGN KEY(emp_id) REFERENCES daily_wage_employees(emp_id),
    UNIQUE(emp_id, month_year)
);

CREATE TABLE IF NOT EXISTS daily_wage_monthly_deductions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    income_tax REAL DEFAULT 0,
    hra REAL DEFAULT 0,
    epf REAL DEFAULT 0,
    other_deductions REAL DEFAULT 0,
    other_deductions_breakdown TEXT,
    FOREIGN KEY(emp_id) REFERENCES daily_wage_employees(emp_id),
    UNIQUE(emp_id, month_year)
);

-- Seed default max limit for daily wage
INSERT OR IGNORE INTO system_settings (key, value) VALUES ('daily_wage_max_limit', '20000');
