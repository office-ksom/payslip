-- Migration 25: Add epf_uan to daily_wage_employees and create epf_entries table

-- 1. Add epf_uan to daily_wage_employees
ALTER TABLE daily_wage_employees ADD COLUMN epf_uan TEXT;

-- 2. Create epf_entries table
CREATE TABLE IF NOT EXISTS epf_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    employee_category TEXT NOT NULL, -- 'permanent' or 'daily_wage'
    month_year TEXT NOT NULL, -- YYYY-MM
    wages REAL DEFAULT 0,
    epf_wage REAL DEFAULT 0,
    eps_wage REAL DEFAULT 0,
    edli REAL DEFAULT 0,
    employee_contribution REAL DEFAULT 0,
    employer_contribution REAL DEFAULT 0,
    admin_charges REAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(emp_id, month_year)
);
