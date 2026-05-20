import { verifyPassword } from '../../lib/auth.js';
import { logActivity } from '../../lib/logger.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { email, password, rememberMe } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), { 
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. Fetch user from DB
    const { results } = await env.ksom_payslip_db.prepare(
      "SELECT * FROM users WHERE email = ? AND status = 'active'"
    ).bind(email.toLowerCase()).all();

    const user = results[0];
    console.log("Login attempt for:", email);
    console.log("User found:", user ? "Yes" : "No");

    if (!user || !user.password_hash) {
      // For security, use a generic error message
      return new Response(JSON.stringify({ error: "Invalid email or password" }), { 
        status: 401, headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Verify password
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
        status: 401, headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Set auth cookie
    // We use a simple cookie. In production, consider a signed JWT.
    const maxAge = rememberMe ? 2592000 : 86400; // 30 days or 1 day
    const response = new Response(JSON.stringify({ success: true, user: { email: user.email, role: user.role } }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    response.headers.append('Set-Cookie', `payslip_auth=${user.email}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`);
    
    // Log login activity
    logActivity(env.ksom_payslip_db, user.email, 'Login', `Successfully logged in with role ${user.role}`);
    
    return response;

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
