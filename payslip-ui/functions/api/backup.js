export async function onRequestGet(context) {
  try {
    const db = context.env.ksom_payslip_db;
    const tables = ['employees', 'allowances_settings', 'monthly_earnings', 'monthly_deductions'];
    let sqlDump = `-- KSoM Payslip Portal Backup\n-- Generated: ${new Date().toISOString()}\n\nPRAGMA defer_foreign_keys=TRUE;\n\n`;

    for (const table of tables) {
      // 1. Get Create Table statement (simplified approach)
      // Note: In D1 we can't easily get the original CREATE TABLE via SQL, 
      // so we use a predefined structure or just focus on the data if tables exist.
      // But for a full restore, we want to drop and recreate.
      
      sqlDump += `DROP TABLE IF EXISTS ${table};\n`;
      
      // We'll use the schema we know
      if (table === 'employees') {
        sqlDump += `CREATE TABLE employees (id INTEGER PRIMARY KEY AUTOINCREMENT, emp_id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, designation TEXT, date_of_birth TEXT, date_of_joining TEXT, scale_of_pay TEXT, category TEXT, title TEXT, sort_order INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1, email_id TEXT, mob_no TEXT, epf_uan TEXT);\n`;
      } else if (table === 'allowances_settings') {
        sqlDump += `CREATE TABLE allowances_settings (id INTEGER PRIMARY KEY AUTOINCREMENT, effective_from TEXT NOT NULL UNIQUE, da_state_percentage REAL DEFAULT 0, da_ugc_percentage REAL DEFAULT 0, hra_state_percentage REAL DEFAULT 0, hra_ugc_percentage REAL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);\n`;
      } else if (table === 'monthly_earnings') {
        sqlDump += `CREATE TABLE monthly_earnings (id INTEGER PRIMARY KEY AUTOINCREMENT, emp_id TEXT NOT NULL, month_year TEXT NOT NULL, basic_pay REAL DEFAULT 0, dp_gp REAL DEFAULT 0, da_state REAL DEFAULT 0, da_ugc REAL DEFAULT 0, hra_state REAL DEFAULT 0, hra_ugc REAL DEFAULT 0, cca REAL DEFAULT 0, other_earnings REAL DEFAULT 0, spl_pay REAL DEFAULT 0, tr_allow REAL DEFAULT 0, spl_allow REAL DEFAULT 0, fest_allow REAL DEFAULT 0, FOREIGN KEY(emp_id) REFERENCES employees(emp_id), UNIQUE(emp_id, month_year));\n`;
      } else if (table === 'monthly_deductions') {
        sqlDump += `CREATE TABLE monthly_deductions (id INTEGER PRIMARY KEY AUTOINCREMENT, emp_id TEXT NOT NULL, month_year TEXT NOT NULL, epf REAL DEFAULT 0, professional_tax REAL DEFAULT 0, sli REAL DEFAULT 0, gis REAL DEFAULT 0, lic REAL DEFAULT 0, income_tax REAL DEFAULT 0, onam_advance REAL DEFAULT 0, other_deductions REAL DEFAULT 0, cpf REAL DEFAULT 0, hra_recovery REAL DEFAULT 0, FOREIGN KEY(emp_id) REFERENCES employees(emp_id), UNIQUE(emp_id, month_year));\n`;
      }

      // 2. Get Data
      const { results } = await db.prepare(`SELECT * FROM ${table}`).all();
      for (const row of results) {
        const columns = Object.keys(row);
        const values = Object.values(row).map(val => {
          if (val === null) return 'NULL';
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
          return val;
        });
        sqlDump += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
      }
      sqlDump += '\n';
    }

    return new Response(sqlDump, {
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="ksom_backup_${new Date().toISOString().split('T')[0]}.sql"`
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const db = context.env.ksom_payslip_db;
    const { sql } = await context.request.json();
    
    if (!sql || !sql.includes('INSERT INTO')) {
      return new Response(JSON.stringify({ error: "Invalid SQL dump provided." }), { status: 400 });
    }

    // Split SQL into individual statements
    // This is a simple split, might need more robust parsing for complex SQL
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const d1Statements = statements.map(s => db.prepare(s));
    
    // Execute in batch
    await db.batch(d1Statements);

    return new Response(JSON.stringify({ success: true, count: statements.length }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
