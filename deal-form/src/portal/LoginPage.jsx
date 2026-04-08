import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, supabaseConfigured } from './supabaseClient.js'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800;900&family=Barlow+Condensed:ital,wght@0,700;0,800;1,700&family=JetBrains+Mono:wght@400;500&display=swap');

  .lp-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .lp-wrap {
    min-height: 100vh;
    background: #0f172a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Barlow', sans-serif;
    padding: 24px 16px;
    position: relative;
    overflow: hidden;
  }
  .lp-wrap::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 70% 50% at 10% 0%, rgba(245,166,35,0.15) 0%, transparent 55%),
      radial-gradient(ellipse 50% 40% at 90% 100%, rgba(56,189,248,0.1) 0%, transparent 55%);
    pointer-events: none;
  }

  .lp-card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 20px;
    padding: 48px 40px 44px;
    width: 100%;
    max-width: 420px;
    position: relative;
    z-index: 1;
    box-shadow: 0 24px 64px rgba(0,0,0,0.5);
  }

  .lp-logo {
    text-align: center;
    margin-bottom: 32px;
  }
  .lp-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 100px;
    padding: 6px 16px;
    margin-bottom: 18px;
  }
  .lp-pill {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 100px;
  }
  .lp-pill-m { background: #1e293b; color: #64748b; }
  .lp-pill-x { color: #475569; font-size: 13px; }
  .lp-pill-b { background: #f5a623; color: #000; font-weight: 700; }
  .lp-h1 {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 32px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: -0.01em;
    color: #f1f5f9;
    line-height: 1.1;
  }
  .lp-h1 em { font-style: italic; color: #f5a623; }
  .lp-sub {
    font-size: 13px;
    color: #64748b;
    margin-top: 6px;
  }

  .lp-form { display: flex; flex-direction: column; gap: 18px; }

  .lp-field { display: flex; flex-direction: column; gap: 7px; }
  .lp-label {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #94a3b8;
  }
  .lp-input {
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 15px;
    font-family: 'Barlow', sans-serif;
    color: #f1f5f9;
    outline: none;
    transition: border-color 0.15s;
  }
  .lp-input:focus { border-color: #f5a623; }
  .lp-input::placeholder { color: #475569; }

  .lp-btn {
    background: #f5a623;
    color: #000;
    border: none;
    border-radius: 10px;
    padding: 14px 20px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
    margin-top: 4px;
  }
  .lp-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .lp-btn:active:not(:disabled) { transform: translateY(0); }
  .lp-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .lp-error {
    background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: #fca5a5;
    line-height: 1.5;
  }
  .lp-rule {
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, #f5a623, #38bdf8);
    border-radius: 2px;
    margin: 10px auto 0;
  }
  .lp-footer {
    text-align: center;
    margin-top: 28px;
    font-size: 12px;
    color: #475569;
  }
  .lp-footer a {
    color: #64748b;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .lp-forgot-link {
    background: none; border: none; padding: 0; cursor: pointer;
    font-size: 12px; color: #64748b; text-decoration: underline;
    text-underline-offset: 3px; text-align: right; align-self: flex-end;
    margin-top: -10px;
  }
  .lp-forgot-link:hover { color: #94a3b8; }
  .lp-success {
    background: rgba(74,222,128,0.08);
    border: 1px solid rgba(74,222,128,0.25);
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 13px;
    color: #4ade80;
    line-height: 1.5;
  }
  .lp-back-link {
    background: none; border: none; padding: 0; cursor: pointer;
    font-size: 13px; color: #64748b; text-decoration: underline;
    text-underline-offset: 3px; margin-top: 4px;
  }
  .lp-back-link:hover { color: #94a3b8; }

  /* ── DEMO MODE ── */
  .lp-demo-banner {
    background: rgba(245,166,35,0.08);
    border: 1px solid rgba(245,166,35,0.25);
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 22px;
    text-align: center;
  }
  .lp-demo-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #f5a623;
    margin-bottom: 10px;
  }
  .lp-demo-btns { display: flex; gap: 10px; justify-content: center; }
  .lp-demo-btn {
    flex: 1;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid rgba(245,166,35,0.3);
    background: rgba(245,166,35,0.08);
    font-family: 'Barlow', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #f5a623;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    line-height: 1.3;
  }
  .lp-demo-btn:hover { background: rgba(245,166,35,0.15); border-color: rgba(245,166,35,0.5); }
  .lp-demo-btn small { display: block; font-size: 10px; font-weight: 400; color: #78716c; margin-top: 2px; letter-spacing: 0.02em; }
  .lp-divider {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 4px 0 18px;
    color: #334155;
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .lp-divider::before, .lp-divider::after { content: ''; flex: 1; height: 1px; background: #1e3a5f; }
`

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // 'login' | 'forgot' | 'reset'
  const [view, setView] = useState('login')
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotStatus, setForgotStatus] = useState(null) // null | 'sent' | 'error'
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [resetStatus, setResetStatus] = useState(null) // null | 'success' | 'error'

  useEffect(() => {
    if (sessionStorage.getItem('portalDemo')) {
      const role = sessionStorage.getItem('portalDemoRole')
      navigate(role === 'admin' ? '/portal/admin' : '/portal/dashboard', { replace: true })
      return
    }
    // Detect recovery token in URL hash (from password reset email)
    const hash = window.location.hash
    if (hash.includes('type=recovery')) {
      setView('reset')
      return
    }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single()
        navigate(profile?.is_admin ? '/portal/admin' : '/portal/dashboard', { replace: true })
      }
    })
  }, [navigate])

  const enterDemo = (role) => {
    sessionStorage.setItem('portalDemo', 'true')
    sessionStorage.setItem('portalDemoRole', role)
    navigate(role === 'admin' ? '/portal/admin' : '/portal/dashboard', { replace: true })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (authError) throw authError

      // Check if admin → redirect to admin dashboard
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        navigate(profile?.is_admin ? '/portal/admin' : '/portal/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err?.message ?? 'Login failed. Check your email and password.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setLoading(true)
    setForgotStatus(null)
    const { error: err } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/portal/login`,
    })
    setLoading(false)
    setForgotStatus(err ? 'error' : 'sent')
    if (err) setError(err.message)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (newPassword !== newPasswordConfirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)
    if (err) {
      setError(err.message)
      setResetStatus('error')
    } else {
      setResetStatus('success')
      setTimeout(() => navigate('/portal/dashboard', { replace: true }), 2000)
    }
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="lp-wrap">
        <div className="lp-card">
          <div className="lp-logo">
            <div className="lp-badge">
              <span className="lp-pill lp-pill-m">Partner</span>
              <span className="lp-pill lp-pill-x">×</span>
              <span className="lp-pill lp-pill-b">Brobot</span>
            </div>
            <h1 className="lp-h1">Sales <em>Portal</em></h1>
            <div className="lp-rule" />
            <p className="lp-sub">Sign in to view your deals and commission.</p>
          </div>

          {!supabaseConfigured && (
            <>
              <div className="lp-demo-banner">
                <div className="lp-demo-label">Demo Mode — Supabase not connected yet</div>
                <div className="lp-demo-btns">
                  <button type="button" className="lp-demo-btn" onClick={() => enterDemo('rep')}>
                    Rep View
                    <small>See your deals & commission</small>
                  </button>
                  <button type="button" className="lp-demo-btn" onClick={() => enterDemo('admin')}>
                    Admin View
                    <small>Mark handoffs complete</small>
                  </button>
                </div>
              </div>
              <div className="lp-divider">or sign in</div>
            </>
          )}

          {view === 'login' && (
            <form className="lp-form" onSubmit={handleLogin}>
              {error && <div className="lp-error">{error}</div>}
              <div className="lp-field">
                <label className="lp-label" htmlFor="lp-email">Email</label>
                <input id="lp-email" className="lp-input" type="email" autoComplete="email" required placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="lp-field">
                <label className="lp-label" htmlFor="lp-password">Password</label>
                <input id="lp-password" className="lp-input" type="password" autoComplete="current-password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button type="button" className="lp-forgot-link" onClick={() => { setView('forgot'); setError(''); setForgotEmail(email); }}>
                Forgot password?
              </button>
              <button className="lp-btn" type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>
          )}

          {view === 'forgot' && (
            <form className="lp-form" onSubmit={handleForgot}>
              {forgotStatus === 'sent' ? (
                <div className="lp-success">Check your inbox — a password reset link has been sent to <strong>{forgotEmail}</strong>.</div>
              ) : (
                <>
                  {error && <div className="lp-error">{error}</div>}
                  <div className="lp-field">
                    <label className="lp-label">Your Email</label>
                    <input className="lp-input" type="email" required placeholder="you@company.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
                  </div>
                  <button className="lp-btn" type="submit" disabled={loading}>
                    {loading ? 'Sending…' : 'Send Reset Link →'}
                  </button>
                </>
              )}
              <button type="button" className="lp-back-link" onClick={() => { setView('login'); setError(''); setForgotStatus(null); }}>
                ← Back to sign in
              </button>
            </form>
          )}

          {view === 'reset' && (
            <form className="lp-form" onSubmit={handleReset}>
              {resetStatus === 'success' ? (
                <div className="lp-success">Password updated! Redirecting you to the portal…</div>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Choose a new password for your account.</p>
                  {error && <div className="lp-error">{error}</div>}
                  <div className="lp-field">
                    <label className="lp-label">New Password</label>
                    <input className="lp-input" type="password" required placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  </div>
                  <div className="lp-field">
                    <label className="lp-label">Confirm Password</label>
                    <input className="lp-input" type="password" required placeholder="••••••••" value={newPasswordConfirm} onChange={e => setNewPasswordConfirm(e.target.value)} />
                  </div>
                  <button className="lp-btn" type="submit" disabled={loading}>
                    {loading ? 'Saving…' : 'Set New Password →'}
                  </button>
                </>
              )}
            </form>
          )}

          <div className="lp-footer">
            Need access? Contact <a href="mailto:info@thebrobot.com">info@thebrobot.com</a>
          </div>
        </div>
      </div>
    </>
  )
}
