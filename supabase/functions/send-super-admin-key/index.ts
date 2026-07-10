import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(email)
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

/** Rate limit: max 5 OTP requests per email per hour */
async function checkRateLimit(email: string): Promise<boolean> {
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
      .eq('ip', email) // reuse ip column keyed by email for this endpoint
      .eq('endpoint', 'super-admin-otp')
      .gte('created_at', since)

    if ((count ?? 0) >= 5) return false

    await admin.from('rate_limit_log').insert({ ip: email, endpoint: 'super-admin-otp' })
    return true
  } catch {
    return true
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const json = (body: object, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured')

    let body: { email?: unknown; secretKey?: unknown }
    try { body = await req.json() }
    catch { return json({ success: false, error: 'Invalid JSON body' }, 400) }

    const email     = typeof body.email     === 'string' ? body.email.trim().toLowerCase().slice(0, 254) : ''
    const secretKey = typeof body.secretKey === 'string' ? body.secretKey.trim().slice(0, 10) : ''

    if (!email || !secretKey)   return json({ success: false, error: 'Email and secretKey are required' }, 400)
    if (!isValidEmail(email))   return json({ success: false, error: 'Invalid email address' }, 400)
    if (!/^\d{6}$/.test(secretKey)) return json({ success: false, error: 'Invalid key format' }, 400)

    // Rate limit per email
    if (!(await checkRateLimit(email))) {
      return json({ success: false, error: 'Too many requests. Try again later.' }, 429)
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: Deno.env.get('RESEND_FROM_EMAIL') || 'Kampus <onboarding@resend.dev>',
        to: email,
        subject: 'Your Super Admin Authentication Code',
        html: `
          <!DOCTYPE html>
          <html><head><meta charset="utf-8"><title>Super Admin Authentication Code</title></head>
          <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6">
            <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
                <tr><td style="padding:36px 40px 20px;text-align:center">
                  <h1 style="margin:0;color:#667eea;font-size:24px">Super Admin Access</h1>
                </td></tr>
                <tr><td style="padding:0 40px 20px;color:#374151;font-size:15px;line-height:1.6">
                  <p style="margin:0 0 16px">You requested access to the Kampus Super Admin dashboard. Your one-time code is:</p>
                </td></tr>
                <tr><td style="padding:0 40px 20px">
                  <div style="background:#f3f4f6;padding:28px;text-align:center;border-radius:8px;border:2px solid #667eea">
                    <span style="font-size:36px;letter-spacing:12px;color:#1e293b;font-family:'Courier New',monospace;font-weight:700">${esc(secretKey)}</span>
                  </div>
                </td></tr>
                <tr><td style="padding:0 40px 20px">
                  <div style="background:#fef3c7;padding:14px;border-radius:6px;border-left:4px solid #f59e0b">
                    <p style="margin:0;color:#92400e;font-size:13px">This code expires in 10 minutes. Do not share it with anyone.</p>
                  </div>
                </td></tr>
                <tr><td style="padding:0 40px 36px;text-align:center">
                  <p style="margin:0;color:#9ca3af;font-size:13px">If you didn't request this, ignore this email.</p>
                </td></tr>
              </table>
            </td></tr></table>
          </body></html>`
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to send email')

    console.log('OTP email sent successfully')

    return json({ success: true, data })
  } catch (error) {
    console.error('send-super-admin-key error:', error.message)
    return json({ success: false, error: error.message || 'Failed to send email' }, 400)
  }
})
