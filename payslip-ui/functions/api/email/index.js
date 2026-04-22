export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { to, subject, text, attachments } = data;

    const apiKey = context.env.RESEND_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY is not configured on the server." }), { status: 500 });
    }

    const resendPayload = {
      from: "KSoM Payslip <office@office.ksom.res.in>",
      to: [to],
      subject: subject || "Your Payslip",
      text: text || "Please find your payslip attached.",
      attachments: attachments || []
    };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(resendPayload)
    });

    const result = await response.json();

    if (response.ok) {
      return new Response(JSON.stringify({ success: true, id: result.id }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } else {
      return new Response(JSON.stringify({ error: result.message || "Failed to send email" }), { status: response.status });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
