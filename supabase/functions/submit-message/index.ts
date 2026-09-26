const allowedOrigin = Deno.env.get('CONTACT_ALLOWED_ORIGIN') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const rateSecret = Deno.env.get('CONTACT_RATE_SECRET') || '';

function reply(status: number, body: Record<string, unknown>, origin = '') {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  if (origin && origin === allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Headers'] = 'content-type, apikey';
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers.Vary = 'Origin';
  }
  return new Response(JSON.stringify(body), { status, headers });
}

async function digest(value: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(rateSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin') || '';
  if (!allowedOrigin || origin !== allowedOrigin) return reply(403, { error: 'Origin not allowed' });
  if (request.method === 'OPTIONS') return reply(200, {}, origin);
  if (request.method !== 'POST') return reply(405, { error: 'Method not allowed' }, origin);
  if (!supabaseUrl || !serviceKey || rateSecret.length < 32) return reply(503, { error: 'Service unavailable' }, origin);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return reply(415, { error: 'JSON required' }, origin);
  if (Number(request.headers.get('content-length') || 0) > 8192) return reply(413, { error: 'Message too large' }, origin);
  let input: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 8192) return reply(413, { error: 'Message too large' }, origin);
    input = JSON.parse(raw);
    if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Invalid JSON');
  } catch { return reply(400, { error: 'Invalid JSON' }, origin); }
  if (input.website) return reply(400, { error: 'Invalid submission' }, origin);
  const clean = (value: unknown) => typeof value === 'string' ? value.trim() : '';
  const name = clean(input.name);
  const email = clean(input.email).toLowerCase();
  const subject = clean(input.subject);
  const message = clean(input.message);
  if (!name || name.length > 100 || !email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !subject || subject.length > 160 || !message || message.length > 5000 ||
      [name, email, subject, message].some((value) => /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value))) {
    return reply(400, { error: 'Invalid fields' }, origin);
  }
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
  const rateKey = await digest(`rate:${ip || email}`);
  const fingerprint = await digest(`duplicate:${email}:${subject}:${message}`);
  try {
    const saved = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/submit_contact_message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({ p_name: name, p_email: email, p_subject: subject, p_message: message, p_rate_key: rateKey, p_fingerprint: fingerprint })
    });
    const result = await saved.json();
    if (!saved.ok) {
      if (result?.message === 'RATE_LIMIT') return reply(429, { error: 'Too many messages' }, origin);
      if (result?.message === 'DUPLICATE') return reply(409, { error: 'Duplicate message' }, origin);
      console.error('Contact storage error', result?.code || saved.status);
      return reply(502, { error: 'Unable to save message' }, origin);
    }
    if (typeof result !== 'string') return reply(502, { error: 'Unable to verify save' }, origin);
    return reply(201, { id: result }, origin);
  } catch (error) {
    console.error('Contact storage unavailable', error);
    return reply(502, { error: 'Unable to save message' }, origin);
  }
});
