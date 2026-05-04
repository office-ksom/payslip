var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-iiAmGT/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/pages-idRvJB/functionsWorker-0.452523356357305.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var urls2 = /* @__PURE__ */ new Set();
function checkURL2(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls2.has(url.toString())) {
      urls2.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL2, "checkURL");
__name2(checkURL2, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL2(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});
async function onRequestGet(context) {
  try {
    const { results } = await context.env.ksom_payslip_db.prepare(
      "SELECT * FROM backup_settings WHERE id = 1"
    ).all();
    return new Response(JSON.stringify(results[0] || {}), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestGet, "onRequestGet");
__name2(onRequestGet, "onRequestGet");
async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { backup_email, frequency, is_enabled } = data;
    await context.env.ksom_payslip_db.prepare(
      `UPDATE backup_settings 
       SET backup_email = ?, frequency = ?, is_enabled = ?
       WHERE id = 1`
    ).bind(backup_email || null, frequency || "weekly", is_enabled ? 1 : 0).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost, "onRequestPost");
__name2(onRequestPost, "onRequestPost");
async function onRequestGet2(context) {
  try {
    const monthYear = context.params.month_year;
    const userRole = context.request.headers.get("X-User-Role");
    const userEmail = context.request.headers.get("X-User-Email");
    let query = `
      SELECT e.emp_id, e.name, e.designation, e.scale_of_pay, e.category, e.is_active, e.title, e.sort_order,
             d.epf, d.professional_tax, d.sli, d.gis, d.lic, d.income_tax, d.onam_advance, d.other_deductions,
             d.cpf, d.hra_recovery
      FROM employees e
      LEFT JOIN monthly_deductions d ON e.emp_id = d.emp_id AND d.month_year = ?
    `;
    let params = [monthYear];
    if (userRole === "viewer") {
      query += ` WHERE e.email_id = ?`;
      params.push(userEmail);
    }
    query += ` ORDER BY e.sort_order ASC, e.name ASC`;
    const { results } = await context.env.ksom_payslip_db.prepare(query).bind(...params).all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestGet2, "onRequestGet2");
__name2(onRequestGet2, "onRequestGet");
async function onRequestPost2(context) {
  const userRole = context.request.headers.get("X-User-Role");
  if (userRole === "viewer") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }
  try {
    const monthYear = context.params.month_year;
    const { records } = await context.request.json();
    const db = context.env.ksom_payslip_db;
    const statements = [];
    for (const record of records) {
      statements.push(
        db.prepare(`
          INSERT INTO monthly_deductions (emp_id, month_year, epf, professional_tax, sli, gis, lic, income_tax, onam_advance, other_deductions, cpf, hra_recovery)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(emp_id, month_year) DO UPDATE SET 
            epf=excluded.epf,
            professional_tax=excluded.professional_tax,
            sli=excluded.sli,
            gis=excluded.gis,
            lic=excluded.lic,
            income_tax=excluded.income_tax,
            onam_advance=excluded.onam_advance,
            other_deductions=excluded.other_deductions,
            cpf=excluded.cpf,
            hra_recovery=excluded.hra_recovery
        `).bind(
          record.emp_id,
          monthYear,
          record.epf || 0,
          record.professional_tax || 0,
          record.sli || 0,
          record.gis || 0,
          record.lic || 0,
          record.income_tax || 0,
          record.onam_advance || 0,
          record.other_deductions || 0,
          record.cpf || 0,
          record.hra_recovery || 0
        )
      );
    }
    if (statements.length > 0) {
      await db.batch(statements);
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost2, "onRequestPost2");
__name2(onRequestPost2, "onRequestPost");
async function onRequestGet3(context) {
  try {
    const monthYear = context.params.month_year;
    const userRole = context.request.headers.get("X-User-Role");
    const userEmail = context.request.headers.get("X-User-Email");
    let query = `
      SELECT e.emp_id, e.name, e.designation, e.scale_of_pay, e.category, e.is_active, e.date_of_joining, e.email_id, e.date_of_birth, e.epf_uan, e.title, e.sort_order,
             m.id as earnings_id, m.basic_pay, m.dp_gp, m.da_state, m.da_ugc, m.hra_state, m.hra_ugc, m.cca, m.other_earnings,
             m.spl_pay, m.tr_allow, m.spl_allow, m.fest_allow
      FROM employees e
      LEFT JOIN monthly_earnings m ON e.emp_id = m.emp_id AND m.month_year = ?
    `;
    let params = [monthYear];
    if (userRole === "viewer") {
      query += ` WHERE e.email_id = ?`;
      params.push(userEmail);
    }
    query += ` ORDER BY e.sort_order ASC, e.name ASC`;
    const { results } = await context.env.ksom_payslip_db.prepare(query).bind(...params).all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestGet3, "onRequestGet3");
__name2(onRequestGet3, "onRequestGet");
async function onRequestPost3(context) {
  const userRole = context.request.headers.get("X-User-Role");
  if (userRole === "viewer") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }
  try {
    const monthYear = context.params.month_year;
    const { records } = await context.request.json();
    const db = context.env.ksom_payslip_db;
    const statements = [];
    for (const record of records) {
      statements.push(
        db.prepare(`
          INSERT INTO monthly_earnings (emp_id, month_year, basic_pay, dp_gp, da_state, da_ugc, hra_state, hra_ugc, cca, other_earnings, spl_pay, tr_allow, spl_allow, fest_allow)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(emp_id, month_year) DO UPDATE SET 
            basic_pay=excluded.basic_pay,
            dp_gp=excluded.dp_gp,
            da_state=excluded.da_state,
            da_ugc=excluded.da_ugc,
            hra_state=excluded.hra_state,
            hra_ugc=excluded.hra_ugc,
            cca=excluded.cca,
            other_earnings=excluded.other_earnings,
            spl_pay=excluded.spl_pay,
            tr_allow=excluded.tr_allow,
            spl_allow=excluded.spl_allow,
            fest_allow=excluded.fest_allow
        `).bind(
          record.emp_id,
          monthYear,
          record.basic_pay || 0,
          record.dp_gp || 0,
          record.da_state || 0,
          record.da_ugc || 0,
          record.hra_state || 0,
          record.hra_ugc || 0,
          record.cca || 0,
          record.other_earnings || 0,
          record.spl_pay || 0,
          record.tr_allow || 0,
          record.spl_allow || 0,
          record.fest_allow || 0
        )
      );
    }
    if (statements.length > 0) {
      await db.batch(statements);
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost3, "onRequestPost3");
__name2(onRequestPost3, "onRequestPost");
async function onRequestGet4(context) {
  try {
    const db = context.env.ksom_payslip_db;
    const tables = ["employees", "allowances_settings", "monthly_earnings", "monthly_deductions"];
    let sqlDump = `-- KSoM Payslip Portal Backup
-- Generated: ${(/* @__PURE__ */ new Date()).toISOString()}

PRAGMA defer_foreign_keys=TRUE;

`;
    for (const table of tables) {
      sqlDump += `DROP TABLE IF EXISTS ${table};
`;
      if (table === "employees") {
        sqlDump += `CREATE TABLE employees (id INTEGER PRIMARY KEY AUTOINCREMENT, emp_id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, designation TEXT, date_of_birth TEXT, date_of_joining TEXT, scale_of_pay TEXT, category TEXT, title TEXT, sort_order INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1, email_id TEXT, mob_no TEXT, epf_uan TEXT);
`;
      } else if (table === "allowances_settings") {
        sqlDump += `CREATE TABLE allowances_settings (id INTEGER PRIMARY KEY AUTOINCREMENT, effective_from TEXT NOT NULL UNIQUE, da_state_percentage REAL DEFAULT 0, da_ugc_percentage REAL DEFAULT 0, hra_state_percentage REAL DEFAULT 0, hra_ugc_percentage REAL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
`;
      } else if (table === "monthly_earnings") {
        sqlDump += `CREATE TABLE monthly_earnings (id INTEGER PRIMARY KEY AUTOINCREMENT, emp_id TEXT NOT NULL, month_year TEXT NOT NULL, basic_pay REAL DEFAULT 0, dp_gp REAL DEFAULT 0, da_state REAL DEFAULT 0, da_ugc REAL DEFAULT 0, hra_state REAL DEFAULT 0, hra_ugc REAL DEFAULT 0, cca REAL DEFAULT 0, other_earnings REAL DEFAULT 0, spl_pay REAL DEFAULT 0, tr_allow REAL DEFAULT 0, spl_allow REAL DEFAULT 0, fest_allow REAL DEFAULT 0, FOREIGN KEY(emp_id) REFERENCES employees(emp_id), UNIQUE(emp_id, month_year));
`;
      } else if (table === "monthly_deductions") {
        sqlDump += `CREATE TABLE monthly_deductions (id INTEGER PRIMARY KEY AUTOINCREMENT, emp_id TEXT NOT NULL, month_year TEXT NOT NULL, epf REAL DEFAULT 0, professional_tax REAL DEFAULT 0, sli REAL DEFAULT 0, gis REAL DEFAULT 0, lic REAL DEFAULT 0, income_tax REAL DEFAULT 0, onam_advance REAL DEFAULT 0, other_deductions REAL DEFAULT 0, cpf REAL DEFAULT 0, hra_recovery REAL DEFAULT 0, FOREIGN KEY(emp_id) REFERENCES employees(emp_id), UNIQUE(emp_id, month_year));
`;
      }
      const { results } = await db.prepare(`SELECT * FROM ${table}`).all();
      for (const row of results) {
        const columns = Object.keys(row);
        const values = Object.values(row).map((val) => {
          if (val === null) return "NULL";
          if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
          return val;
        });
        sqlDump += `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")});
`;
      }
      sqlDump += "\n";
    }
    return new Response(sqlDump, {
      headers: {
        "Content-Type": "application/sql",
        "Content-Disposition": `attachment; filename="ksom_backup_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.sql"`
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestGet4, "onRequestGet4");
__name2(onRequestGet4, "onRequestGet");
async function onRequestPost4(context) {
  try {
    const db = context.env.ksom_payslip_db;
    const { sql } = await context.request.json();
    if (!sql || !sql.includes("INSERT INTO")) {
      return new Response(JSON.stringify({ error: "Invalid SQL dump provided." }), { status: 400 });
    }
    const statements = sql.split(";").map((s) => s.trim()).filter((s) => s.length > 0);
    const d1Statements = statements.map((s) => db.prepare(s));
    await db.batch(d1Statements);
    return new Response(JSON.stringify({ success: true, count: statements.length }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost4, "onRequestPost4");
__name2(onRequestPost4, "onRequestPost");
async function onRequestPost5(context) {
  const userRole = context.request.headers.get("X-User-Role");
  if (userRole === "viewer") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }
  try {
    const data = await context.request.json();
    const { to, subject, text, attachments } = data;
    const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN } = context.env;
    if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
      return new Response(JSON.stringify({
        error: "Gmail OAuth2 credentials (ID, Secret, or Refresh Token) are not configured."
      }), { status: 500 });
    }
    const accessToken = await getAccessToken(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN);
    const rawMessage = buildMimeMessage({
      from: "KSoM Office <office@ksom.res.in>",
      to,
      subject: subject || "Your Payslip",
      text: text || "Please find your payslip attached.",
      attachments: attachments || []
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
    if (response.ok) {
      return new Response(JSON.stringify({ success: true, id: result.id }), {
        headers: { "Content-Type": "application/json" },
        status: 200
      });
    } else {
      return new Response(JSON.stringify({ error: result.error?.message || "Failed to send email via Gmail" }), { status: response.status });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost5, "onRequestPost5");
__name2(onRequestPost5, "onRequestPost");
async function getAccessToken(clientId, clientSecret, refreshToken) {
  const url = "https://oauth2.googleapis.com/token";
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token"
  });
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Google OAuth error: ${data.error_description || data.error}`);
  }
  return data.access_token;
}
__name(getAccessToken, "getAccessToken");
__name2(getAccessToken, "getAccessToken");
function buildMimeMessage({ from, to, subject, text, attachments }) {
  const boundary = "boundary_" + Math.random().toString(36).substring(2);
  let message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    text,
    ""
  ];
  for (const attachment of attachments) {
    message.push(`--${boundary}`);
    message.push(`Content-Type: application/pdf; name="${attachment.filename}"`);
    message.push(`Content-Disposition: attachment; filename="${attachment.filename}"`);
    message.push("Content-Transfer-Encoding: base64");
    message.push("");
    message.push(attachment.content);
    message.push("");
  }
  message.push(`--${boundary}--`);
  return message.join("\r\n");
}
__name(buildMimeMessage, "buildMimeMessage");
__name2(buildMimeMessage, "buildMimeMessage");
function base64url(str) {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(base64url, "base64url");
__name2(base64url, "base64url");
async function onRequestGet5(context) {
  try {
    const userEmail = context.request.headers.get("X-User-Email");
    const userRole = context.request.headers.get("X-User-Role");
    let query = "SELECT * FROM employees ORDER BY sort_order ASC, name ASC";
    let params = [];
    if (userRole === "viewer" && userEmail) {
      query = "SELECT * FROM employees WHERE email_id = ? ORDER BY sort_order ASC, name ASC";
      params = [userEmail];
    }
    const { results } = await context.env.ksom_payslip_db.prepare(
      query
    ).bind(...params).all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestGet5, "onRequestGet5");
__name2(onRequestGet5, "onRequestGet");
async function onRequestPost6(context) {
  try {
    const data = await context.request.json();
    const { emp_id, name, designation, date_of_birth, date_of_joining, scale_of_pay, category, email_id, mob_no, is_active, epf_uan, title, sort_order } = data;
    const activeVal = typeof is_active !== "undefined" ? Number(is_active) : 1;
    const sOrder = typeof sort_order !== "undefined" ? Number(sort_order) : 0;
    await context.env.ksom_payslip_db.prepare(
      `INSERT INTO employees (emp_id, name, designation, date_of_birth, date_of_joining, scale_of_pay, category, email_id, mob_no, is_active, epf_uan, title, sort_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(emp_id, name, designation, date_of_birth, date_of_joining, scale_of_pay, category, email_id || null, mob_no || null, activeVal, epf_uan || null, title || null, sOrder).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 201
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost6, "onRequestPost6");
__name2(onRequestPost6, "onRequestPost");
async function onRequestPut(context) {
  try {
    const data = await context.request.json();
    const { emp_id, name, designation, date_of_birth, date_of_joining, scale_of_pay, category, email_id, mob_no, is_active, epf_uan, title, sort_order } = data;
    const activeVal = typeof is_active !== "undefined" ? Number(is_active) : 1;
    const sOrder = typeof sort_order !== "undefined" ? Number(sort_order) : 0;
    await context.env.ksom_payslip_db.prepare(
      `UPDATE employees 
       SET name = ?, designation = ?, date_of_birth = ?, date_of_joining = ?, 
           scale_of_pay = ?, category = ?, email_id = ?, mob_no = ?, is_active = ?, epf_uan = ?, title = ?, sort_order = ?
       WHERE emp_id = ?`
    ).bind(name, designation, date_of_birth, date_of_joining, scale_of_pay, category, email_id || null, mob_no || null, activeVal, epf_uan || null, title || null, sOrder, emp_id).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPut, "onRequestPut");
__name2(onRequestPut, "onRequestPut");
async function onRequestGet6(context) {
  const userRole = context.request.headers.get("X-User-Role");
  if (userRole === "viewer") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }
  try {
    const { results } = await context.env.ksom_payslip_db.prepare(
      "SELECT * FROM allowances_settings ORDER BY effective_from DESC"
    ).all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestGet6, "onRequestGet6");
__name2(onRequestGet6, "onRequestGet");
async function onRequestPost7(context) {
  const userRole = context.request.headers.get("X-User-Role");
  if (userRole === "viewer") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }
  try {
    const data = await context.request.json();
    const { effective_from, da_state_percentage, da_ugc_percentage, hra_state_percentage, hra_ugc_percentage } = data;
    await context.env.ksom_payslip_db.prepare(
      `INSERT INTO allowances_settings (effective_from, da_state_percentage, da_ugc_percentage, hra_state_percentage, hra_ugc_percentage) 
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(effective_from) DO UPDATE SET 
        da_state_percentage=excluded.da_state_percentage,
        da_ugc_percentage=excluded.da_ugc_percentage,
        hra_state_percentage=excluded.hra_state_percentage,
        hra_ugc_percentage=excluded.hra_ugc_percentage`
    ).bind(effective_from, da_state_percentage || 0, da_ugc_percentage || 0, hra_state_percentage || 0, hra_ugc_percentage || 0).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 201
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost7, "onRequestPost7");
__name2(onRequestPost7, "onRequestPost");
async function onRequestGet7(context) {
  try {
    const { results } = await context.env.ksom_payslip_db.prepare(
      "SELECT * FROM users ORDER BY created_at DESC"
    ).all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestGet7, "onRequestGet7");
__name2(onRequestGet7, "onRequestGet");
async function onRequestPost8(context) {
  try {
    const data = await context.request.json();
    const { email, role, status } = data;
    if (!email || !role) {
      return new Response(JSON.stringify({ error: "Email and role are required." }), { status: 400 });
    }
    await context.env.ksom_payslip_db.prepare(
      `INSERT INTO users (email, role, status) VALUES (?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET role=excluded.role, status=excluded.status`
    ).bind(email.toLowerCase(), role, status || "active").run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost8, "onRequestPost8");
__name2(onRequestPost8, "onRequestPost");
async function onRequestDelete(context) {
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get("id");
    if (!id) return new Response(JSON.stringify({ error: "ID required." }), { status: 400 });
    await context.env.ksom_payslip_db.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestDelete, "onRequestDelete");
__name2(onRequestDelete, "onRequestDelete");
async function onRequest(context) {
  const { request, env, next, data } = context;
  const url = new URL(request.url);
  let email = request.headers.get("Cf-Access-Authenticated-User-Email");
  if (!email && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
    const cookieHeader = request.headers.get("Cookie") || "";
    const cookies = Object.fromEntries(cookieHeader.split(";").map((c) => c.trim().split("=")));
    email = cookies["mock_email"] || url.searchParams.get("mock_user");
  }
  if (!email) {
    const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (!isLocal) {
      const isStaticAsset = url.pathname.includes(".") && !url.pathname.startsWith("/api/");
      if (!isStaticAsset) {
        return new Response(null, {
          status: 302,
          headers: { "Location": "/cdn-cgi/access/login" }
        });
      }
    } else {
      if (url.pathname.startsWith("/api/")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    return next();
  }
  if (url.pathname === "/api/logout" && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
    return new Response(null, {
      status: 302,
      headers: {
        "Location": "/",
        "Set-Cookie": "mock_email=; Path=/; Max-Age=0"
      }
    });
  }
  if (!url.pathname.startsWith("/api/")) {
    return next();
  }
  const { results } = await env.ksom_payslip_db.prepare(
    "SELECT id, email, role FROM users WHERE email = ? AND status = 'active'"
  ).bind(email.toLowerCase()).all();
  const user = results[0];
  if (!user) {
    return new Response(JSON.stringify({ error: `Access Denied: ${email} is not authorized.` }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }
  data.user = user;
  const path = url.pathname;
  const method = request.method;
  if (path.startsWith("/api/users") && user.role !== "super_admin") {
    return forbiddenResponse();
  }
  if (path.startsWith("/api/backup") && user.role !== "super_admin" && user.role !== "admin") {
    return forbiddenResponse();
  }
  if (path.startsWith("/api/settings") && user.role === "viewer") {
    return forbiddenResponse();
  }
  if (method !== "GET" && user.role === "viewer") {
    return forbiddenResponse();
  }
  if (path === "/api/me") {
    return new Response(JSON.stringify(user), {
      headers: { "Content-Type": "application/json" }
    });
  }
  const modifiedRequest = new Request(request, {
    headers: {
      ...Object.fromEntries(request.headers),
      "X-User-Email": email,
      "X-User-Role": user.role
    }
  });
  return next(modifiedRequest);
}
__name(onRequest, "onRequest");
__name2(onRequest, "onRequest");
function forbiddenResponse() {
  return new Response(JSON.stringify({ error: "Forbidden" }), {
    status: 403,
    headers: { "Content-Type": "application/json" }
  });
}
__name(forbiddenResponse, "forbiddenResponse");
__name2(forbiddenResponse, "forbiddenResponse");
var routes = [
  {
    routePath: "/api/settings/backup",
    mountPath: "/api/settings",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/settings/backup",
    mountPath: "/api/settings",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/deductions/:month_year",
    mountPath: "/api/deductions",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/deductions/:month_year",
    mountPath: "/api/deductions",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/earnings/:month_year",
    mountPath: "/api/earnings",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/earnings/:month_year",
    mountPath: "/api/earnings",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/backup",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/backup",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/email",
    mountPath: "/api/email",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  },
  {
    routePath: "/api/employees",
    mountPath: "/api/employees",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet5]
  },
  {
    routePath: "/api/employees",
    mountPath: "/api/employees",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost6]
  },
  {
    routePath: "/api/employees",
    mountPath: "/api/employees",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut]
  },
  {
    routePath: "/api/settings",
    mountPath: "/api/settings",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet6]
  },
  {
    routePath: "/api/settings",
    mountPath: "/api/settings",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost7]
  },
  {
    routePath: "/api/users",
    mountPath: "/api/users",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete]
  },
  {
    routePath: "/api/users",
    mountPath: "/api/users",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet7]
  },
  {
    routePath: "/api/users",
    mountPath: "/api/users",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost8]
  },
  {
    routePath: "/",
    mountPath: "/",
    method: "",
    middlewares: [onRequest],
    modules: []
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// C:/Users/DELL/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// C:/Users/DELL/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-iiAmGT/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// C:/Users/DELL/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-iiAmGT/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.452523356357305.js.map
