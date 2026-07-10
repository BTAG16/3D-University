import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY  = Deno.env.get('RESEND_API_KEY')
const CONTACT_EMAIL   = Deno.env.get('CONTACT_EMAIL')
const FROM_EMAIL      = Deno.env.get('RESEND_FROM_EMAIL') || 'Kampus <onboarding@resend.dev>'

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured')
    if (!CONTACT_EMAIL)  throw new Error('CONTACT_EMAIL not configured')

    const { name, email, university, role, subject, message, type } = await req.json()
    if (!name || !email || !message) throw new Error('name, email, and message are required')

    const isDemo    = type === 'demo'
    const subjectLine = isDemo
      ? `Demo Request — ${university || name}`
      : `[Kampus] ${subject || 'General'} from ${name}`

    const rows = (pairs: [string, string | undefined][]) =>
      pairs.filter(([, v]) => v).map(([k, v]) =>
        `<tr>
          <td style="padding:8px 0;color:#6b7280;font-size:13px;width:110px;vertical-align:top">${k}</td>
          <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600">${v}</td>
        </tr>`
      ).join('')

    const html = `
      <!DOCTYPE html><html><body style="margin:0;padding:0;background:#f3f4f6;font-family:system-ui,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
          <table width="540" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
            <tr><td style="padding:32px 36px 20px;border-bottom:1px solid #f0f0f0">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#0EA5E9;font-weight:700;margin-bottom:6px">
                ${isDemo ? 'Demo Request' : 'Contact Message'}
              </div>
              <h1 style="margin:0;font-size:20px;color:#111827;font-weight:700">${isDemo ? `${name} wants a demo` : subjectLine}</h1>
            </tr>
            <tr><td style="padding:24px 36px">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${isDemo
                  ? rows([['Name', name], ['Email', email], ['University', university], ['Role', role]])
                  : rows([['Name', name], ['Email', email], ['Subject', subject]])}
              </table>
              <div style="margin-top:20px;padding:16px 20px;background:#f8fafc;border-radius:8px;border-left:3px solid #0EA5E9">
                <p style="margin:0;color:#374151;font-size:14px;line-height:1.65;white-space:pre-wrap">${message}</p>
              </div>
              <p style="margin:24px 0 0;font-size:12px;color:#9ca3af">Reply to this email to respond directly to ${name} at ${email}.</p>
            </td></tr>
          </table>
        </td></tr></table>
      </body></html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: FROM_EMAIL, to: CONTACT_EMAIL, reply_to: email, subject: subjectLine, html })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Resend error')

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...cors, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' }
    })
  }
})
