-- Migration 13: Create tables for Surrender Bill, Arrear Bill, and Festival Allowance Bill

-- 1. Surrender Bills Table
CREATE TABLE IF NOT EXISTS surrender_bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    bill_date TEXT NOT NULL, -- YYYY-MM-DD
    financial_year TEXT NOT NULL, -- YYYY-YYYY (e.g. 2026-2027)
    basic_pay REAL DEFAULT 0,
    da REAL DEFAULT 0,
    hra REAL DEFAULT 0,
    num_els INTEGER NOT NULL,
    total_amount REAL DEFAULT 0,
    is_approved INTEGER DEFAULT 0,
    approved_on TEXT,
    approved_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(emp_id) REFERENCES employees(emp_id),
    UNIQUE(emp_id, bill_date)
);

-- 2. Arrear Bills Table
CREATE TABLE IF NOT EXISTS arrear_bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    arrear_type TEXT NOT NULL, -- "Pay revision", "DA", "Others"
    arrear_type_other TEXT, -- Custom type description if "Others"
    category TEXT NOT NULL, -- "state", "ugc/csir"
    arrear_amount REAL DEFAULT 0,
    income_tax REAL DEFAULT 0,
    net_amount REAL DEFAULT 0,
    bill_date TEXT NOT NULL, -- YYYY-MM-DD
    description TEXT,
    is_approved INTEGER DEFAULT 0,
    approved_on TEXT,
    approved_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(emp_id) REFERENCES employees(emp_id),
    UNIQUE(emp_id, bill_date, arrear_type)
);

-- 3. Festival Allowance Bills Table
CREATE TABLE IF NOT EXISTS festival_allowance_bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    amount REAL DEFAULT 0,
    bill_date TEXT NOT NULL, -- YYYY-MM-DD
    description TEXT,
    is_approved INTEGER DEFAULT 0,
    approved_on TEXT,
    approved_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(emp_id) REFERENCES employees(emp_id),
    UNIQUE(emp_id, bill_date)
);
