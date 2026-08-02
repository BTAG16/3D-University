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
    // Verify caller is an authenticated super admin
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return json({ success: false, error: 'Unauthorized' }, 401)

    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { authorization: authHeader } }, auth: { persistSession: false } }
    )

    const { data: { user }, error: userError } = await anonClient.auth.getUser()
    if (userError || !user) return json({ success: false, error: 'Unauthorized' }, 401)

    const { data: callerAdmin } = await anonClient
      .from('admins')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()

    if (!callerAdmin?.is_super_admin) return json({ success: false, error: 'Forbidden: super admin only' }, 403)

    let body: { universityId?: unknown }
    try { body = await req.json() }
    catch { return json({ success: false, error: 'Invalid JSON body' }, 400) }

    const universityId = typeof body.universityId === 'string' ? body.universityId : ''
    if (!universityId) return json({ success: false, error: 'universityId is required' }, 400)

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    )

    // Look up the admin's auth user ID before deleting
    const { data: adminRecord } = await adminClient
      .from('admins')
      .select('id')
      .eq('university_id', universityId)
      .maybeSingle()

    const authUserId = adminRecord?.id

    // Delete university (cascades to buildings, admins, events, etc.)
    const { error: deleteError } = await adminClient
      .from('universities')
      .delete()
      .eq('id', universityId)

    if (deleteError) {
      return json({ success: false, error: deleteError.message }, 400)
    }

    // Delete the Supabase auth user — required to free the email for re-registration
    if (authUserId) {
      const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(authUserId)
      if (authDeleteError) {
        // University is already deleted — log but don't fail the response
        console.error('Failed to delete auth user:', authDeleteError.message)
      }
    }

    return json({ success: true })
  } catch (error) {
    console.error('delete-admin-auth error:', error.message)
    return json({ success: false, error: error.message || 'Delete failed' }, 500)
  }
})
