export async function logActivity(db, userEmail, action, description) {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  const pad = (n) => String(n).padStart(2, '0');
  const timestamp = `${istDate.getUTCFullYear()}-${pad(istDate.getUTCMonth() + 1)}-${pad(istDate.getUTCDate())} ${pad(istDate.getUTCHours())}:${pad(istDate.getUTCMinutes())}:${pad(istDate.getUTCSeconds())}`;
  
  const logLine = `[${timestamp}] [${userEmail || 'system'}] Action: ${action} - Description: ${description}`;
  
  console.log(logLine);

  // 1. Post to the local log helper server (non-blocking)
  fetch('http://127.0.0.1:8089/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ logLine })
  }).catch(err => {
    // Silently ignore if local server is down
  });

  // 2. Insert into D1 activity_logs table
  if (db) {
    try {
      await db.prepare("INSERT INTO activity_logs (timestamp, email, action, description) VALUES (?, ?, ?, ?)")
        .bind(timestamp, userEmail || 'system', action, description)
        .run();
    } catch (err) {
      console.error("D1 activity logging failed:", err);
    }
  }
}
