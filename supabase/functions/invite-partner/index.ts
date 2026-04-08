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

    const supabaseUrl     = Deno.env.get('SUPABASE_URL')!
    const anonKey         = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Verify the calling user is an admin
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: profile, error: profileErr } = await callerClient
      .from('profiles')
      .select('is_admin')
      .single()

    if (profileErr || !profile?.is_admin) {
      return json({ error: 'Admin access required' }, 403)
    }

    // Parse request body
    const { email, full_name } = await req.json()
    if (!email) return json({ error: 'Email is required' }, 400)

    // Send the invite using the service role key
    const adminClient = createClient(supabaseUrl, serviceRoleKey)
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
