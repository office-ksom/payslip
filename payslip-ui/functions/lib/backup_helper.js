import { getAccessToken, buildMimeMessage, base64url } from './gmail.js';

export async function generateBackupSql(db) {
  const { results: tables } = await db.prepare(
    "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'"
  ).all();

  let sqlDump = `-- KSoM Payslip Portal Backup\n-- Generated: ${new Date().toISOString()}\n\nPRAGMA defer_foreign_keys=TRUE;\n\n`;

  for (const table of tables) {
    sqlDump += `DROP TABLE IF EXISTS ${table.name};\n`;
    sqlDump += `${table.sql};\n`;

    const { results } = await db.prepare(`SELECT * FROM ${table.name}`).all();
    for (const row of results) {
      const columns = Object.keys(row);
      const values = Object.values(row).map(val => {
        if (val === null) return 'NULL';
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        return val;
      });
      sqlDump += `INSERT INTO ${table.name} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
    }
    sqlDump += '\n';
  }

  return sqlDump;
}

export async function sendBackupEmail(env, toEmail, sql) {
  const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN } = env;

  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
    throw new Error("Gmail OAuth2 credentials are not configured.");
  }

  const accessToken = await getAccessToken(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN);

  const rawMessage = buildMimeMessage({
    from: "KSoM Office <office@ksom.res.in>",
    to: toEmail,
    subject: `KSoM Payslip Backup - ${new Date().toLocaleDateString()}`,
    text: `Please find attached the SQL backup for the KSoM Payslip Portal generated on ${new Date().toLocaleString()}.`,
    attachments: [
      {
        filename: `backup_${new Date().toISOString().split('T')[0]}.sql`,
        content: btoa(sql)
      }
    ]
  });

  const response = await fetch("https://www.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      raw: base64url(rawMessage)
    })
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || "Failed to send email via Gmail");
  }
  return result.id;
}

export async function checkAndRunScheduledBackup(env, waitUntil) {
  try {
    // 1. Fetch backup settings
    const settings = await env.ksom_payslip_db.prepare(
      "SELECT * FROM backup_settings WHERE id = 1"
    ).first();

    if (!settings || settings.is_enabled !== 1 || !settings.backup_email) {
      return;
    }

    // 2. Check frequency
    const now = new Date();
    let isDue = false;

    if (!settings.last_backup_at) {
      isDue = true;
    } else {
      const lastBackupDate = new Date(settings.last_backup_at);
      const diffMs = now.getTime() - lastBackupDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (settings.frequency === 'daily' && diffDays >= 1) {
        isDue = true;
      } else if (settings.frequency === 'weekly' && diffDays >= 7) {
        isDue = true;
      } else if (settings.frequency === 'monthly' && diffDays >= 30) {
        isDue = true;
      }
    }

    if (isDue) {
      const nowStr = now.toISOString();
      // Update last_backup_at immediately to prevent concurrent triggers in subsequent requests
      await env.ksom_payslip_db.prepare(
        "UPDATE backup_settings SET last_backup_at = ? WHERE id = 1"
      ).bind(nowStr).run();

      // Run email backup in the background using waitUntil so it doesn't block the request
      const task = async () => {
        try {
          const sql = await generateBackupSql(env.ksom_payslip_db);
          await sendBackupEmail(env, settings.backup_email, sql);
          console.log(`Scheduled backup email sent successfully to ${settings.backup_email}`);
        } catch (err) {
          console.error("Scheduled backup failed in background:", err);
          // Revert last_backup_at if it failed, so it will retry on next request
          await env.ksom_payslip_db.prepare(
            "UPDATE backup_settings SET last_backup_at = ? WHERE id = 1"
          ).bind(settings.last_backup_at).run();
        }
      };

      if (waitUntil) {
        waitUntil(task());
      } else {
        await task();
      }
    }
  } catch (err) {
    console.error("Failed checking/running scheduled backup:", err);
  }
}
