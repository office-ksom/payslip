import { generateBackupSql } from '../lib/backup_helper.js';

export async function onRequestGet(context) {
  try {
    const db = context.env.ksom_payslip_db;
    const sqlDump = await generateBackupSql(db);

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
