-- Migration 17: Create tables for Supplementary Paybills
CREATE TABLE IF NOT EXISTS supplementary_earnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL, -- YYYY-MM
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
    FOREIGN KEY(emp_id) REFERENCES employees(emp_id),
    UNIQUE(emp_id, month_year)
);

CREATE TABLE IF NOT EXISTS supplementary_deductions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL, -- YYYY-MM
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
    FOREIGN KEY(emp_id) REFERENCES employees(emp_id),
    UNIQUE(emp_id, month_year)
);
