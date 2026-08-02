import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPER_ADMIN_EMAIL = Deno.env.get('SUPER_ADMIN_EMAIL')

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const json = (body: object, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured')
    if (!SUPER_ADMIN_EMAIL) throw new Error('SUPER_ADMIN_EMAIL is not configured')

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    )

    // Rate limit: max 5 code requests per hour, regardless of who's asking
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await admin
      .from('rate_limit_log')
      .select('id', { count: 'exact', head: true })
      .eq('ip', SUPER_ADMIN_EMAIL)
      .eq('endpoint', 'super-admin-otp-request')
      .gte('created_at', since)

    if ((count ?? 0) >= 5) {
      return json({ success: false, error: 'Too many requests. Try again later.' }, 429)
    }
    await admin.from('rate_limit_log').insert({ ip: SUPER_ADMIN_EMAIL, endpoint: 'super-admin-otp-request' })

    // Code is generated and stored server-side only — the client never sees
    // or controls this value, unlike the previous client-side implementation.
    const secretKey = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const { error: insertError } = await admin
      .from('super_admin_keys')
      .insert({ secret_key: secretKey, expires_at: expiresAt, used: false })

    if (insertError) {
      console.error('Insert key error:', insertError.message)
      throw new Error('Failed to generate key')
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: Deno.env.get('RESEND_FROM_EMAIL') || 'Kampus <onboarding@resend.dev>',
        to: SUPER_ADMIN_EMAIL,
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

    return json({ success: true, message: 'Secret key sent to admin email' })
  } catch (error) {
    console.error('request-super-admin-key error:', error.message)
    return json({ success: false, error: error.message || 'Failed to send secret key' }, 400)
  }
})
