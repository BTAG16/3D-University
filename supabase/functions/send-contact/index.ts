import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const CONTACT_EMAIL  = Deno.env.get('CONTACT_EMAIL')
const FROM_EMAIL     = Deno.env.get('RESEND_FROM_EMAIL') || 'Kampus <onboarding@resend.dev>'

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Strip HTML tags, collapse whitespace, hard-limit length */
function sanitize(val: unknown, max: number): string {
  if (typeof val !== 'string') return ''
  return val
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

/** Escape HTML special chars before embedding in email HTML */
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(email)
}

/** Returns false if the IP has exceeded the limit in the last hour */
async function checkRateLimit(ip: string, endpoint: string): Promise<boolean> {
  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    )
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await admin
      .from('rate_limit_log')
      .select('id', { count: 'exact', head: true })
      .eq('ip', ip)
      .eq('endpoint', endpoint)
      .gte('created_at', since)

    if ((count ?? 0) >= 5) return false

    await admin.from('rate_limit_log').insert({ ip, endpoint })
    return true
  } catch {
    return true // fail open — don't block real users if the table is missing
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const json = (body: object, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

  try {
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured')
    if (!CONTACT_EMAIL)  throw new Error('CONTACT_EMAIL not configured')

    // ── Rate limit ────────────────────────────────────────────────────────────
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
             || req.headers.get('x-real-ip')
             || 'unknown'

    if (!(await checkRateLimit(ip, 'contact'))) {
      return json({ success: false, error: 'Too many requests. Please try again later.' }, 429)
    }

    // ── Parse & validate ──────────────────────────────────────────────────────
    let body: Record<string, unknown>
    try { body = await req.json() }
    catch { return json({ success: false, error: 'Invalid JSON body' }, 400) }

    // Honeypot — bots fill in the hidden "website" field; humans leave it blank
    if (body.website) return json({ success: true }) // silently discard

    const name       = sanitize(body.name,       100)
    const email      = sanitize(body.email,       254).toLowerCase()
    const university = sanitize(body.university,  200)
    const role       = sanitize(body.role,        100)
    const subject    = sanitize(body.subject,     100)
    const message    = sanitize(body.message,    2000)
    const type       = body.type === 'demo' ? 'demo' : 'contact'

    if (!name)                return json({ success: false, error: 'Name is required' }, 400)
    if (!isValidEmail(email)) return json({ success: false, error: 'Valid email is required' }, 400)
    if (!message)             return json({ success: false, error: 'Message is required' }, 400)

    // ── Build email ───────────────────────────────────────────────────────────
    const isDemo      = type === 'demo'
    const subjectLine = isDemo
      ? `Demo Request — ${esc(university || name)}`
      : `[Kampus] ${esc(subject || 'General')} from ${esc(name)}`

    const row = (label: string, value: string) => value ? `
      <tr>
        <td style="padding:7px 0;color:#6b7280;font-size:13px;width:110px;vertical-align:top">${label}</td>
        <td style="padding:7px 0;color:#111827;font-size:14px;font-weight:600">${esc(value)}</td>
      </tr>` : ''

    const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f3f4f6;font-family:system-ui,sans-serif">
      <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
        <table width="540" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
          <tr><td style="padding:28px 32px 20px;border-bottom:1px solid #f0f0f0">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#0EA5E9;font-weight:700;margin-bottom:4px">${isDemo ? 'Demo Request' : 'Contact Message'}</div>
            <h1 style="margin:0;font-size:20px;color:#111827;font-weight:700">${isDemo ? `${esc(name)} wants a demo` : esc(subjectLine)}</h1>
          </td></tr>
          <tr><td style="padding:24px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${isDemo
                ? row('Name', name) + row('Email', email) + row('University', university) + row('Role', role)
                : row('Name', name) + row('Email', email) + row('Subject', subject)}
            </table>
            <div style="margin-top:18px;padding:14px 18px;background:#f8fafc;border-radius:8px;border-left:3px solid #0EA5E9">
              <p style="margin:0;color:#374151;font-size:14px;line-height:1.65;white-space:pre-wrap">${esc(message)}</p>
            </div>
            <p style="margin:20px 0 0;font-size:12px;color:#9ca3af">Reply to this email to respond directly to ${esc(name)} at ${esc(email)}.</p>
          </td></tr>
        </table>
      </td></tr></table>
    </body></html>`

    // ── Send via Resend ───────────────────────────────────────────────────────
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: FROM_EMAIL, to: CONTACT_EMAIL, reply_to: email, subject: subjectLine, html })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Resend error')

    return json({ success: true })
  } catch (err) {
    console.error('send-contact error:', err.message)
    return json({ success: false, error: 'Failed to send. Please try again.' }, 500)
  }
})
