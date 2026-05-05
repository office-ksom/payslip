export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  const redirectUri = `${url.origin}/api/auth/callback`;

  // 1. Exchange code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GMAIL_CLIENT_ID,
      client_secret: env.GMAIL_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokens = await tokenResponse.json();
  if (tokens.error) {
    return new Response(`Token error: ${tokens.error_description || tokens.error}`, { status: 500 });
  }

  // 2. Fetch user info
  const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  const userInfo = await userResponse.json();
  if (!userInfo.email) {
    return new Response('Could not fetch user email', { status: 500 });
  }

  // 3. Set auth cookie
  // We use a simple cookie for now. In a full app, you'd sign a JWT.
  const response = Response.redirect(url.origin, 302);
  response.headers.append('Set-Cookie', `payslip_auth=${userInfo.email}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`);
  
  return response;
}
