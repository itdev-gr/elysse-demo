// Supabase Edge Function: emails the per-source recipient when a contact form
// is submitted. Invoked by the website client after a successful insert, with
// `{ id }`. Uses the service-role key to read the submission + recipient
// (both are RLS-protected from the public), then sends via Resend.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const RESEND_FROM = Deno.env.get('RESEND_FROM') ?? 'Elysée Website <onboarding@resend.dev>';
const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

const esc = (s: string) =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { id } = await req.json();
    if (!id || typeof id !== 'string') return json({ error: 'missing id' }, 400);

    const { data: sub } = await admin
      .from('contact_submissions').select('*').eq('id', id).single();
    if (!sub) return json({ error: 'not found' }, 404);
    if (sub.notified_at) return json({ ok: true, already: true });

    const { data: setting } = await admin
      .from('contact_settings').select('recipient_email').eq('source', sub.source).maybeSingle();
    const { data: fallback } = await admin
      .from('contact_settings').select('recipient_email').eq('source', 'general').maybeSingle();
    const to = setting?.recipient_email ?? fallback?.recipient_email;
    if (!to) return json({ error: 'no recipient configured' }, 500);

    const rows = [
      ['Name', sub.name], ['Email', sub.email], ['Company', sub.company ?? '—'],
      ['Phone', sub.phone ?? '—'], ['Source', sub.source], ['Page', sub.page_path ?? '—'],
    ]
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 12px 4px 0;color:#6b7280">${k}</td><td style="padding:4px 0">${esc(String(v))}</td></tr>`,
      )
      .join('');
    const html = `<div style="font-family:system-ui,sans-serif;max-width:560px">
      <h2 style="color:#4c6830">New ${esc(sub.source)} enquiry</h2>
      <table style="font-size:14px">${rows}</table>
      <p style="white-space:pre-wrap;border-left:3px solid #4c6830;padding-left:12px;margin-top:16px">${esc(sub.message)}</p>
    </div>`;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to,
        reply_to: sub.email,
        subject: `New ${sub.source} enquiry from ${sub.name}`,
        html,
      }),
    });
    if (!resp.ok) return json({ error: `resend ${resp.status}: ${await resp.text()}` }, 502);

    await admin
      .from('contact_submissions')
      .update({ notified_at: new Date().toISOString() })
      .eq('id', id);
    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
