export async function onRequest(context) {
  const { request, env, next, data } = context;
  const url = new URL(request.url);

  // 1. Get user email from Cloudflare Access (or Cookie/Mock for local dev)
  let email = request.headers.get('Cf-Access-Authenticated-User-Email');
  
  // Local development mock fallback
  if (!email && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
    const cookieHeader = request.headers.get('Cookie') || '';
    const cookies = Object.fromEntries(cookieHeader.split(';').map(c => c.trim().split('=')));
    email = cookies['mock_email'] || url.searchParams.get('mock_user');
  }

  // 2. If no email, handle redirection or unauthorized response
  if (!email) {
    // Only protect /api/* routes. Frontend assets should load so they can see the login state.
    if (url.pathname.startsWith('/api/')) {
       const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
       if (!isLocal) {
         return new Response(null, {
           status: 302,
           headers: { 'Location': '/cdn-cgi/access/login' }
         });
       }
       return new Response(JSON.stringify({ error: "Unauthorized" }), { 
         status: 401, headers: { 'Content-Type': 'application/json' }
       });
    }
    return next();
  }

  // 3. Local development logout mock
  if (url.pathname === '/api/logout' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
    return new Response(null, { 
      status: 302,
      headers: { 
        'Location': '/',
        'Set-Cookie': 'mock_email=; Path=/; Max-Age=0' 
      }
    });
  }

  // Allow static assets to load for authenticated users
  if (!url.pathname.startsWith('/api/')) {
    return next();
  }

  // 2. Fetch user from DB to check role
  const { results } = await env.ksom_payslip_db.prepare(
    "SELECT id, email, role FROM users WHERE email = ? AND status = 'active'"
  ).bind(email.toLowerCase()).all();

  const user = results[0];

  if (!user) {
    return new Response(JSON.stringify({ error: `Access Denied: ${email} is not authorized.` }), { 
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 3. Attach user info to context
  data.user = user;

  // 4. Role-Based Access Control (RBAC) Logic
  const path = url.pathname;
  const method = request.method;

  if (path.startsWith('/api/users') && user.role !== 'super_admin') {
    return forbiddenResponse();
  }

  if (path.startsWith('/api/backup') && user.role !== 'super_admin' && user.role !== 'admin') {
    return forbiddenResponse();
  }

  if (path.startsWith('/api/settings') && user.role === 'viewer') {
    return forbiddenResponse();
  }

  if (method !== 'GET' && user.role === 'viewer') {
    return forbiddenResponse();
  }

  if (path === '/api/me') {
    return new Response(JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 5. Attach user info to headers for downstream handlers
  const modifiedRequest = new Request(request, {
    headers: {
      ...Object.fromEntries(request.headers),
      'X-User-Email': email,
      'X-User-Role': user.role
    }
  });

  return next(modifiedRequest);
}

function forbiddenResponse() {
  return new Response(JSON.stringify({ error: "Forbidden" }), { 
    status: 403,
    headers: { 'Content-Type': 'application/json' }
  });
}
