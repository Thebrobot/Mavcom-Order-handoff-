import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'No authorization header' }, 401)
    }

    const supabaseUrl    = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: 'Server misconfigured — missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }, 500)
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user: caller }, error: callerErr } = await adminClient.auth.getUser(jwt)
    if (callerErr || !caller) {
      return json({ error: callerErr?.message || 'Invalid session' }, 401)
    }

    const { data: profile } = await adminClient
      .from('profiles')
      .select('is_admin')
      .eq('id', caller.id)
      .single()

    const isAdmin = profile?.is_admin === true || caller.app_metadata?.is_admin === true
    if (!isAdmin) {
      return json({ error: 'Admin access required' }, 403)
    }

    const { email, full_name } = await req.json()
    if (!email) return json({ error: 'Email is required' }, 400)

    const origin = req.headers.get('origin')
      || req.headers.get('referer')?.replace(/\/+$/, '')
      || Deno.env.get('SITE_URL')
      || supabaseUrl

    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { full_name: full_name?.trim() || '' },
      redirectTo: `${origin}/portal/login`,
    })

    if (error) return json({ error: error.message }, 400)

    return json({ success: true, userId: data.user?.id })

  } catch (err) {
    return json({ error: err.message ?? String(err) }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}
