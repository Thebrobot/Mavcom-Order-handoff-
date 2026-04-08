import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient.js'

/**
 * Wraps a route so only authenticated users can access it.
 * adminOnly=true additionally requires profiles.is_admin = true.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const [state, setState] = useState({ loading: true, user: null, isAdmin: false })

  useEffect(() => {
    let cancelled = false

    async function check() {
      // Demo mode bypass — no real auth needed
      if (sessionStorage.getItem('portalDemo')) {
        const demoRole = sessionStorage.getItem('portalDemoRole') ?? 'rep'
        if (!cancelled) setState({ loading: false, user: { email: demoRole === 'admin' ? 'admin@demo.com' : 'rep@demo.com', demo: true }, isAdmin: demoRole === 'admin' })
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user ?? null

      if (!user || !adminOnly) {
        if (!cancelled) setState({ loading: false, user, isAdmin: false })
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!cancelled) setState({ loading: false, user, isAdmin: data?.is_admin ?? false })
    }

    check()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Never let auth state changes override an active demo session
      if (sessionStorage.getItem('portalDemo')) return
      if (!cancelled) {
        const user = session?.user ?? null
        setState(s => ({ ...s, user, loading: false }))
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [adminOnly])

  if (state.loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <div style={{ color: '#94a3b8', fontFamily: 'sans-serif', fontSize: 15 }}>Loading…</div>
      </div>
    )
  }

  if (!state.user) return <Navigate to="/portal/login" replace />
  if (adminOnly && !state.isAdmin) return <Navigate to="/portal/dashboard" replace />

  return children
}
