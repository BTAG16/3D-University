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
    let body: { email?: unknown; password?: unknown; universityName?: unknown; city?: unknown }
    try { body = await req.json() }
    catch { return json({ success: false, error: 'Invalid JSON body' }, 400) }

    const email          = typeof body.email          === 'string' ? body.email.trim().toLowerCase().slice(0, 254) : ''
    const password       = typeof body.password       === 'string' ? body.password : ''
    const universityName = typeof body.universityName === 'string' ? body.universityName.trim().slice(0, 200) : ''
    const city           = typeof body.city           === 'string' ? body.city.trim().slice(0, 100) : ''

    if (!email || !password || !universityName || !city) {
      return json({ success: false, error: 'All fields are required' }, 400)
    }
    if (!/^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(email)) {
      return json({ success: false, error: 'Invalid email address' }, 400)
    }
    if (password.length < 6) {
      return json({ success: false, error: 'Password must be at least 6 characters' }, 400)
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    )

    // Step 1: Create auth user (service_role bypasses email confirmation)
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      const msg = authError.message?.toLowerCase() ?? ''
      const friendly = msg.includes('already registered') || msg.includes('already been registered')
        ? 'An account with this email already exists.'
        : 'Failed to create account. Please try again.'
      return json({ success: false, error: friendly }, 400)
    }

    const userId = authData.user.id

    // Step 2: Create university row
    const { data: university, error: uniError } = await admin
      .from('universities')
      .insert([{ name: universityName, city, admin_email: email }])
      .select()
      .single()

    if (uniError) {
      await admin.auth.admin.deleteUser(userId)
      return json({ success: false, error: `Failed to create university: ${uniError.message}` }, 400)
    }

    // Step 3: Create admins record
    const { error: adminError } = await admin
      .from('admins')
      .insert([{ id: userId, university_id: university.id, email, is_super_admin: false }])

    if (adminError) {
      await admin.from('universities').delete().eq('id', university.id)
      await admin.auth.admin.deleteUser(userId)
      return json({ success: false, error: `Failed to create admin record: ${adminError.message}` }, 400)
    }

    return json({ success: true, userId, universityId: university.id })
  } catch (error) {
    console.error('register-admin error:', error.message)
    return json({ success: false, error: error.message || 'Registration failed' }, 500)
  }
})
