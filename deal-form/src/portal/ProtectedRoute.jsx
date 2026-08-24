import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient.js'

async function checkAdmin(user) {
  if (!user) return false
  if (user.app_metadata?.is_admin === true) return true
  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  return data?.is_admin === true
}

/**
 * Wraps a route so only authenticated users can access it.
 * adminOnly=true additionally requires is_admin (app_metadata or profiles table).
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const [state, setState] = useState({ loading: true, user: null, isAdmin: false })

  useEffect(() => {
    let cancelled = false

    async function resolve(user) {
      if (!user) {
        if (!cancelled) setState({ loading: false, user: null, isAdmin: false })
        return
      }
      const isAdmin = await checkAdmin(user)
      if (!cancelled) setState({ loading: false, user, isAdmin })
    }

    if (sessionStorage.getItem('portalDemo')) {
      const demoRole = sessionStorage.getItem('portalDemoRole') ?? 'rep'
      setState({
        loading: false,
        user: { email: demoRole === 'admin' ? 'admin@demo.com' : 'rep@demo.com', demo: true },
        isAdmin: demoRole === 'admin',
      })
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (sessionStorage.getItem('portalDemo')) return
        resolve(session?.user ?? null)
      },
    )

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
