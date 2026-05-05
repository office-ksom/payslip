export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  
  // Construct redirect URI based on current origin
  const redirectUri = `${url.origin}/api/auth/callback`;
  
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', env.GMAIL_CLIENT_ID);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('access_type', 'online');
  googleAuthUrl.searchParams.set('prompt', 'select_account'); // Force account selection
  
  return Response.redirect(googleAuthUrl.toString(), 302);
}
