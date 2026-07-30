-- Migration 19: Create tables for Visiting Employees, Earnings, and Deductions
CREATE TABLE IF NOT EXISTS visiting_employees (
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

CREATE TABLE IF NOT EXISTS visiting_monthly_earnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    basic_pay REAL DEFAULT 0,
    other_earnings REAL DEFAULT 0,
    other_earnings_breakdown TEXT,
    is_approved INTEGER DEFAULT 0,
    approved_on TEXT,
    approved_by TEXT,
    FOREIGN KEY(emp_id) REFERENCES visiting_employees(emp_id),
    UNIQUE(emp_id, month_year)
);

CREATE TABLE IF NOT EXISTS visiting_monthly_deductions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL,
    income_tax REAL DEFAULT 0,
    hra REAL DEFAULT 0,
    other_deductions REAL DEFAULT 0,
    other_deductions_breakdown TEXT,
    FOREIGN KEY(emp_id) REFERENCES visiting_employees(emp_id),
    UNIQUE(emp_id, month_year)
);
