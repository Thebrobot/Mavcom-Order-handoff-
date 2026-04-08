import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'No authorization header' }, 401)
    }

    const supabaseUrl    = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Use service role client — bypasses RLS entirely
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Get caller's user ID from their JWT
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user: caller }, error: callerErr } = await adminClient.auth.getUser(jwt)
    if (callerErr || !caller) {
      return json({ error: 'Invalid session' }, 401)
    }

    // Check is_admin from profiles table (service role bypasses RLS)
    const { data: profile } = await adminClient
      .from('profiles')
      .select('is_admin')
      .eq('id', caller.id)
      .single()

    // Also accept app_metadata.is_admin as fallback
    const isAdmin = profile?.is_admin === true || caller.app_metadata?.is_admin === true
    if (!isAdmin) {
      return json({ error: 'Admin access required' }, 403)
    }

    // Parse request body
    const { email, full_name } = await req.json()
    if (!email) return json({ error: 'Email is required' }, 400)

    // Send the invite using the service role key
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { full_name: full_name?.trim() || '' },
      redirectTo: `${req.headers.get('origin') || 'https://your-vercel-app.vercel.app'}/portal/login`,
    })

    if (error) return json({ error: error.message }, 400)

    return json({ success: true, userId: data.user?.id })

  } catch (err) {
    return json({ error: err.message }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}
