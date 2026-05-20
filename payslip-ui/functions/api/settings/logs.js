export async function onRequestGet(context) {
  const userRole = context.request.headers.get('X-User-Role');
  if (userRole !== 'super_admin') {
    return new Response(JSON.stringify({ error: 'Forbidden. Only super admins can view logs.' }), { 
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 1. Query logs from D1 database
    const db = context.env.ksom_payslip_db;
    const { results } = await db.prepare("SELECT * FROM activity_logs ORDER BY id ASC").all();
    
    const dbLogLines = results.map(row => 
      `[${row.timestamp}] [${row.email}] Action: ${row.action} - Description: ${row.description}`
    );

    const url = new URL(context.request.url);
    const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

    let synced = true;
    let finalLogs = '';

    if (isLocal) {
      synced = false;
      try {
        const response = await fetch('http://127.0.0.1:8089/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logs: dbLogLines })
        });
        if (response.ok) {
          const data = await response.json();
          finalLogs = data.logs;
          synced = true;
        }
      } catch (e) {
        // Local log server not running
      }
    }

    if (!finalLogs) {
      finalLogs = dbLogLines.join('\n');
    }

    return new Response(JSON.stringify({ logs: finalLogs || 'No logs recorded yet.', synced }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
