export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const response = Response.redirect(url.origin, 302);
  
  // Clear both the new auth cookie and the old mock cookie
  response.headers.append('Set-Cookie', 'payslip_auth=; Path=/; Max-Age=0');
  response.headers.append('Set-Cookie', 'mock_email=; Path=/; Max-Age=0');
  
  return response;
}
