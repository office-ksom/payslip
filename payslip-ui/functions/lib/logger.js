export function logActivity(db, userEmail, action, description) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  
  const logLine = `[${timestamp}] [${userEmail || 'system'}] Action: ${action} - Description: ${description}`;
  
  console.log(logLine);

  // 1. Post to the local log helper server (which runs on port 8089 in local dev)
  fetch('http://127.0.0.1:8089/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ logLine })
  }).catch(err => {
    // Silently catch error if helper server is not running (e.g. in production/remote environment)
  });

  // 2. Insert into D1 activity_logs table
  if (db) {
    db.prepare("INSERT INTO activity_logs (timestamp, email, action, description) VALUES (?, ?, ?, ?)")
      .bind(timestamp, userEmail || 'system', action, description)
      .run()
      .catch(err => {
        console.error("D1 activity logging failed:", err);
      });
  }
}
