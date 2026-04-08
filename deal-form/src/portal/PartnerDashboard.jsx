import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient.js'
import { DEMO_DEALS } from './demoData.js'
import DealModal from './DealModal.jsx'
import {
  RESIDUAL_TIER_THRESHOLD,
  RESIDUAL_BASE_RATE,
  RESIDUAL_TIER_RATE,
  calcProductCommissionTotal,
} from './commissionRules.js'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800;900&family=Barlow+Condensed:ital,wght@0,600;0,700;0,800;1,700&family=JetBrains+Mono:wght@400;500&display=swap');

  .pd-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .pd-wrap {
    min-height: 100vh;
    background: #0f172a;
    font-family: 'Barlow', sans-serif;
    color: #f1f5f9;
    overflow-x: hidden;
  }
  .pd-demo-bar {
    background: rgba(245,166,35,0.08);
    border-bottom: 1px solid rgba(245,166,35,0.2);
    padding: 8px 24px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #92400e;
    text-align: center;
    letter-spacing: 0.04em;
  }
  .pd-demo-bar strong { color: #f5a623; }

  .pd-nav {
    background: #1e293b;
    border-bottom: 1px solid #334155;
    padding: 0 24px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .pd-nav-brand { display: flex; align-items: center; gap: 10px; }
  .pd-nav-pill {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 3px 9px;
    border-radius: 100px;
  }
  .pd-nav-pill-b { background: #f5a623; color: #000; font-weight: 700; }
  .pd-nav-pill-p { background: #334155; color: #e2e8f0; }
  .pd-nav-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 17px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: #f1f5f9;
  }
  .pd-nav-actions { display: flex; align-items: center; gap: 12px; }
  .pd-nav-user { font-size: 13px; color: #cbd5e1; }
  .pd-btn-ghost {
    background: transparent;
    border: 1px solid #475569;
    border-radius: 8px;
    padding: 7px 14px;
    font-family: 'Barlow', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #e2e8f0;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .pd-btn-ghost:hover { border-color: #94a3b8; color: #f1f5f9; }

  .pd-body { max-width: 1200px; margin: 0 auto; padding: 36px 24px 80px; width: 100%; }

  .pd-page-head { margin-bottom: 32px; }
  .pd-page-h1 {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(26px, 4vw, 38px);
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: -0.01em;
    color: #f1f5f9;
  }
  .pd-page-h1 em { font-style: italic; color: #f5a623; }
  .pd-page-rule { width: 44px; height: 2px; background: linear-gradient(90deg, #f5a623, #38bdf8); border-radius: 2px; margin-top: 10px; }

  /* ── STATS ── */
  .pd-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(175px, 1fr)); gap: 16px; margin-bottom: 20px; }
  .pd-stat { background: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 20px 22px; }
  .pd-stat-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; }
  .pd-stat-value { font-family: 'Barlow Condensed', sans-serif; font-size: 28px; font-weight: 800; color: #f1f5f9; line-height: 1; }
  .pd-stat-value.accent { color: #f5a623; }
  .pd-stat-value.green { color: #4ade80; }
  .pd-stat-value.blue { color: #38bdf8; }
  .pd-stat-sub { font-size: 11px; color: #cbd5e1; margin-top: 5px; }

  /* ── TIER PROGRESS BAR ── */
  .pd-tier-card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 14px;
    padding: 20px 24px;
    margin-bottom: 20px;
  }
  .pd-tier-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 8px;
  }
  .pd-tier-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #94a3b8;
  }
  .pd-tier-rate {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 15px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .pd-tier-rate.unlocked { color: #4ade80; }
  .pd-tier-rate.locked { color: #f5a623; }
  .pd-tier-amounts {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-bottom: 10px;
  }
  .pd-tier-earned {
    font-family: 'JetBrains Mono', monospace;
    font-size: 22px;
    font-weight: 700;
    color: #f1f5f9;
  }
  .pd-tier-goal {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    color: #cbd5e1;
  }
  .pd-tier-bar-track {
    height: 8px;
    background: #0f172a;
    border-radius: 100px;
    overflow: hidden;
    border: 1px solid #334155;
  }
  .pd-tier-bar-fill {
    height: 100%;
    border-radius: 100px;
    transition: width 0.5s ease;
  }
  .pd-tier-bar-fill.locked { background: linear-gradient(90deg, #f5a623, #fb923c); }
  .pd-tier-bar-fill.unlocked { background: linear-gradient(90deg, #4ade80, #22d3ee); }
  .pd-tier-sub {
    font-size: 11px;
    color: #cbd5e1;
    margin-top: 7px;
  }

  /* ── TABLE ── */
  .pd-table-wrap { background: #1e293b; border: 1px solid #334155; border-radius: 14px; overflow: hidden; width: 100%; }
  .pd-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; }
  .pd-table-head {
    padding: 16px 20px 12px;
    border-bottom: 1px solid #334155;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .pd-table-title { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #e2e8f0; }
  .pd-search {
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 14px;
    font-family: 'Barlow', sans-serif;
    color: #f1f5f9;
    outline: none;
    width: 220px;
    transition: border-color 0.15s;
  }
  .pd-search:focus { border-color: #f5a623; }
  .pd-search::placeholder { color: #94a3b8; }

  .pd-table { width: 100%; border-collapse: collapse; min-width: 420px; }
  .pd-table th {
    padding: 10px 16px;
    text-align: left;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
    border-bottom: 1px solid #0f172a;
    background: #0f172a;
    white-space: nowrap;
  }
  .pd-table td {
    padding: 14px 16px;
    font-size: 14px;
    color: #f1f5f9;
    border-bottom: 1px solid rgba(51,65,85,0.4);
    vertical-align: middle;
    white-space: nowrap;
  }
  .pd-table tr:last-child td { border-bottom: none; }
  .pd-table tbody tr { cursor: pointer; transition: background 0.1s; }
  .pd-table tbody tr:hover td { background: rgba(245,166,35,0.04); }

  .pd-cell-primary { color: #f1f5f9; font-weight: 700; font-size: 14px; }
  .pd-cell-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }
  .pd-cell-mono { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #f1f5f9; }
  .pd-cell-upfront { color: #4ade80; font-weight: 700; font-family: 'JetBrains Mono', monospace; font-size: 15px; }

  .pd-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 100px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; white-space: nowrap;
  }
  .pd-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
  .pd-badge-active { background: rgba(74,222,128,0.1); color: #4ade80; border: 1px solid rgba(74,222,128,0.2); }
  .pd-badge-trial { background: rgba(56,189,248,0.1); color: #38bdf8; border: 1px solid rgba(56,189,248,0.2); }
  .pd-badge-pending { background: rgba(245,166,35,0.1); color: #f5a623; border: 1px solid rgba(245,166,35,0.2); }
  .pd-badge-cancelled { background: rgba(251,113,133,0.1); color: #fb7185; border: 1px solid rgba(251,113,133,0.3); }
  .pd-badge-paid { background: rgba(74,222,128,0.1); color: #4ade80; border: 1px solid rgba(74,222,128,0.2); }
  .pd-badge-unpaid { background: rgba(100,116,139,0.12); color: #cbd5e1; border: 1px solid rgba(100,116,139,0.25); }

  .pd-empty { padding: 60px 24px; text-align: center; }
  .pd-empty-icon { font-size: 38px; margin-bottom: 14px; opacity: 0.35; }
  .pd-empty-text { font-size: 15px; color: #cbd5e1; }
  .pd-loading { padding: 60px 24px; text-align: center; color: #cbd5e1; font-size: 15px; }

  /* Responsive: hide on tablet (< 900px) */
  @media (max-width: 900px) {
    .pd-hide-tablet { display: none; }
  }

  /* Responsive: hide on mobile (< 640px) */
  @media (max-width: 640px) {
    .pd-body { padding: 16px 12px 60px; width: 100%; }
    .pd-nav { padding: 0 14px; gap: 8px; }
    .pd-nav-brand { gap: 6px; }
    .pd-nav-pill-p { display: none; }
    .pd-nav-title { font-size: 14px; }
    .pd-nav-user { display: none; }
    .pd-btn-ghost { padding: 6px 10px; font-size: 12px; }
    .pd-search { width: 100%; }
    .pd-table-head { flex-direction: column; align-items: stretch; gap: 10px; }
    .pd-hide-mobile { display: none; }
    .pd-table th, .pd-table td { padding: 12px 10px; }
    .pd-stats { grid-template-columns: repeat(2, 1fr); }
    .pd-tier-header { flex-direction: column; align-items: flex-start; }
  }
`

function fmt(n) {
  if (n == null || !Number.isFinite(Number(n))) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(n))
}

function fmtDecimal(n) {
  if (n == null || !Number.isFinite(Number(n))) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n))
}

function fmtDate(d) {
  if (!d) return '—'
  try { return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
  catch { return d }
}

function relativeDate(d) {
  if (!d) return '—'
  try {
    const ms = Date.now() - new Date(d + 'T00:00:00').getTime()
    const days = Math.round(ms / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 30) return `${days}d ago`
    if (days < 60) return '~1 mo ago'
    return `${Math.round(days / 30)}mo ago`
  } catch { return d }
}

function dealStatus(deal) {
  if (deal.churned) return { label: 'Cancelled', cls: 'pd-badge-cancelled' }
  if (deal.handoff_complete) return { label: 'Active', cls: 'pd-badge-active' }
  return { label: 'Pending', cls: 'pd-badge-pending' }
}

function productNames(json) {
  if (!json) return '—'
  try {
    const items = Array.isArray(json) ? json : JSON.parse(json)
    return items.filter(p => p.productId).map(p => p.customLabel?.trim() || p.productLabel || p.productId).join(', ') || '—'
  } catch { return '—' }
}

export default function PartnerDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedDeal, setSelectedDeal] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (sessionStorage.getItem('portalDemo')) {
        const demoEmail = 'sarah@example.com'
        if (!cancelled) {
          setUser({ email: demoEmail, demo: true })
          setDeals(DEMO_DEALS.filter(d => d.rep_email === demoEmail))
          setLoading(false)
        }
        return
      }
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u || cancelled) return
      setUser(u)
      const { data, error } = await supabase.from('deals').select('*').order('submitted_at', { ascending: false })
      if (!cancelled) {
        if (error) console.error('[Portal] fetch deals:', error.message)
        setDeals(data ?? [])
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleSignOut = async () => {
    sessionStorage.removeItem('portalDemo')
    sessionStorage.removeItem('portalDemoRole')
    await supabase.auth.signOut()
    navigate('/portal/login', { replace: true })
  }

  const handleUpdate = (updated) => {
    setDeals(prev => prev.map(d => d.id === updated.id ? updated : d))
    setSelectedDeal(updated)
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return deals
    const q = search.toLowerCase()
    return deals.filter(d =>
      (d.client_name ?? '').toLowerCase().includes(q) ||
      (d.business_name ?? '').toLowerCase().includes(q) ||
      (d.closer_name ?? '').toLowerCase().includes(q)
    )
  }, [deals, search])

  // Commission totals
  const totalMrc = deals.reduce((s, d) => s + (Number(d.total_mrc) || 0), 0)
  const totalUpfront = deals.reduce((s, d) => s + (Number(d.upfront_commission ?? d.commission_amount) || 0), 0)
  const totalResidual = deals.reduce((s, d) => s + (Number(d.monthly_residual) || 0), 0)
  const paidCount = deals.filter(d => d.commission_paid).length

  // Tier progress — lifetime commissionable = sum of product flat commission totals across all deals
  // (the $130/$297/$794/$994 rates only — excludes setup fee portion, since residual is based on these)
  const lifetimeEarned = deals.reduce((s, d) => {
    try {
      const products = Array.isArray(d.products_json) ? d.products_json : JSON.parse(d.products_json || '[]')
      return s + calcProductCommissionTotal(products)
    } catch { return s }
  }, 0)
  const tierUnlocked = lifetimeEarned >= RESIDUAL_TIER_THRESHOLD
  const tierPct = Math.min(100, (lifetimeEarned / RESIDUAL_TIER_THRESHOLD) * 100)
  const remaining = Math.max(0, RESIDUAL_TIER_THRESHOLD - lifetimeEarned)

  return (
    <>
      <style>{STYLES}</style>
      <div className="pd-wrap">
        {user?.demo && (
          <div className="pd-demo-bar">
            <strong>Demo Mode</strong> — sample data only. Connect Supabase to see real deals.
          </div>
        )}
        <nav className="pd-nav">
          <div className="pd-nav-brand">
            <span className="pd-nav-pill pd-nav-pill-b">Brobot</span>
            <span className="pd-nav-pill pd-nav-pill-p">Partner Portal</span>
            <span className="pd-nav-title">My Deals</span>
          </div>
          <div className="pd-nav-actions">
            <span className="pd-nav-user">{user?.email}</span>
            <button className="pd-btn-ghost" onClick={() => navigate('/')}>+ Submit Deal</button>
            <button className="pd-btn-ghost" onClick={handleSignOut}>Sign out</button>
          </div>
        </nav>

        <div className="pd-body">
          <div className="pd-page-head">
            <h1 className="pd-page-h1">Partner <em>Dashboard</em></h1>
            <div className="pd-page-rule" />
          </div>

          {/* ── STAT CARDS ── */}
          <div className="pd-stats">
            <div className="pd-stat">
              <div className="pd-stat-label">Total Deals</div>
              <div className="pd-stat-value">{deals.length}</div>
              <div className="pd-stat-sub">submitted</div>
            </div>
            <div className="pd-stat">
              <div className="pd-stat-label">Total MRR</div>
              <div className="pd-stat-value accent">{fmt(totalMrc)}</div>
              <div className="pd-stat-sub">customer recurring</div>
            </div>
            <div className="pd-stat">
              <div className="pd-stat-label">Upfront Commission</div>
              <div className="pd-stat-value green">{fmt(totalUpfront)}</div>
              <div className="pd-stat-sub">{paidCount} of {deals.length} paid</div>
            </div>
            <div className="pd-stat">
              <div className="pd-stat-label">Monthly Residual</div>
              <div className="pd-stat-value blue">{fmtDecimal(totalResidual)}</div>
              <div className="pd-stat-sub">per month (active accts)</div>
            </div>
          </div>

          {/* ── TIER PROGRESS BAR ── */}
          <div className="pd-tier-card">
            <div className="pd-tier-header">
              <span className="pd-tier-label">Residual Tier Progress</span>
              <span className={`pd-tier-rate ${tierUnlocked ? 'unlocked' : 'locked'}`}>
                {tierUnlocked
                  ? `${Math.round(RESIDUAL_TIER_RATE * 100)}% Residual — Tier Unlocked`
                  : `Current Rate: ${Math.round(RESIDUAL_BASE_RATE * 100)}%  →  ${Math.round(RESIDUAL_TIER_RATE * 100)}% at $${(RESIDUAL_TIER_THRESHOLD / 1000).toFixed(0)}K`}
              </span>
            </div>
            <div className="pd-tier-amounts">
              <span className="pd-tier-earned">{fmt(lifetimeEarned)}</span>
              <span className="pd-tier-goal">/ ${(RESIDUAL_TIER_THRESHOLD / 1000).toFixed(0)}K lifetime earned</span>
            </div>
            <div className="pd-tier-bar-track">
              <div
                className={`pd-tier-bar-fill ${tierUnlocked ? 'unlocked' : 'locked'}`}
                style={{ width: `${tierPct}%` }}
              />
            </div>
            <div className="pd-tier-sub">
              {tierUnlocked
                ? 'You have unlocked the 30% residual rate on all active accounts.'
                : `${fmt(remaining)} more in paid commission to unlock the 30% residual rate.`}
            </div>
          </div>

          {/* ── DEALS TABLE ── */}
          <div className="pd-table-wrap">
            <div className="pd-table-head">
              <span className="pd-table-title">Submitted Deals</span>
              <input className="pd-search" type="search" placeholder="Search client, business, closer…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {loading ? (
              <div className="pd-loading">Loading your deals…</div>
            ) : filtered.length === 0 ? (
              <div className="pd-empty">
                <div className="pd-empty-icon">📋</div>
                <div className="pd-empty-text">{deals.length === 0 ? 'No deals submitted yet.' : 'No results match your search.'}</div>
              </div>
            ) : (
              <div className="pd-table-scroll">
              <table className="pd-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th className="pd-hide-mobile">Services</th>
                    <th>Status</th>
                    <th className="pd-hide-tablet">First Payment</th>
                    <th>Commission</th>
                    <th className="pd-hide-mobile">Residual</th>
                    <th>Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(deal => {
                    const status = dealStatus(deal)
                    return (
                      <tr key={deal.id} onClick={() => setSelectedDeal(deal)}>
                        <td>
                          <div className="pd-cell-primary">
                            {deal.client_name || '—'}
                            {deal.multi_location && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', padding: '2px 7px', borderRadius: 100, background: 'rgba(168,85,247,0.12)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.25)', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>MULTI-LOC</span>}
                          </div>
                          <div className="pd-cell-sub">{deal.business_name || '—'}</div>
                        </td>
                        <td className="pd-hide-mobile">
                          <span style={{ fontSize: 13, color: '#f1f5f9' }}>{productNames(deal.products_json)}</span>
                        </td>
                        <td>
                          <span className={`pd-badge ${status.cls}`}>
                            <span className="pd-badge-dot" />
                            {status.label}
                          </span>
                        </td>
                        <td className="pd-hide-tablet">
                          <span className="pd-cell-mono">{fmtDate(deal.first_payment_date)}</span>
                        </td>
                        <td>
                          <span className="pd-cell-upfront">{fmt(deal.upfront_commission ?? deal.commission_amount)}</span>
                        </td>
                        <td className="pd-hide-mobile">
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#38bdf8', fontWeight: 700 }}>
                            {fmtDecimal(deal.monthly_residual)}<span style={{ color: '#94a3b8', fontWeight: 400 }}>/mo</span>
                          </span>
                        </td>
                        <td>
                          <span className={`pd-badge ${deal.commission_paid ? 'pd-badge-paid' : 'pd-badge-unpaid'}`}>
                            {deal.commission_paid ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedDeal && (
        <DealModal
          deal={selectedDeal}
          isAdmin={false}
          onClose={() => setSelectedDeal(null)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  )
}
