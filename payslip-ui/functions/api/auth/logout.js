export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // Response.redirect() returns an immutable response. 
  // We must create a new one to add headers.
  return new Response(null, {
    status: 302,
    headers: {
      'Location': url.origin,
      'Set-Cookie': 'payslip_auth=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
    }
  });
}
