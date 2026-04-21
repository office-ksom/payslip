DROP TABLE IF EXISTS monthly_deductions;
DROP TABLE IF EXISTS monthly_earnings;
DROP TABLE IF EXISTS allowances_settings;
DROP TABLE IF EXISTS employees;

-- 1. Employees Table
CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    designation TEXT,
    date_of_birth TEXT, -- YYYY-MM-DD
    date_of_joining TEXT, -- YYYY-MM-DD
    scale_of_pay TEXT,
    category TEXT -- state, ugc, temporary, contract
);

-- 2. Allowances Settings (Global Rules/Percentages)
CREATE TABLE allowances_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    da_state_percentage REAL DEFAULT 0,
    da_ugc_percentage REAL DEFAULT 0,
    hra_state_percentage REAL DEFAULT 0,
    hra_ugc_percentage REAL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default settings
INSERT INTO allowances_settings (id) VALUES (1);

-- 3. Monthly Earnings Table
CREATE TABLE monthly_earnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL,
    month_year TEXT NOT NULL, -- YYYY-MM
    basic_pay REAL DEFAULT 0,
    dp_gp REAL DEFAULT 0,
    da_state REAL DEFAULT 0,
    da_ugc REAL DEFAULT 0,
    hra_state REAL DEFAULT 0,
    hra_ugc REAL DEFAULT 0,
    cca REAL DEFAULT 0,
    other_earnings REAL DEFAULT 0,
    FOREIGN KEY(emp_id) REFERENCES employees(emp_id),
    UNIQUE(emp_id, month_year)
);

-- 4. Monthly Deductions Table
CREATE TABLE monthly_deductions (
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
    FOREIGN KEY(emp_id) REFERENCES employees(emp_id),
    UNIQUE(emp_id, month_year)
);
