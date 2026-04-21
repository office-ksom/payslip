DROP TABLE IF EXISTS allowances_settings;

CREATE TABLE allowances_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    effective_from TEXT NOT NULL UNIQUE, -- YYYY-MM
    da_state_percentage REAL DEFAULT 0,
    da_ugc_percentage REAL DEFAULT 0,
    hra_state_percentage REAL DEFAULT 0,
    hra_ugc_percentage REAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed an initial record effectively from the beginning of time
INSERT INTO allowances_settings (effective_from, da_state_percentage, da_ugc_percentage, hra_state_percentage, hra_ugc_percentage) 
VALUES ('2020-01', 0, 0, 0, 0);
