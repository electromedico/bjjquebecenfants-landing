export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const { name, email, phone, childAge, message, turnstileToken, source = 'landing-contact' } = body;

  if (!name || !email) {
    return Response.json({ ok: false, error: 'missing_fields' }, { status: 400 });
  }

  if (turnstileToken && env.TURNSTILE_SECRET_KEY) {
    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: turnstileToken }).toString(),
    });
    const turnstileData = await verifyRes.json();
    if (!turnstileData.success) {
      return Response.json(
        {
          ok: false,
          error: 'turnstile_failed',
          details: turnstileData['error-codes'] || [],
        },
        { status: 400 }
      );
    }
  }

  if (env.RESEND_API_KEY) {
    const from = env.RESEND_FROM ?? 'BJJ Québec Enfants <info@bjjquebecenfants.ca>';
    const to = env.RESEND_TO ?? 'info@bjjquebecenfants.ca';
    const subject = `Cours d'essai — ${name}${childAge ? ` (enfant ${childAge} ans)` : ''}`;
    const text = [
      `Source: ${source}`,
      `Nom: ${name}`,
      `Courriel: ${email}`,
      `Téléphone: ${phone || '—'}`,
      `Âge de l'enfant: ${childAge || '—'}`,
      `Message: ${message || '—'}`,
    ].join('\n');

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.RESEND_API_KEY}` },
      body: JSON.stringify({ from, to, subject, text }),
    });
  }

  return Response.json({ ok: true });
}
