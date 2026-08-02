import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const json = (body: object, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    let body: { inputKey?: unknown }
    try { body = await req.json() }
    catch { return json({ success: false, error: 'Invalid JSON body' }, 400) }

    const inputKey = typeof body.inputKey === 'string' ? body.inputKey.trim().slice(0, 10) : ''
    if (!/^\d{6}$/.test(inputKey)) return json({ success: false, error: 'Invalid secret key' }, 400)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    )

    // Rate limit verification attempts so the 6-digit code can't be brute-forced
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await admin
      .from('rate_limit_log')
      .select('id', { count: 'exact', head: true })
      .eq('ip', 'super-admin-verify')
      .eq('endpoint', 'super-admin-otp-verify')
      .gte('created_at', since)

    if ((count ?? 0) >= 20) {
      return json({ success: false, error: 'Too many attempts. Try again later.' }, 429)
    }
    await admin.from('rate_limit_log').insert({ ip: 'super-admin-verify', endpoint: 'super-admin-otp-verify' })

    const { data: keyRecord, error: keyError } = await admin
      .from('super_admin_keys')
      .select('*')
      .eq('secret_key', inputKey)
      .eq('used', false)
      .single()

    if (keyError || !keyRecord) return json({ success: false, error: 'Invalid secret key' }, 400)

    if (new Date(keyRecord.expires_at) < new Date()) {
      return json({ success: false, error: 'Secret key has expired. Please request a new one.' }, 400)
    }

    const { error: updateError } = await admin
      .from('super_admin_keys')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('id', keyRecord.id)

    if (updateError) console.error('Failed to mark key as used:', updateError.message)

    const { data: superAdmin, error: adminError } = await admin
      .from('admins')
      .select('*')
      .eq('is_super_admin', true)
      .single()

    if (adminError || !superAdmin) return json({ success: false, error: 'Super admin record does not exist' }, 400)

    return json({
      success: true,
      admin: { id: superAdmin.id, email: superAdmin.email, isSuperAdmin: true }
    })
  } catch (error) {
    console.error('verify-super-admin-key error:', error.message)
    return json({ success: false, error: error.message || 'Verification failed' }, 500)
  }
})
