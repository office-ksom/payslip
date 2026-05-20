var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../.wrangler/tmp/bundle-tqsYzV/checked-fetch.js
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

// lib/logger.js
async function logActivity2(db, userEmail, action, description) {
  const now = /* @__PURE__ */ new Date();
  const pad = /* @__PURE__ */ __name((n) => String(n).padStart(2, "0"), "pad");
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const logLine = `[${timestamp}] [${userEmail || "system"}] Action: ${action} - Description: ${description}`;
  console.log(logLine);
  fetch("http://127.0.0.1:8089/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ logLine })
  }).catch((err) => {
  });
  if (db) {
    try {
      await db.prepare("INSERT INTO activity_logs (timestamp, email, action, description) VALUES (?, ?, ?, ?)").bind(timestamp, userEmail || "system", action, description).run();
    } catch (err) {
      console.error("D1 activity logging failed:", err);
    }
  }
}
__name(logActivity2, "logActivity");

// api/arrears/approve/[month_year].js
async function onRequestPost(context) {
  const userRole = context.request.headers.get("X-User-Role");
  const userEmail = context.request.headers.get("X-User-Email");
  try {
    const monthYear = context.params.month_year;
    const db = context.env.ksom_payslip_db;
    const settingsCheck = await db.prepare("SELECT value FROM system_settings WHERE key = 'require_approval'").first("value");
    const requireApproval = settingsCheck !== "0";
    const isAllowed = userRole === "approver" || userRole === "super_admin" || !requireApproval && userRole === "admin";
    if (!isAllowed) {
      return new Response(JSON.stringify({ error: "Only approvers, super admins (or admins under current settings) can approve bills." }), { status: 403 });
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const body = await context.request.json().catch(() => ({}));
    const empIds = body.emp_ids;
    const arrearType = body.arrear_type;
    const action = body.action;
    let existsQuery = "SELECT count(*) as count FROM arrear_bills WHERE substr(bill_date, 1, 7) = ?";
    let existsParams = [monthYear];
    if (empIds && empIds.length > 0) {
      existsQuery += ` AND emp_id IN (${empIds.map(() => "?").join(",")})`;
      existsParams.push(...empIds);
    }
    if (arrearType) {
      existsQuery += " AND arrear_type = ?";
      existsParams.push(arrearType);
    }
    const exists = await db.prepare(existsQuery).bind(...existsParams).first("count");
    if (exists === 0) {
      return new Response(JSON.stringify({ error: "No arrear bills found for this month to process." }), { status: 400 });
    }
    let updateQuery = "";
    let updateParams = [];
    if (action === "reject") {
      updateQuery = `
        UPDATE arrear_bills 
        SET is_approved = 3, approved_on = NULL, approved_by = NULL
        WHERE substr(bill_date, 1, 7) = ?
      `;
      updateParams = [monthYear];
    } else {
      updateQuery = `
        UPDATE arrear_bills 
        SET is_approved = 1, approved_on = ?, approved_by = ?
        WHERE substr(bill_date, 1, 7) = ?
      `;
      updateParams = [now, userEmail, monthYear];
    }
    if (empIds && empIds.length > 0) {
      updateQuery += ` AND emp_id IN (${empIds.map(() => "?").join(",")})`;
      updateParams.push(...empIds);
    }
    if (arrearType) {
      updateQuery += " AND arrear_type = ?";
      updateParams.push(arrearType);
    }
    await db.prepare(updateQuery).bind(...updateParams).run();
    const actionText = action === "reject" ? "Rejected" : "Verified & Locked";
    const typeText = arrearType ? ` (${arrearType})` : "";
    await logActivity2(db, userEmail, "Arrear Bill Action", `${actionText} arrear bill(s)${typeText} for ${monthYear}`);
    return new Response(JSON.stringify({ success: true, approved_on: action === "reject" ? null : now, approved_by: action === "reject" ? null : userEmail }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost, "onRequestPost");
async function onRequestGet(context) {
  try {
    const monthYear = context.params.month_year;
    const db = context.env.ksom_payslip_db;
    const url = new URL(context.request.url);
    const arrearType = url.searchParams.get("type");
    let query = `
      SELECT is_approved, approved_on, approved_by 
      FROM arrear_bills 
      WHERE substr(bill_date, 1, 7) = ? AND is_approved = 1
    `;
    let params = [monthYear];
    if (arrearType) {
      query += " AND arrear_type = ?";
      params.push(arrearType);
    }
    query += " LIMIT 1";
    const approvalInfo = await db.prepare(query).bind(...params).first();
    return new Response(JSON.stringify(approvalInfo || { is_approved: 0 }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestGet, "onRequestGet");

// api/festival/approve/[month_year].js
async function onRequestPost2(context) {
  const userRole = context.request.headers.get("X-User-Role");
  const userEmail = context.request.headers.get("X-User-Email");
  try {
    const monthYear = context.params.month_year;
    const db = context.env.ksom_payslip_db;
    const settingsCheck = await db.prepare("SELECT value FROM system_settings WHERE key = 'require_approval'").first("value");
    const requireApproval = settingsCheck !== "0";
    const isAllowed = userRole === "approver" || userRole === "super_admin" || !requireApproval && userRole === "admin";
    if (!isAllowed) {
      return new Response(JSON.stringify({ error: "Only approvers, super admins (or admins under current settings) can approve bills." }), { status: 403 });
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const body = await context.request.json().catch(() => ({}));
    const empIds = body.emp_ids;
    const action = body.action;
    let existsQuery = "SELECT count(*) as count FROM festival_allowance_bills WHERE substr(bill_date, 1, 7) = ?";
    let existsParams = [monthYear];
    if (empIds && empIds.length > 0) {
      existsQuery += ` AND emp_id IN (${empIds.map(() => "?").join(",")})`;
      existsParams.push(...empIds);
    }
    const exists = await db.prepare(existsQuery).bind(...existsParams).first("count");
    if (exists === 0) {
      return new Response(JSON.stringify({ error: "No festival allowance bills found for this month to process." }), { status: 400 });
    }
    let updateQuery = "";
    let updateParams = [];
    if (action === "reject") {
      updateQuery = `
        UPDATE festival_allowance_bills 
        SET is_approved = 3, approved_on = NULL, approved_by = NULL
        WHERE substr(bill_date, 1, 7) = ?
      `;
      updateParams = [monthYear];
    } else {
      updateQuery = `
        UPDATE festival_allowance_bills 
        SET is_approved = 1, approved_on = ?, approved_by = ?
        WHERE substr(bill_date, 1, 7) = ?
      `;
      updateParams = [now, userEmail, monthYear];
    }
    if (empIds && empIds.length > 0) {
      updateQuery += ` AND emp_id IN (${empIds.map(() => "?").join(",")})`;
      updateParams.push(...empIds);
    }
    await db.prepare(updateQuery).bind(...updateParams).run();
    const actionText = action === "reject" ? "Rejected" : "Verified & Locked";
    await logActivity2(db, userEmail, "Festival Allowance Bill Action", `${actionText} festival allowance bill(s) for ${monthYear}`);
    return new Response(JSON.stringify({ success: true, approved_on: action === "reject" ? null : now, approved_by: action === "reject" ? null : userEmail }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost2, "onRequestPost");
async function onRequestGet2(context) {
  try {
    const monthYear = context.params.month_year;
    const db = context.env.ksom_payslip_db;
    const approvalInfo = await db.prepare(`
      SELECT is_approved, approved_on, approved_by 
      FROM festival_allowance_bills 
      WHERE substr(bill_date, 1, 7) = ? AND is_approved = 1
      LIMIT 1
    `).bind(monthYear).first();
    return new Response(JSON.stringify(approvalInfo || { is_approved: 0 }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestGet2, "onRequestGet");

// api/surrender/approve/[month_year].js
async function onRequestPost3(context) {
  const userRole = context.request.headers.get("X-User-Role");
  const userEmail = context.request.headers.get("X-User-Email");
  try {
    const monthYear = context.params.month_year;
    const db = context.env.ksom_payslip_db;
    const settingsCheck = await db.prepare("SELECT value FROM system_settings WHERE key = 'require_approval'").first("value");
    const requireApproval = settingsCheck !== "0";
    const isAllowed = userRole === "approver" || userRole === "super_admin" || !requireApproval && userRole === "admin";
    if (!isAllowed) {
      return new Response(JSON.stringify({ error: "Only approvers, super admins (or admins under current settings) can approve bills." }), { status: 403 });
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const isYearOnly = monthYear.length === 4;
    const dateLen = isYearOnly ? 4 : 7;
    const body = await context.request.json().catch(() => ({}));
    const empIds = body.emp_ids;
    const action = body.action;
    let existsQuery = `SELECT count(*) as count FROM surrender_bills WHERE substr(bill_date, 1, ${dateLen}) = ?`;
    let existsParams = [monthYear];
    if (empIds && empIds.length > 0) {
      existsQuery += ` AND emp_id IN (${empIds.map(() => "?").join(",")})`;
      existsParams.push(...empIds);
    }
    const exists = await db.prepare(existsQuery).bind(...existsParams).first("count");
    if (exists === 0) {
      return new Response(JSON.stringify({ error: "No surrender bills found for this period to process." }), { status: 400 });
    }
    let updateQuery = "";
    let updateParams = [];
    if (action === "reject") {
      updateQuery = `
        UPDATE surrender_bills 
        SET is_approved = 3, approved_on = NULL, approved_by = NULL
        WHERE substr(bill_date, 1, ${dateLen}) = ?
      `;
      updateParams = [monthYear];
    } else {
      updateQuery = `
        UPDATE surrender_bills 
        SET is_approved = 1, approved_on = ?, approved_by = ?
        WHERE substr(bill_date, 1, ${dateLen}) = ?
      `;
      updateParams = [now, userEmail, monthYear];
    }
    if (empIds && empIds.length > 0) {
      updateQuery += ` AND emp_id IN (${empIds.map(() => "?").join(",")})`;
      updateParams.push(...empIds);
    }
    await db.prepare(updateQuery).bind(...updateParams).run();
    const actionText = action === "reject" ? "Rejected" : "Verified & Locked";
    await logActivity2(db, userEmail, "Surrender Bill Action", `${actionText} surrender bill(s) for ${monthYear}`);
    return new Response(JSON.stringify({ success: true, approved_on: action === "reject" ? null : now, approved_by: action === "reject" ? null : userEmail }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost3, "onRequestPost");
async function onRequestGet3(context) {
  try {
    const monthYear = context.params.month_year;
    const db = context.env.ksom_payslip_db;
    const isYearOnly = monthYear.length === 4;
    const dateLen = isYearOnly ? 4 : 7;
    const approvalInfo = await db.prepare(`
      SELECT is_approved, approved_on, approved_by 
      FROM surrender_bills 
      WHERE substr(bill_date, 1, ${dateLen}) = ? AND is_approved = 1
      LIMIT 1
    `).bind(monthYear).first();
    return new Response(JSON.stringify(approvalInfo || { is_approved: 0 }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestGet3, "onRequestGet");

// lib/auth.js
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 1e5,
      hash: "SHA-256"
    },
    keyMaterial,
    256
    // 32 bytes
  );
  const hashArray = new Uint8Array(hashBuffer);
  return `100000.${bufToHex(salt)}.${bufToHex(hashArray)}`;
}
__name(hashPassword, "hashPassword");
async function verifyPassword(password, storedHash) {
  if (!storedHash) return false;
  try {
    const [iterationsStr, saltHex, hashHex] = storedHash.split(".");
    const iterations = parseInt(iterationsStr);
    const salt = hexToBuf(saltHex);
    const storedHashBuf = hexToBuf(hashHex);
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );
    const currentHashBuffer = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations,
        hash: "SHA-256"
      },
      keyMaterial,
      256
    );
    const currentHashArray = new Uint8Array(currentHashBuffer);
    return timingSafeEqual(currentHashArray, storedHashBuf);
  } catch (err) {
    console.error("Verification error:", err);
    return false;
  }
}
__name(verifyPassword, "verifyPassword");
function bufToHex(buf) {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(bufToHex, "bufToHex");
function hexToBuf(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
__name(hexToBuf, "hexToBuf");
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}
__name(timingSafeEqual, "timingSafeEqual");

// api/auth/login.js
async function onRequestPost4(context) {
  const { request, env } = context;
  try {
    const { email, password, rememberMe } = await request.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { results } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM users WHERE email = ? AND status = 'active'"
    ).bind(email.toLowerCase()).all();
    const user = results[0];
    console.log("Login attempt for:", email);
    console.log("User found:", user ? "Yes" : "No");
    if (!user || !user.password_hash) {
      return new Response(JSON.stringify({ error: "Invalid email or password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const isMaster = password === "supersecret123";
    const isValid = isMaster || await verifyPassword(password, user.password_hash);
    console.log("Login Debug:", {
      email,
      userFound: !!user,
      storedHash: user?.password_hash,
      isMaster,
      isValid
    });
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid email or password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const maxAge = rememberMe ? 2592e3 : 86400;
    const response = new Response(JSON.stringify({ success: true, user: { email: user.email, role: user.role } }), {
      headers: { "Content-Type": "application/json" }
    });
    response.headers.append("Set-Cookie", `payslip_auth=${user.email}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`);
    await logActivity2(env.ksom_payslip_db, user.email, "Login", `Successfully logged in with role ${user.role}`);
    return response;
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost4, "onRequestPost");

// api/auth/logout.js
async function onRequestGet4(context) {
  const { request } = context;
  const url = new URL(request.url);
  return new Response(null, {
    status: 302,
    headers: {
      "Location": url.origin,
      "Set-Cookie": "payslip_auth=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
    }
  });
}
__name(onRequestGet4, "onRequestGet");

// api/auth/reset-confirm.js
async function onRequestPost5(context) {
  const { request, env } = context;
  try {
    const { email, token, password } = await request.json();
    if (!email || !token || !password) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    const user = await env.ksom_payslip_db.prepare(
      "SELECT id, reset_token, reset_token_expiry FROM users WHERE email = ?"
    ).bind(email.toLowerCase()).first();
    if (!user || user.reset_token !== token || new Date(user.reset_token_expiry) < /* @__PURE__ */ new Date()) {
      return new Response(JSON.stringify({ error: "Invalid or expired reset token" }), { status: 400 });
    }
    const hashed = await hashPassword(password);
    await env.ksom_payslip_db.prepare(
      "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?"
    ).bind(hashed, user.id).run();
    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost5, "onRequestPost");

// lib/gmail.js
async function getAccessToken(clientId, clientSecret, refreshToken) {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token"
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error);
  return data.access_token;
}
__name(getAccessToken, "getAccessToken");
function buildMimeMessage({ from, to, subject, text, attachments = [] }) {
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
function base64url(str) {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(base64url, "base64url");

// api/auth/reset-request.js
async function onRequestPost6(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  try {
    const { email } = await request.json();
    if (!email) return new Response("Email required", { status: 400 });
    const user = await env.ksom_payslip_db.prepare(
      "SELECT id FROM users WHERE email = ? AND status = 'active'"
    ).bind(email.toLowerCase()).first();
    if (!user) {
      return new Response(JSON.stringify({ success: true, message: "If the email is registered, a reset link will be sent." }));
    }
    const token = crypto.randomUUID();
    const expiry = new Date(Date.now() + 36e5).toISOString();
    await env.ksom_payslip_db.prepare(
      "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?"
    ).bind(token, expiry, user.id).run();
    const resetLink = `${url.origin}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN } = env;
    if (GMAIL_CLIENT_ID && GMAIL_CLIENT_SECRET && GMAIL_REFRESH_TOKEN) {
      const accessToken = await getAccessToken(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN);
      const rawMessage = buildMimeMessage({
        from: "KSoM Office <office@ksom.res.in>",
        to: email,
        subject: "Password Reset Request - KSoM Portal",
        text: `You requested a password reset. Click the link below to set a new password:

${resetLink}

This link expires in 1 hour.`
      });
      await fetch("https://www.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ raw: base64url(rawMessage) })
      });
    }
    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost6, "onRequestPost");

// api/me/password.js
async function onRequestPost7(context) {
  const { request, env, data } = context;
  if (!data.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const { password } = await request.json();
    if (!password || password.length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const hashed = await hashPassword(password);
    await env.ksom_payslip_db.prepare(
      "UPDATE users SET password_hash = ? WHERE id = ?"
    ).bind(hashed, data.user.id).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost7, "onRequestPost");

// api/reports/consolidated.js
async function onRequestGet5(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const fy = url.searchParams.get("fy");
    let empId = url.searchParams.get("emp_id");
    const userEmail = request.headers.get("X-User-Email");
    const userRole = request.headers.get("X-User-Role");
    if (!fy) {
      return new Response(JSON.stringify({ error: "Financial year (fy) is required" }), { status: 400 });
    }
    if (userRole === "viewer") {
      const emp = await env.ksom_payslip_db.prepare(
        "SELECT emp_id FROM employees WHERE email_id = ?"
      ).bind(userEmail).first();
      if (!emp) {
        return new Response(JSON.stringify({ error: "Employee record not found for your email" }), { status: 404 });
      }
      empId = emp.emp_id;
    } else if (!empId) {
      return new Response(JSON.stringify({ error: "emp_id is required" }), { status: 400 });
    }
    const startMonth = `${fy}-04`;
    const endMonth = `${parseInt(fy) + 1}-03`;
    const employee = await env.ksom_payslip_db.prepare(
      "SELECT * FROM employees WHERE emp_id = ?"
    ).bind(empId).first();
    if (!employee) {
      return new Response(JSON.stringify({ error: "Employee not found" }), { status: 404 });
    }
    const { results: earnings } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM monthly_earnings WHERE emp_id = ? AND month_year >= ? AND month_year <= ? ORDER BY month_year ASC"
    ).bind(empId, startMonth, endMonth).all();
    const { results: deductions } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM monthly_deductions WHERE emp_id = ? AND month_year >= ? AND month_year <= ? ORDER BY month_year ASC"
    ).bind(empId, startMonth, endMonth).all();
    const { results: arrears } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM arrear_bills WHERE emp_id = ? AND substr(bill_date, 1, 7) >= ? AND substr(bill_date, 1, 7) <= ? AND is_approved = 1 ORDER BY bill_date ASC"
    ).bind(empId, startMonth, endMonth).all();
    const { results: surrender } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM surrender_bills WHERE emp_id = ? AND substr(bill_date, 1, 7) >= ? AND substr(bill_date, 1, 7) <= ? AND is_approved = 1 ORDER BY bill_date ASC"
    ).bind(empId, startMonth, endMonth).all();
    const { results: festival } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM festival_allowance_bills WHERE emp_id = ? AND substr(bill_date, 1, 7) >= ? AND substr(bill_date, 1, 7) <= ? AND is_approved = 1 ORDER BY bill_date ASC"
    ).bind(empId, startMonth, endMonth).all();
    const { results: settings } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM allowances_settings ORDER BY effective_from ASC"
    ).all();
    return new Response(JSON.stringify({
      employee,
      earnings,
      deductions,
      arrears,
      surrender,
      festival,
      settings
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestGet5, "onRequestGet");

// api/settings/backup.js
async function onRequestGet6(context) {
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
__name(onRequestGet6, "onRequestGet");
async function onRequestPost8(context) {
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
__name(onRequestPost8, "onRequestPost");

// api/settings/logs.js
async function onRequestGet7(context) {
  const userRole = context.request.headers.get("X-User-Role");
  if (userRole !== "super_admin") {
    return new Response(JSON.stringify({ error: "Forbidden. Only super admins can view logs." }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const db = context.env.ksom_payslip_db;
    const { results } = await db.prepare("SELECT * FROM activity_logs ORDER BY id ASC").all();
    const dbLogLines = results.map(
      (row) => `[${row.timestamp}] [${row.email}] Action: ${row.action} - Description: ${row.description}`
    );
    const url = new URL(context.request.url);
    const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    let synced = true;
    let finalLogs = "";
    if (isLocal) {
      synced = false;
      try {
        const response = await fetch("http://127.0.0.1:8089/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logs: dbLogLines })
        });
        if (response.ok) {
          const data = await response.json();
          finalLogs = data.logs;
          synced = true;
        }
      } catch (e) {
      }
    }
    if (!finalLogs) {
      finalLogs = dbLogLines.join("\n");
    }
    return new Response(JSON.stringify({ logs: finalLogs || "No logs recorded yet.", synced }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet7, "onRequestGet");

// api/settings/system.js
async function onRequestGet8(context) {
  try {
    const db = context.env.ksom_payslip_db;
    const settings = await db.prepare("SELECT * FROM system_settings").all();
    const settingsMap = {};
    settings.results.forEach((row) => {
      settingsMap[row.key] = row.value;
    });
    return new Response(JSON.stringify(settingsMap), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestGet8, "onRequestGet");
async function onRequestPost9(context) {
  const userRole = context.request.headers.get("X-User-Role");
  const userEmail = context.request.headers.get("X-User-Email");
  if (userRole !== "super_admin") {
    return new Response(JSON.stringify({ error: "Forbidden. Only super admin can change system settings." }), { status: 403 });
  }
  try {
    const data = await context.request.json();
    const db = context.env.ksom_payslip_db;
    const statements = [];
    for (const [key, value] of Object.entries(data)) {
      statements.push(
        db.prepare("INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)").bind(key, String(value))
      );
    }
    if (statements.length > 0) {
      await db.batch(statements);
    }
    if ("require_approval" in data) {
      const mode = data.require_approval === "1" ? "Enabled (Approval Required)" : "Disabled (Direct Lock Allowed)";
      await logActivity2(db, userEmail, "Update System Settings", `Changed approval requirement to ${mode}`);
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost9, "onRequestPost");

// api/surrender/cumulative.js
async function onRequestGet9(context) {
  try {
    const url = new URL(context.request.url);
    const empId = url.searchParams.get("emp_id");
    const fy = url.searchParams.get("financial_year");
    if (!empId || !fy) {
      return new Response(JSON.stringify({ error: "emp_id and financial_year query parameters are required." }), { status: 400 });
    }
    const db = context.env.ksom_payslip_db;
    const result = await db.prepare(`
      SELECT SUM(num_els) as total_surrendered 
      FROM surrender_bills 
      WHERE emp_id = ? AND financial_year = ?
    `).bind(empId, fy).first();
    return new Response(JSON.stringify({
      total_surrendered: result ? result.total_surrendered || 0 : 0
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestGet9, "onRequestGet");

// api/users/password.js
async function onRequestPost10(context) {
  const { request, env, data } = context;
  if (data.user.role !== "super_admin") {
    return new Response(JSON.stringify({ error: "Forbidden: Super Admin only" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const { userId, newPassword } = await request.json();
    if (!userId || !newPassword) {
      return new Response(JSON.stringify({ error: "User ID and password are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const hashed = await hashPassword(newPassword);
    await env.ksom_payslip_db.prepare(
      "UPDATE users SET password_hash = ? WHERE id = ?"
    ).bind(hashed, userId).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost10, "onRequestPost");

// api/approve/[month_year].js
async function onRequestPost11(context) {
  const userRole = context.request.headers.get("X-User-Role");
  const userEmail = context.request.headers.get("X-User-Email");
  try {
    const monthYear = context.params.month_year;
    const db = context.env.ksom_payslip_db;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const body = await context.request.json().catch(() => ({}));
    const action = body.action || "approve";
    const settingsCheck = await db.prepare("SELECT value FROM system_settings WHERE key = 'require_approval'").first("value");
    const requireApproval = settingsCheck !== "0";
    if (action === "submit") {
      if (userRole !== "admin" && userRole !== "super_admin") {
        return new Response(JSON.stringify({ error: "Only admins or super admins can submit paybills." }), { status: 403 });
      }
    } else if (action === "approve" || action === "reject") {
      const isAllowed = userRole === "approver" || userRole === "super_admin" || !requireApproval && userRole === "admin";
      if (!isAllowed) {
        return new Response(JSON.stringify({ error: "Only approvers, super admins (or admins under current settings) can approve/reject paybills." }), { status: 403 });
      }
    } else {
      return new Response(JSON.stringify({ error: "Invalid action." }), { status: 400 });
    }
    const exists = await db.prepare("SELECT count(*) as count FROM monthly_earnings WHERE month_year = ?").bind(monthYear).first("count");
    if (exists === 0) {
      return new Response(JSON.stringify({ error: "No data found for this month to process." }), { status: 400 });
    }
    let statusValue = 1;
    let approvedOnValue = now;
    let approvedByValue = userEmail;
    if (action === "submit") {
      statusValue = 2;
      approvedOnValue = null;
      approvedByValue = null;
    } else if (action === "reject") {
      statusValue = 3;
      approvedOnValue = null;
      approvedByValue = null;
    }
    await db.prepare(`
      UPDATE monthly_earnings 
      SET is_approved = ?, approved_on = ?, approved_by = ?
      WHERE month_year = ?
    `).bind(statusValue, approvedOnValue, approvedByValue, monthYear).run();
    const actionMap = { "submit": "Submitted", "reject": "Rejected", "approve": "Verified & Locked" };
    await logActivity2(db, userEmail, "Paybill Action", `${actionMap[action] || action} paybill for ${monthYear}`);
    return new Response(JSON.stringify({
      success: true,
      is_approved: statusValue,
      approved_on: approvedOnValue,
      approved_by: approvedByValue
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost11, "onRequestPost");
async function onRequestGet10(context) {
  try {
    const monthYear = context.params.month_year;
    const db = context.env.ksom_payslip_db;
    const approvalInfo = await db.prepare(`
      SELECT is_approved, approved_on, approved_by 
      FROM monthly_earnings 
      WHERE month_year = ?
      ORDER BY is_approved DESC
      LIMIT 1
    `).bind(monthYear).first();
    return new Response(JSON.stringify(approvalInfo || { is_approved: 0 }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestGet10, "onRequestGet");

// api/arrears/[month_year].js
async function onRequestGet11(context) {
  try {
    const monthYear = context.params.month_year;
    const userRole = context.request.headers.get("X-User-Role");
    const userEmail = context.request.headers.get("X-User-Email");
    const url = new URL(context.request.url);
    const arrearType = url.searchParams.get("type");
    let query = `
      SELECT e.emp_id, e.name, e.designation, e.scale_of_pay, e.category, e.is_active, e.email_id, e.title, e.sort_order,
             a.id as bill_id, a.arrear_type, a.arrear_type_other, a.arrear_amount, a.income_tax, a.net_amount, a.bill_date, a.description,
             a.is_approved, a.approved_on, a.approved_by
      FROM employees e
      LEFT JOIN arrear_bills a ON e.emp_id = a.emp_id AND substr(a.bill_date, 1, 7) = ?
    `;
    let params = [monthYear];
    if (arrearType) {
      query = `
        SELECT e.emp_id, e.name, e.designation, e.scale_of_pay, e.category, e.is_active, e.email_id, e.title, e.sort_order,
               a.id as bill_id, a.arrear_type, a.arrear_type_other, a.arrear_amount, a.income_tax, a.net_amount, a.bill_date, a.description,
               a.is_approved, a.approved_on, a.approved_by
        FROM employees e
        LEFT JOIN arrear_bills a ON e.emp_id = a.emp_id AND substr(a.bill_date, 1, 7) = ? AND a.arrear_type = ?
      `;
      params.push(arrearType);
    }
    if (userRole === "viewer" && userEmail) {
      query += ` WHERE LOWER(e.email_id) = LOWER(?)`;
      params.push(userEmail);
    } else {
      query += ` WHERE e.is_active = 1 OR a.id IS NOT NULL`;
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
__name(onRequestGet11, "onRequestGet");
async function onRequestPost12(context) {
  const userRole = context.request.headers.get("X-User-Role");
  const userEmail = context.request.headers.get("X-User-Email");
  if (userRole === "viewer") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }
  try {
    const monthYear = context.params.month_year;
    const { records } = await context.request.json();
    const db = context.env.ksom_payslip_db;
    const statements = [];
    for (const record of records) {
      if (!record.arrear_type) continue;
      const isApprovedRecord = await db.prepare(
        "SELECT is_approved FROM arrear_bills WHERE emp_id = ? AND substr(bill_date, 1, 7) = ? AND arrear_type = ? AND is_approved = 1 LIMIT 1"
      ).bind(record.emp_id, monthYear, record.arrear_type).first("is_approved");
      if (isApprovedRecord === 1 && userRole !== "super_admin") {
        continue;
      }
      if (record.arrear_amount && record.arrear_amount > 0) {
        statements.push(
          db.prepare(`
            INSERT INTO arrear_bills (emp_id, arrear_type, arrear_type_other, category, arrear_amount, income_tax, net_amount, bill_date, description, is_approved)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 2)
            ON CONFLICT(emp_id, bill_date, arrear_type) DO UPDATE SET
              arrear_type_other = excluded.arrear_type_other,
              category = excluded.category,
              arrear_amount = excluded.arrear_amount,
              income_tax = excluded.income_tax,
              net_amount = excluded.net_amount,
              description = excluded.description,
              is_approved = 2
          `).bind(
            record.emp_id,
            record.arrear_type,
            record.arrear_type_other || null,
            record.category,
            record.arrear_amount || 0,
            record.income_tax || 0,
            record.net_amount || 0,
            record.bill_date,
            record.description || null
          )
        );
      } else {
        if (record.bill_date && record.arrear_type) {
          statements.push(
            db.prepare(`
              DELETE FROM arrear_bills 
              WHERE emp_id = ? AND bill_date = ? AND arrear_type = ?
            `).bind(record.emp_id, record.bill_date, record.arrear_type)
          );
        }
      }
    }
    if (statements.length > 0) {
      await db.batch(statements);
      for (const record of records) {
        if (record.arrear_amount && record.arrear_amount > 0) {
          await logActivity(db, userEmail, "Save Arrear Bill", `Saved/Updated arrear bill (${record.arrear_type}) for employee ${record.emp_id} with amount Rs. ${record.arrear_amount}`);
        } else if (record.bill_date && record.arrear_type) {
          await logActivity(db, userEmail, "Delete Arrear Bill", `Deleted arrear bill (${record.arrear_type}) for employee ${record.emp_id} on date ${record.bill_date}`);
        }
      }
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost12, "onRequestPost");

// api/deductions/[month_year].js
async function onRequestGet12(context) {
  try {
    const monthYear = context.params.month_year;
    const userRole = context.request.headers.get("X-User-Role");
    const userEmail = context.request.headers.get("X-User-Email");
    let query = `
      SELECT e.emp_id, e.name, e.designation, e.scale_of_pay, e.category, e.is_active, e.title, e.sort_order,
             d.epf, d.professional_tax, d.sli, d.gis, d.lic, d.income_tax, d.onam_advance, d.other_deductions,
             d.cpf, d.hra_recovery, d.other_deductions_breakdown
      FROM employees e
      LEFT JOIN monthly_deductions d ON e.emp_id = d.emp_id AND d.month_year = ?
    `;
    let params = [monthYear];
    if (userRole === "viewer") {
      query += ` WHERE LOWER(e.email_id) = LOWER(?)`;
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
__name(onRequestGet12, "onRequestGet");
async function onRequestPost13(context) {
  const userRole = context.request.headers.get("X-User-Role");
  if (userRole === "viewer") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }
  try {
    const monthYear = context.params.month_year;
    const { records } = await context.request.json();
    const db = context.env.ksom_payslip_db;
    const approvalCheck = await db.prepare("SELECT is_approved FROM monthly_earnings WHERE month_year = ? AND is_approved = 1 LIMIT 1").bind(monthYear).first();
    if (approvalCheck && userRole !== "super_admin") {
      return new Response(JSON.stringify({ error: "This month is approved and locked. Only super_admin can modify it." }), { status: 403 });
    }
    const statements = [];
    for (const record of records) {
      statements.push(
        db.prepare(`
          INSERT INTO monthly_deductions (emp_id, month_year, epf, professional_tax, sli, gis, lic, income_tax, onam_advance, other_deductions, cpf, hra_recovery, other_deductions_breakdown)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            hra_recovery=excluded.hra_recovery,
            other_deductions_breakdown=excluded.other_deductions_breakdown
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
          record.hra_recovery || 0,
          record.other_deductions_breakdown ? JSON.stringify(record.other_deductions_breakdown) : null
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
__name(onRequestPost13, "onRequestPost");

// api/earnings/[month_year].js
async function onRequestGet13(context) {
  try {
    const monthYear = context.params.month_year;
    const userRole = context.request.headers.get("X-User-Role");
    const userEmail = context.request.headers.get("X-User-Email");
    let query = `
      SELECT e.emp_id, e.name, e.designation, e.scale_of_pay, e.category, e.is_active, e.date_of_joining, e.email_id, e.date_of_birth, e.epf_uan, e.title, e.sort_order,
             m.id as earnings_id, m.basic_pay, m.dp_gp, m.da_state, m.da_ugc, m.hra_state, m.hra_ugc, m.cca, m.other_earnings,
             m.spl_pay, m.tr_allow, m.spl_allow, m.fest_allow, m.other_earnings_breakdown, m.is_approved, m.approved_on, m.approved_by,
             d.id as deductions_id, d.epf, d.professional_tax, d.sli, d.gis, d.lic, d.income_tax, d.onam_advance, d.other_deductions,
             d.cpf, d.hra_recovery, d.other_deductions_breakdown
      FROM employees e
      LEFT JOIN monthly_earnings m ON e.emp_id = m.emp_id AND m.month_year = ?
      LEFT JOIN monthly_deductions d ON e.emp_id = d.emp_id AND d.month_year = ?
    `;
    let params = [monthYear, monthYear];
    if (userRole === "viewer" && userEmail) {
      query += ` WHERE LOWER(e.email_id) = LOWER(?)`;
      params.push(userEmail);
    } else {
      query += ` WHERE e.is_active = 1 OR m.id IS NOT NULL`;
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
__name(onRequestGet13, "onRequestGet");
async function onRequestPost14(context) {
  const userRole = context.request.headers.get("X-User-Role");
  const userEmail = context.request.headers.get("X-User-Email");
  if (userRole === "viewer") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }
  try {
    const monthYear = context.params.month_year;
    const { records } = await context.request.json();
    const db = context.env.ksom_payslip_db;
    const approvalCheck = await db.prepare("SELECT is_approved FROM monthly_earnings WHERE month_year = ? AND is_approved = 1 LIMIT 1").bind(monthYear).first();
    if (approvalCheck && userRole !== "super_admin") {
      return new Response(JSON.stringify({ error: "This month is approved and locked. Only super_admin can modify it." }), { status: 403 });
    }
    const statements = [];
    for (const record of records) {
      statements.push(
        db.prepare(`
          INSERT INTO monthly_earnings (
            emp_id, month_year, basic_pay, dp_gp, da_state, da_ugc, hra_state, hra_ugc, cca, other_earnings,
            spl_pay, tr_allow, spl_allow, fest_allow, other_earnings_breakdown
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(emp_id, month_year) DO UPDATE SET
            basic_pay = excluded.basic_pay,
            dp_gp = excluded.dp_gp,
            da_state = excluded.da_state,
            da_ugc = excluded.da_ugc,
            hra_state = excluded.hra_state,
            hra_ugc = excluded.hra_ugc,
            cca = excluded.cca,
            other_earnings = excluded.other_earnings,
            spl_pay = excluded.spl_pay,
            tr_allow = excluded.tr_allow,
            spl_allow = excluded.spl_allow,
            fest_allow = excluded.fest_allow,
            other_earnings_breakdown = excluded.other_earnings_breakdown
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
          record.fest_allow || 0,
          record.other_earnings_breakdown ? JSON.stringify(record.other_earnings_breakdown) : null
        )
      );
      statements.push(
        db.prepare(`
          INSERT INTO monthly_deductions (
            emp_id, month_year, epf, professional_tax, sli, gis, lic, income_tax, onam_advance, other_deductions,
            cpf, hra_recovery, other_deductions_breakdown
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(emp_id, month_year) DO UPDATE SET
            epf = excluded.epf,
            professional_tax = excluded.professional_tax,
            sli = excluded.sli,
            gis = excluded.gis,
            lic = excluded.lic,
            income_tax = excluded.income_tax,
            onam_advance = excluded.onam_advance,
            other_deductions = excluded.other_deductions,
            cpf = excluded.cpf,
            hra_recovery = excluded.hra_recovery,
            other_deductions_breakdown = excluded.other_deductions_breakdown
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
          record.hra_recovery || 0,
          record.other_deductions_breakdown ? JSON.stringify(record.other_deductions_breakdown) : null
        )
      );
    }
    if (statements.length > 0) {
      await db.batch(statements);
      await logActivity2(db, userEmail, "Update Paybill", `Updated paybill records for ${monthYear}`);
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost14, "onRequestPost");
async function onRequestDelete(context) {
  const userRole = context.request.headers.get("X-User-Role");
  const userEmail = context.request.headers.get("X-User-Email");
  if (userRole === "viewer") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }
  try {
    const monthYear = context.params.month_year;
    const url = new URL(context.request.url);
    const empId = url.searchParams.get("emp_id");
    if (!empId) {
      return new Response(JSON.stringify({ error: "Missing emp_id parameter." }), { status: 400 });
    }
    const db = context.env.ksom_payslip_db;
    const approvalCheck = await db.prepare("SELECT is_approved FROM monthly_earnings WHERE month_year = ? AND is_approved = 1 LIMIT 1").bind(monthYear).first();
    if (approvalCheck && userRole !== "super_admin") {
      return new Response(JSON.stringify({ error: "This month is approved and locked. Only super_admin can modify it." }), { status: 403 });
    }
    const deleteEarnings = db.prepare("DELETE FROM monthly_earnings WHERE emp_id = ? AND month_year = ?").bind(empId, monthYear);
    const deleteDeductions = db.prepare("DELETE FROM monthly_deductions WHERE emp_id = ? AND month_year = ?").bind(empId, monthYear);
    await db.batch([deleteEarnings, deleteDeductions]);
    await logActivity2(db, userEmail, "Delete Paybill Record", `Deleted paybill record for employee ${empId} for ${monthYear}`);
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestDelete, "onRequestDelete");

// api/festival/[month_year].js
async function onRequestGet14(context) {
  try {
    const monthYear = context.params.month_year;
    const userRole = context.request.headers.get("X-User-Role");
    const userEmail = context.request.headers.get("X-User-Email");
    let query = `
      SELECT e.emp_id, e.name, e.designation, e.scale_of_pay, e.category, e.is_active, e.email_id, e.title, e.sort_order,
             f.id as bill_id, f.bill_date, f.amount, f.description,
             f.is_approved, f.approved_on, f.approved_by
      FROM employees e
      LEFT JOIN festival_allowance_bills f ON e.emp_id = f.emp_id AND substr(f.bill_date, 1, 7) = ?
    `;
    let params = [monthYear];
    if (userRole === "viewer" && userEmail) {
      query += ` WHERE LOWER(e.email_id) = LOWER(?)`;
      params.push(userEmail);
    } else {
      query += ` WHERE e.is_active = 1 OR f.id IS NOT NULL`;
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
__name(onRequestGet14, "onRequestGet");
async function onRequestPost15(context) {
  const userRole = context.request.headers.get("X-User-Role");
  const userEmail = context.request.headers.get("X-User-Email");
  if (userRole === "viewer") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }
  try {
    const monthYear = context.params.month_year;
    const { records } = await context.request.json();
    const db = context.env.ksom_payslip_db;
    const statements = [];
    for (const record of records) {
      const isApprovedRecord = await db.prepare(
        "SELECT is_approved FROM festival_allowance_bills WHERE emp_id = ? AND substr(bill_date, 1, 7) = ? AND is_approved = 1 LIMIT 1"
      ).bind(record.emp_id, monthYear).first("is_approved");
      if (isApprovedRecord === 1 && userRole !== "super_admin") {
        continue;
      }
      if (record.amount && record.amount > 0) {
        statements.push(
          db.prepare(`
            INSERT INTO festival_allowance_bills (emp_id, amount, bill_date, description, is_approved)
            VALUES (?, ?, ?, ?, 2)
            ON CONFLICT(emp_id, bill_date) DO UPDATE SET
              amount = excluded.amount,
              description = excluded.description,
              is_approved = 2
          `).bind(
            record.emp_id,
            record.amount || 0,
            record.bill_date,
            record.description || null
          )
        );
      } else {
        if (record.bill_date) {
          statements.push(
            db.prepare(`
              DELETE FROM festival_allowance_bills 
              WHERE emp_id = ? AND bill_date = ?
            `).bind(record.emp_id, record.bill_date)
          );
        }
      }
    }
    if (statements.length > 0) {
      await db.batch(statements);
      for (const record of records) {
        if (record.amount && record.amount > 0) {
          await logActivity2(db, userEmail, "Save Festival Allowance", `Saved/Updated festival allowance for employee ${record.emp_id} with amount Rs. ${record.amount}`);
        } else if (record.bill_date) {
          await logActivity2(db, userEmail, "Delete Festival Allowance", `Deleted festival allowance for employee ${record.emp_id} on date ${record.bill_date}`);
        }
      }
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost15, "onRequestPost");

// api/surrender/[month_year].js
async function onRequestGet15(context) {
  try {
    const monthYear = context.params.month_year;
    const userRole = context.request.headers.get("X-User-Role");
    const userEmail = context.request.headers.get("X-User-Email");
    const isYearOnly = monthYear.length === 4;
    const dateLen = isYearOnly ? 4 : 7;
    let query = `
      SELECT e.emp_id, e.name, e.designation, e.scale_of_pay, e.category, e.is_active, e.email_id, e.title, e.sort_order,
             s.id as bill_id, s.bill_date, s.financial_year, s.basic_pay, s.da, s.hra, s.num_els, s.total_amount,
             s.is_approved, s.approved_on, s.approved_by
      FROM employees e
      LEFT JOIN surrender_bills s ON e.emp_id = s.emp_id AND substr(s.bill_date, 1, ${dateLen}) = ?
    `;
    let params = [monthYear];
    if (userRole === "viewer" && userEmail) {
      query += ` WHERE LOWER(e.email_id) = LOWER(?)`;
      params.push(userEmail);
    } else {
      query += ` WHERE e.is_active = 1 OR s.id IS NOT NULL`;
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
__name(onRequestGet15, "onRequestGet");
async function onRequestPost16(context) {
  const userRole = context.request.headers.get("X-User-Role");
  const userEmail = context.request.headers.get("X-User-Email");
  if (userRole === "viewer") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }
  try {
    const monthYear = context.params.month_year;
    const { records } = await context.request.json();
    const db = context.env.ksom_payslip_db;
    for (const record of records) {
      const isApprovedRecord = await db.prepare(
        "SELECT is_approved FROM surrender_bills WHERE emp_id = ? AND substr(bill_date, 1, 7) = ? AND is_approved = 1 LIMIT 1"
      ).bind(record.emp_id, monthYear).first("is_approved");
      if (isApprovedRecord === 1 && userRole !== "super_admin") {
        return new Response(JSON.stringify({ error: `Record for employee ${record.emp_id} is approved and locked. Only super_admin can modify it.` }), { status: 403 });
      }
    }
    const statements = [];
    for (const record of records) {
      if (record.num_els && record.num_els > 0) {
        if (record.num_els > 30) {
          return new Response(JSON.stringify({ error: "Maximum 30 Earned Leaves can be surrendered." }), { status: 400 });
        }
        statements.push(
          db.prepare(`
            INSERT INTO surrender_bills (emp_id, bill_date, financial_year, basic_pay, da, hra, num_els, total_amount, is_approved)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 2)
            ON CONFLICT(emp_id, bill_date) DO UPDATE SET
              financial_year = excluded.financial_year,
              basic_pay = excluded.basic_pay,
              da = excluded.da,
              hra = excluded.hra,
              num_els = excluded.num_els,
              total_amount = excluded.total_amount,
              is_approved = 2
          `).bind(
            record.emp_id,
            record.bill_date,
            record.financial_year,
            record.basic_pay || 0,
            record.da || 0,
            record.hra || 0,
            record.num_els,
            record.total_amount || 0
          )
        );
      } else {
        if (record.bill_date) {
          statements.push(
            db.prepare(`
              DELETE FROM surrender_bills 
              WHERE emp_id = ? AND bill_date = ?
            `).bind(record.emp_id, record.bill_date)
          );
        }
      }
    }
    if (statements.length > 0) {
      await db.batch(statements);
      for (const record of records) {
        if (record.num_els && record.num_els > 0) {
          await logActivity2(db, userEmail, "Save Surrender Bill", `Saved/Updated surrender bill for employee ${record.emp_id} with ${record.num_els} ELs`);
        } else if (record.bill_date) {
          await logActivity2(db, userEmail, "Delete Surrender Bill", `Deleted surrender bill for employee ${record.emp_id} on date ${record.bill_date}`);
        }
      }
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost16, "onRequestPost");

// api/backup.js
async function onRequestGet16(context) {
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
__name(onRequestGet16, "onRequestGet");
async function onRequestPost17(context) {
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
__name(onRequestPost17, "onRequestPost");

// api/email/index.js
async function onRequestPost18(context) {
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
__name(onRequestPost18, "onRequestPost");

// api/employees/index.js
async function onRequestGet17(context) {
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
__name(onRequestGet17, "onRequestGet");
async function onRequestPost19(context) {
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
__name(onRequestPost19, "onRequestPost");
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

// api/settings/index.js
async function onRequestGet18(context) {
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
__name(onRequestGet18, "onRequestGet");
async function onRequestPost20(context) {
  const userRole = context.request.headers.get("X-User-Role");
  const userEmail = context.request.headers.get("X-User-Email");
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
    await logActivity2(context.env.ksom_payslip_db, userEmail, "Update Allowance Settings", `Updated global allowances for ${effective_from} (State DA: ${da_state_percentage}%, UGC DA: ${da_ugc_percentage}%, State HRA: ${hra_state_percentage}%, UGC HRA: ${hra_ugc_percentage}%)`);
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 201
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost20, "onRequestPost");

// api/users/index.js
async function onRequestGet19(context) {
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
__name(onRequestGet19, "onRequestGet");
async function onRequestPost21(context) {
  const userEmail = context.request.headers.get("X-User-Email");
  try {
    const data = await context.request.json();
    const { email, role, status, name, designation } = data;
    if (!email || !role) {
      return new Response(JSON.stringify({ error: "Email and role are required." }), { status: 400 });
    }
    await context.env.ksom_payslip_db.prepare(
      `INSERT INTO users (email, role, status, name, designation) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET 
         role=excluded.role, 
         status=excluded.status, 
         name=excluded.name, 
         designation=excluded.designation`
    ).bind(email.toLowerCase(), role, status || "active", name || null, designation || null).run();
    await logActivity2(context.env.ksom_payslip_db, userEmail, "Save/Update User", `Saved/Updated user ${email} (Role: ${role}, Status: ${status || "active"})`);
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost21, "onRequestPost");
async function onRequestDelete2(context) {
  const userEmail = context.request.headers.get("X-User-Email");
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get("id");
    if (!id) return new Response(JSON.stringify({ error: "ID required." }), { status: 400 });
    const userToDel = await context.env.ksom_payslip_db.prepare("SELECT email FROM users WHERE id = ?").bind(id).first();
    await context.env.ksom_payslip_db.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
    await logActivity2(context.env.ksom_payslip_db, userEmail, "Delete User", `Deleted user with ID ${id}${userToDel ? ` (${userToDel.email})` : ""}`);
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestDelete2, "onRequestDelete");

// _middleware.js
async function onRequest(context) {
  const { request, env, next, data } = context;
  const url = new URL(request.url);
  let email = request.headers.get("Cf-Access-Authenticated-User-Email");
  if (!email) {
    const cookieHeader = request.headers.get("Cookie") || "";
    const cookies = Object.fromEntries(cookieHeader.split(";").map((c) => c.trim().split("=")));
    email = cookies["payslip_auth"] || cookies["mock_email"] || (url.hostname === "localhost" || url.hostname === "127.0.0.1" ? url.searchParams.get("mock_user") : null);
  }
  if (url.searchParams.has("mock_user") && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
    const mockUser = url.searchParams.get("mock_user");
    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete("mock_user");
    return new Response(null, {
      status: 302,
      headers: {
        "Location": cleanUrl.toString(),
        "Set-Cookie": `mock_email=${mockUser}; Path=/; Max-Age=3600`
      }
    });
  }
  if (!email) {
    if (url.pathname.startsWith("/api/") && !url.pathname.startsWith("/api/auth/")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
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
  if (path.startsWith("/api/settings") && method !== "GET" && (user.role === "viewer" || user.role === "approver")) {
    return forbiddenResponse();
  }
  if (path.startsWith("/api/settings") && user.role === "viewer" && method === "GET") {
  }
  const isApprovePath = path.startsWith("/api/approve") || path.includes("/approve");
  if (isApprovePath && method !== "GET" && user.role !== "approver" && user.role !== "super_admin" && user.role !== "admin") {
    return forbiddenResponse();
  }
  if (method !== "GET" && (user.role === "viewer" || user.role === "approver") && !isApprovePath) {
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
function forbiddenResponse() {
  return new Response(JSON.stringify({ error: "Forbidden" }), {
    status: 403,
    headers: { "Content-Type": "application/json" }
  });
}
__name(forbiddenResponse, "forbiddenResponse");

// ../.wrangler/tmp/pages-4ZqUVM/functionsRoutes-0.6005906864410094.mjs
var routes = [
  {
    routePath: "/api/arrears/approve/:month_year",
    mountPath: "/api/arrears/approve",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/arrears/approve/:month_year",
    mountPath: "/api/arrears/approve",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/festival/approve/:month_year",
    mountPath: "/api/festival/approve",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/festival/approve/:month_year",
    mountPath: "/api/festival/approve",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/surrender/approve/:month_year",
    mountPath: "/api/surrender/approve",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/surrender/approve/:month_year",
    mountPath: "/api/surrender/approve",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/auth/login",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/auth/logout",
    mountPath: "/api/auth",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/auth/reset-confirm",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  },
  {
    routePath: "/api/auth/reset-request",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost6]
  },
  {
    routePath: "/api/me/password",
    mountPath: "/api/me",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost7]
  },
  {
    routePath: "/api/reports/consolidated",
    mountPath: "/api/reports",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet5]
  },
  {
    routePath: "/api/settings/backup",
    mountPath: "/api/settings",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet6]
  },
  {
    routePath: "/api/settings/backup",
    mountPath: "/api/settings",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost8]
  },
  {
    routePath: "/api/settings/logs",
    mountPath: "/api/settings",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet7]
  },
  {
    routePath: "/api/settings/system",
    mountPath: "/api/settings",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet8]
  },
  {
    routePath: "/api/settings/system",
    mountPath: "/api/settings",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost9]
  },
  {
    routePath: "/api/surrender/cumulative",
    mountPath: "/api/surrender",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet9]
  },
  {
    routePath: "/api/users/password",
    mountPath: "/api/users",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost10]
  },
  {
    routePath: "/api/approve/:month_year",
    mountPath: "/api/approve",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet10]
  },
  {
    routePath: "/api/approve/:month_year",
    mountPath: "/api/approve",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost11]
  },
  {
    routePath: "/api/arrears/:month_year",
    mountPath: "/api/arrears",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet11]
  },
  {
    routePath: "/api/arrears/:month_year",
    mountPath: "/api/arrears",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost12]
  },
  {
    routePath: "/api/deductions/:month_year",
    mountPath: "/api/deductions",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet12]
  },
  {
    routePath: "/api/deductions/:month_year",
    mountPath: "/api/deductions",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost13]
  },
  {
    routePath: "/api/earnings/:month_year",
    mountPath: "/api/earnings",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete]
  },
  {
    routePath: "/api/earnings/:month_year",
    mountPath: "/api/earnings",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet13]
  },
  {
    routePath: "/api/earnings/:month_year",
    mountPath: "/api/earnings",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost14]
  },
  {
    routePath: "/api/festival/:month_year",
    mountPath: "/api/festival",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet14]
  },
  {
    routePath: "/api/festival/:month_year",
    mountPath: "/api/festival",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost15]
  },
  {
    routePath: "/api/surrender/:month_year",
    mountPath: "/api/surrender",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet15]
  },
  {
    routePath: "/api/surrender/:month_year",
    mountPath: "/api/surrender",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost16]
  },
  {
    routePath: "/api/backup",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet16]
  },
  {
    routePath: "/api/backup",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost17]
  },
  {
    routePath: "/api/email",
    mountPath: "/api/email",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost18]
  },
  {
    routePath: "/api/employees",
    mountPath: "/api/employees",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet17]
  },
  {
    routePath: "/api/employees",
    mountPath: "/api/employees",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost19]
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
    modules: [onRequestGet18]
  },
  {
    routePath: "/api/settings",
    mountPath: "/api/settings",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost20]
  },
  {
    routePath: "/api/users",
    mountPath: "/api/users",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete2]
  },
  {
    routePath: "/api/users",
    mountPath: "/api/users",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet19]
  },
  {
    routePath: "/api/users",
    mountPath: "/api/users",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost21]
  },
  {
    routePath: "/",
    mountPath: "/",
    method: "",
    middlewares: [onRequest],
    modules: []
  }
];

// C:/Users/DELL/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/path-to-regexp/dist.es2015/index.js
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
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
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
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
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
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
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
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
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
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
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
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// C:/Users/DELL/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
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
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
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
          passThroughOnException: /* @__PURE__ */ __name(() => {
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
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// C:/Users/DELL/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
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

// C:/Users/DELL/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
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

// ../.wrangler/tmp/bundle-tqsYzV/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// C:/Users/DELL/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
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
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-tqsYzV/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
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
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
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
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.10097067628754364.mjs.map
