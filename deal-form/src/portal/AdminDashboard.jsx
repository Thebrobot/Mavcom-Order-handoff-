import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient.js'
import { DEMO_DEALS } from './demoData.js'
import DealModal from './DealModal.jsx'
import {
  RESIDUAL_TIER_THRESHOLD,
  RESIDUAL_BASE_RATE,
  RESIDUAL_TIER_RATE,
  STRIPE_FEE_MULTIPLIER,
  SETUP_FEE_COMMISSION_PCT,
  calcProductCommissionTotal,
} from './commissionRules.js'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800;900&family=Barlow+Condensed:ital,wght@0,600;0,700;0,800;1,700&family=JetBrains+Mono:wght@400;500&display=swap');

  .ad-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .ad-wrap {
    min-height: 100vh;
    background: #0f172a;
    font-family: 'Barlow', sans-serif;
    color: #f1f5f9;
    overflow-x: hidden;
  }
  .ad-demo-bar {
    background: rgba(245,166,35,0.08);
    border-bottom: 1px solid rgba(245,166,35,0.2);
    padding: 8px 24px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #92400e;
    text-align: center;
    letter-spacing: 0.04em;
  }
  .ad-demo-bar strong { color: #f5a623; }

  .ad-nav {
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
  .ad-nav-brand { display: flex; align-items: center; gap: 10px; }
  .ad-nav-pill {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 3px 9px;
    border-radius: 100px;
  }
  .ad-nav-pill-b { background: #f5a623; color: #000; font-weight: 700; }
  .ad-nav-pill-a { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
  .ad-nav-title { font-family: 'Barlow Condensed', sans-serif; font-size: 17px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em; color: #f1f5f9; }
  .ad-nav-actions { display: flex; align-items: center; gap: 12px; }
  .ad-nav-user { font-size: 13px; color: #f1f5f9; }
  .ad-btn-ghost {
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
  .ad-btn-ghost:hover { border-color: #94a3b8; color: #f1f5f9; }

  /* ── PARTNER VIEW DROPDOWN ── */
  .ad-partner-drop-wrap { position: relative; }
  .ad-partner-drop-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 10px;
    min-width: 220px;
    z-index: 100;
    box-shadow: 0 12px 32px rgba(0,0,0,0.5);
    overflow: hidden;
  }
  .ad-partner-drop-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #64748b;
    padding: 10px 14px 6px;
  }
  .ad-partner-drop-item {
    display: block; width: 100%; text-align: left;
    padding: 10px 14px; background: none; border: none;
    font-family: 'Barlow', sans-serif; font-size: 13px; font-weight: 600;
    color: #e2e8f0; cursor: pointer; transition: background 0.12s;
  }
  .ad-partner-drop-item:hover { background: rgba(255,255,255,0.05); color: #f1f5f9; }
  .ad-partner-drop-item small { display: block; font-size: 11px; font-weight: 400; color: #64748b; margin-top: 2px; }

  /* ── PARTNER SUBVIEW BANNER ── */
  .ad-subview-banner {
    background: rgba(56,189,248,0.07);
    border-bottom: 1px solid rgba(56,189,248,0.2);
    padding: 10px 24px;
    display: flex; align-items: center; gap: 12px;
    font-size: 13px; color: #7dd3fc;
    font-family: 'Barlow', sans-serif;
  }
  .ad-subview-banner strong { color: #f1f5f9; font-weight: 700; }
  .ad-subview-exit {
    margin-left: auto; background: none;
    border: 1px solid rgba(56,189,248,0.3);
    border-radius: 7px; padding: 5px 12px;
    font-size: 12px; font-weight: 700; color: #7dd3fc;
    cursor: pointer; font-family: 'Barlow', sans-serif;
    transition: background 0.12s;
  }
  .ad-subview-exit:hover { background: rgba(56,189,248,0.1); }

  /* ── PARTNER SUBVIEW CONTENT ── */
  .ad-subview-stats {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 14px; margin-bottom: 24px;
  }
  .ad-subview-tier {
    background: #1e293b; border: 1px solid #334155; border-radius: 14px;
    padding: 18px 20px; margin-bottom: 24px;
  }
  .ad-subview-tier-label {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8; margin-bottom: 10px;
  }
  .ad-subview-tier-bar-bg {
    background: #0f172a; border-radius: 100px; height: 8px; overflow: hidden; margin-bottom: 6px;
  }
  .ad-subview-tier-bar-fill {
    height: 100%; border-radius: 100px;
    background: linear-gradient(90deg, #f5a623, #fb923c);
    transition: width 0.5s ease;
  }
  .ad-subview-tier-nums {
    display: flex; justify-content: space-between;
    font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #94a3b8;
  }

  .ad-body { max-width: 1400px; margin: 0 auto; padding: 36px 24px 80px; width: 100%; }

  .ad-page-head { margin-bottom: 32px; }
  .ad-page-h1 { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(26px, 4vw, 38px); font-weight: 800; text-transform: uppercase; letter-spacing: -0.01em; color: #f1f5f9; }
  .ad-page-h1 em { font-style: italic; color: #f5a623; }
  .ad-page-rule { width: 44px; height: 2px; background: linear-gradient(90deg, #f5a623, #38bdf8); border-radius: 2px; margin-top: 10px; }

  .ad-stats-section { margin-bottom: 28px; }
  .ad-stats-section-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #f1f5f9;
    margin-bottom: 10px;
    padding-left: 2px;
  }
  .ad-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; }
  .ad-stat { background: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 20px 22px; }
  .ad-stat-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #f1f5f9; margin-bottom: 8px; }
  .ad-stat-value { font-family: 'Barlow Condensed', sans-serif; font-size: 28px; font-weight: 800; color: #f1f5f9; line-height: 1; }
  .ad-stat-value.accent { color: #f5a623; }
  .ad-stat-value.green { color: #4ade80; }
  .ad-stat-sub { font-size: 11px; color: #f1f5f9; margin-top: 5px; }

  .ad-filters { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 16px; }
  .ad-search {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 9px 13px;
    font-size: 13px;
    font-family: 'Barlow', sans-serif;
    color: #f1f5f9;
    outline: none;
    width: 260px;
    transition: border-color 0.15s;
  }
  .ad-search:focus { border-color: #f5a623; }
  .ad-search::placeholder { color: #94a3b8; }
  .ad-filter-btn {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 8px 14px;
    font-family: 'Barlow', sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #e2e8f0;
    cursor: pointer;
    transition: all 0.15s;
  }
  .ad-filter-btn.active { background: rgba(245,166,35,0.1); border-color: rgba(245,166,35,0.3); color: #f5a623; }
  .ad-filter-count { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #f1f5f9; margin-left: auto; }

  /* ── PAYOUT REPORT BAR ── */
  .ad-payout-bar {
    display: flex; flex-wrap: wrap; align-items: center; gap: 12px;
    background: #1e293b; border: 1px solid #334155; border-radius: 12px;
    padding: 14px 18px; margin-bottom: 16px;
  }
  .ad-payout-label {
    font-family: 'Barlow', sans-serif; font-size: 12px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase; color: #f1f5f9;
    white-space: nowrap;
  }
  .ad-payout-month {
    background: #0f172a; border: 1px solid #334155; border-radius: 8px;
    padding: 8px 12px; font-size: 13px; font-family: 'Barlow', sans-serif;
    color: #f1f5f9; outline: none; cursor: pointer;
    color-scheme: dark;
  }
  .ad-payout-month:focus { border-color: #f5a623; }
  .ad-payout-summary {
    font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #f1f5f9;
  }
  .ad-payout-summary strong { color: #f1f5f9; }
  .ad-payout-download {
    margin-left: auto; display: flex; align-items: center; gap: 7px;
    background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.25);
    border-radius: 8px; padding: 8px 16px; cursor: pointer;
    font-family: 'Barlow', sans-serif; font-size: 12px; font-weight: 700;
    letter-spacing: 0.05em; text-transform: uppercase; color: #4ade80;
    transition: all 0.15s;
  }
  .ad-payout-download:hover { background: rgba(74,222,128,0.18); }
  .ad-payout-download:disabled { opacity: 0.4; cursor: default; }
  .ad-payout-mini-table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
  .ad-payout-mini-table th { text-align: left; padding: 6px 10px; color: #f1f5f9; font-weight: 600; border-bottom: 1px solid #1e293b; }
  .ad-payout-mini-table td { padding: 7px 10px; border-bottom: 1px solid #1e293b; color: #e2e8f0; }
  .ad-payout-mini-table tr:last-child td { border-bottom: none; }
  .ad-payout-mini-wrap { background: #0f172a; border-radius: 10px; overflow: hidden; margin-top: 4px; width: 100%; }

  .ad-table-wrap { background: #1e293b; border: 1px solid #334155; border-radius: 14px; overflow: hidden; width: 100%; }
  .ad-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; }
  .ad-table { width: 100%; border-collapse: collapse; min-width: 420px; }
  .ad-table th {
    padding: 10px 16px;
    text-align: left;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #f1f5f9;
    border-bottom: 1px solid #0f172a;
    background: #0f172a;
    white-space: nowrap;
  }
  .ad-table td {
    padding: 14px 16px;
    font-size: 14px;
    color: #f1f5f9;
    border-bottom: 1px solid rgba(51,65,85,0.4);
    vertical-align: middle;
    white-space: nowrap;
  }
  .ad-table tr:last-child td { border-bottom: none; }
  .ad-table tbody tr { cursor: pointer; transition: background 0.1s; }
  .ad-table tbody tr:hover td { background: rgba(245,166,35,0.04); }

  .ad-cell-primary { color: #f1f5f9; font-weight: 700; font-size: 14px; }
  .ad-cell-sub { font-size: 12px; color: #f1f5f9; margin-top: 2px; }
  .ad-cell-rep { font-size: 14px; color: #f1f5f9; font-weight: 700; }
  .ad-cell-mono { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #f1f5f9; }
  .ad-cell-commission { color: #4ade80; font-weight: 700; font-family: 'JetBrains Mono', monospace; font-size: 15px; }

  .ad-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 100px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; white-space: nowrap;
  }
  .ad-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
  .ad-badge-active { background: rgba(74,222,128,0.1); color: #4ade80; border: 1px solid rgba(74,222,128,0.2); }
  .ad-badge-trial { background: rgba(56,189,248,0.1); color: #38bdf8; border: 1px solid rgba(56,189,248,0.2); }
  .ad-badge-pending { background: rgba(245,166,35,0.1); color: #f5a623; border: 1px solid rgba(245,166,35,0.2); }
  .ad-badge-cancelled { background: rgba(251,113,133,0.1); color: #fb7185; border: 1px solid rgba(251,113,133,0.3); }

  /* Paid dropdown */
  .ad-paid-select {
    background: transparent;
    border: 1px solid transparent;
    border-radius: 100px;
    padding: 5px 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
    outline: none;
    transition: all 0.15s;
    -webkit-appearance: none;
    appearance: none;
  }
  .ad-paid-select.paid { background: rgba(74,222,128,0.1); border-color: rgba(74,222,128,0.25); color: #4ade80; }
  .ad-paid-select.unpaid { background: rgba(100,116,139,0.12); border-color: rgba(100,116,139,0.25); color: #cbd5e1; }
  .ad-paid-select.status-active { background: rgba(74,222,128,0.1); border-color: rgba(74,222,128,0.25); color: #4ade80; }
  .ad-paid-select.status-pending { background: rgba(245,166,35,0.1); border-color: rgba(245,166,35,0.3); color: #f5a623; }
  .ad-paid-select.status-cancelled { background: rgba(251,113,133,0.1); border-color: rgba(251,113,133,0.3); color: #fb7185; }
  .ad-paid-select:hover { opacity: 0.8; }

  /* Paid button used in partner subview */
  .ad-paid-badge {
    background: transparent; border: 1px solid transparent; border-radius: 100px;
    padding: 5px 12px; font-family: 'JetBrains Mono', monospace; font-size: 11px;
    font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; cursor: pointer;
    outline: none; transition: all 0.15s;
  }
  .ad-paid-badge.paid { background: rgba(74,222,128,0.1); border-color: rgba(74,222,128,0.25); color: #4ade80; }
  .ad-paid-badge.unpaid { background: rgba(100,116,139,0.12); border-color: rgba(100,116,139,0.25); color: #cbd5e1; }

  .ad-products-list { font-size: 13px; color: #f1f5f9; line-height: 1.5; max-width: 220px; white-space: normal; }
  .ad-empty { padding: 60px 24px; text-align: center; }
  .ad-empty-icon { font-size: 38px; margin-bottom: 14px; opacity: 0.35; }
  .ad-empty-text { font-size: 15px; color: #f1f5f9; }
  .ad-loading { padding: 60px 24px; text-align: center; color: #f1f5f9; font-size: 15px; }

  /* Responsive: hide on tablet (< 900px) */
  @media (max-width: 900px) {
    .ad-hide-tablet { display: none; }
  }

  /* Responsive: hide on mobile (< 640px) */
  @media (max-width: 640px) {
    .ad-body { padding: 16px 12px 60px; width: 100%; }
    .ad-nav { padding: 0 14px; gap: 8px; }
    .ad-nav-brand { gap: 6px; }
    .ad-nav-pill-a { display: none; }
    .ad-nav-title { font-size: 14px; }
    .ad-nav-user { display: none; }
    .ad-btn-ghost { padding: 6px 10px; font-size: 12px; }
    .ad-search { width: 100%; }
    .ad-filters { flex-direction: column; align-items: stretch; gap: 8px; }
    .ad-filter-count { margin-left: 0; }
    .ad-hide-mobile { display: none; }
    .ad-table th, .ad-table td { padding: 12px 10px; }
    .ad-stats { grid-template-columns: repeat(2, 1fr); }
    .ad-stats-section { margin-bottom: 20px; }
  }

  /* ── INVITE MODAL ── */
  .ad-invite-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .ad-invite-modal {
    background: #1e293b; border: 1px solid #334155; border-radius: 16px;
    padding: 32px; width: 100%; max-width: 420px;
  }
  .ad-invite-title {
    font-family: 'Barlow', sans-serif; font-size: 20px; font-weight: 800;
    color: #f1f5f9; margin-bottom: 6px;
  }
  .ad-invite-sub {
    font-size: 13px; color: #f1f5f9; margin-bottom: 24px;
  }
  .ad-invite-field { margin-bottom: 16px; }
  .ad-invite-label {
    display: block; font-family: 'JetBrains Mono', monospace; font-size: 11px;
    font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
    color: #f1f5f9; margin-bottom: 7px;
  }
  .ad-invite-input {
    width: 100%; background: #0f172a; border: 1px solid #334155; border-radius: 8px;
    padding: 10px 14px; font-size: 14px; font-family: 'Barlow', sans-serif;
    color: #f1f5f9; outline: none; box-sizing: border-box;
  }
  .ad-invite-input:focus { border-color: #f5a623; }
  .ad-invite-actions { display: flex; gap: 10px; margin-top: 24px; }
  .ad-invite-submit {
    flex: 1; background: #f5a623; border: none; border-radius: 8px;
    padding: 11px; font-family: 'Barlow', sans-serif; font-size: 14px;
    font-weight: 700; color: #0f172a; cursor: pointer; transition: opacity 0.15s;
  }
  .ad-invite-submit:hover { opacity: 0.85; }
  .ad-invite-submit:disabled { opacity: 0.4; cursor: default; }
  .ad-invite-cancel {
    background: transparent; border: 1px solid #334155; border-radius: 8px;
    padding: 11px 20px; font-family: 'Barlow', sans-serif; font-size: 14px;
    font-weight: 600; color: #f1f5f9; cursor: pointer; transition: border-color 0.15s;
  }
  .ad-invite-cancel:hover { border-color: #94a3b8; }
  .ad-invite-success {
    text-align: center; padding: 16px 0;
  }
  .ad-invite-success-icon { font-size: 40px; margin-bottom: 12px; }
  .ad-invite-success-msg { font-size: 15px; color: #4ade80; font-weight: 600; margin-bottom: 6px; }
  .ad-invite-success-sub { font-size: 13px; color: #f1f5f9; }
`

function fmt(n) {
  if (n == null || !Number.isFinite(Number(n))) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(n))
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
  if (deal.churned) return { label: 'Cancelled', cls: 'ad-badge-cancelled', selectCls: 'status-cancelled' }
  if (deal.handoff_complete) return { label: 'Active', cls: 'ad-badge-active', selectCls: 'status-active' }
  return { label: 'Pending', cls: 'ad-badge-pending', selectCls: 'status-pending' }
}

function productNames(json) {
  if (!json) return '—'
  try {
    const items = Array.isArray(json) ? json : JSON.parse(json)
    return items.filter(p => p.productId).map(p => p.customLabel?.trim() || p.productLabel || p.productId).join('\n') || '—'
  } catch { return '—' }
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteStatus, setInviteStatus] = useState(null) // null | 'sending' | 'success' | 'error'
  const [inviteError, setInviteError] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedDeal, setSelectedDeal] = useState(null)
  const [payoutMonth, setPayoutMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [payoutPartner, setPayoutPartner] = useState('all')
  const [viewAsPartner, setViewAsPartner] = useState(null) // {email, name} or null
  const [partnerDropOpen, setPartnerDropOpen] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!partnerDropOpen) return
    const close = () => setPartnerDropOpen(false)
    document.addEventListener('click', close, { once: true })
    return () => document.removeEventListener('click', close)
  }, [partnerDropOpen])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (sessionStorage.getItem('portalDemo')) {
        if (!cancelled) {
          setUser({ email: 'admin@demo.com', demo: true })
          setDeals([...DEMO_DEALS])
          setLoading(false)
        }
        return
      }
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u || cancelled) return
      setUser(u)
      const { data, error } = await supabase.from('deals').select('*').order('submitted_at', { ascending: false })
      if (!cancelled) {
        if (error) console.error('[Admin] fetch deals:', error.message)
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

  // Toggle paid directly from the table dropdown (stop propagation so row click doesn't open modal)
  const togglePaid = async (e, deal) => {
    e.stopPropagation()
    const nowPaid = !deal.commission_paid
    const updates = {
      commission_paid: nowPaid,
      commission_paid_at: nowPaid ? new Date().toISOString() : null,
      commission_paid_by: nowPaid ? user?.email : null,
    }

    if (sessionStorage.getItem('portalDemo')) {
      handleUpdate({ ...deal, ...updates })
      return
    }

    const { data, error } = await supabase.from('deals').update(updates).eq('id', deal.id).select().single()
    if (!error && data) handleUpdate(data)
  }

  const toggleStatus = async (e, deal) => {
    e.stopPropagation()
    const val = e.target.value
    const updates = {
      churned:          val === 'cancelled',
      handoff_complete: val === 'active',
      handoff_completed_at: val === 'active' && !deal.handoff_complete ? new Date().toISOString() : (val !== 'active' ? null : deal.handoff_completed_at),
      handoff_completed_by: val === 'active' && !deal.handoff_complete ? (user?.email ?? null) : (val !== 'active' ? null : deal.handoff_completed_by),
    }

    if (sessionStorage.getItem('portalDemo')) {
      handleUpdate({ ...deal, ...updates })
      return
    }

    const { data, error } = await supabase.from('deals').update(updates).eq('id', deal.id).select().single()
    if (!error && data) handleUpdate(data)
  }

  const sendInvite = async (e) => {
    e.preventDefault()
    setInviteStatus('sending')
    setInviteError('')
    try {
      const { data, error } = await supabase.functions.invoke('invite-partner', {
        body: { email: inviteEmail.trim(), full_name: inviteName.trim() },
      })
      if (error) {
        // Extract the actual message from the function response body if available
        const detail = data?.error || error.message
        throw new Error(detail)
      }
      setInviteStatus('success')
      setInviteName('')
      setInviteEmail('')
    } catch (err) {
      setInviteStatus('error')
      setInviteError(err.message || 'Something went wrong.')
    }
  }

  const closeInvite = () => {
    setInviteOpen(false)
    setInviteStatus(null)
    setInviteError('')
    setInviteName('')
    setInviteEmail('')
  }

  const filtered = useMemo(() => {
    let list = deals
    if (filter === 'pending') list = list.filter(d => !d.handoff_complete)
    if (filter === 'active') list = list.filter(d => d.handoff_complete)
    if (filter === 'unpaid') list = list.filter(d => !d.commission_paid)
    if (filter === 'paid') list = list.filter(d => d.commission_paid)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(d =>
        (d.client_name ?? '').toLowerCase().includes(q) ||
        (d.business_name ?? '').toLowerCase().includes(q) ||
        (d.rep_name ?? '').toLowerCase().includes(q) ||
        (d.rep_email ?? '').toLowerCase().includes(q) ||
        (d.closer_name ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [deals, filter, search])

  const totalMrc = deals.reduce((s, d) => s + (Number(d.total_mrc) || 0), 0)
  const totalUpfront = deals.reduce((s, d) => s + (Number(d.upfront_commission ?? d.commission_amount) || 0), 0)
  const totalResidual = deals.reduce((s, d) => s + (Number(d.monthly_residual) || 0), 0)
  // Commissionable MRR = product flat commission totals only (upfront minus setup bonus)
  const totalCommissionableMrr = deals.reduce((s, d) => {
    const setupBonus = ((Number(d.total_setup) || 0) / STRIPE_FEE_MULTIPLIER) * SETUP_FEE_COMMISSION_PCT
    return s + Math.max(0, (Number(d.upfront_commission ?? d.commission_amount) || 0) - setupBonus)
  }, 0)
  // Total lines = sum of lineQty across all product rows on all deals
  const totalLines = deals.reduce((s, d) => {
    try {
      const products = Array.isArray(d.products_json) ? d.products_json : JSON.parse(d.products_json || '[]')
      return s + products.reduce((ps, p) => ps + (parseInt(p.lineQty) || 0), 0)
    } catch { return s }
  }, 0)
  const activeCount  = deals.filter(d => d.handoff_complete).length
  const pendingCount = deals.filter(d => !d.handoff_complete).length
  const commissionPendingDeals = deals.filter(d => !d.commission_paid)
  const unpaidCount  = commissionPendingDeals.length
  const commissionPendingTotal = commissionPendingDeals.reduce((s, d) => s + (parseFloat(d.upfront_commission) || 0), 0)

  // ── PAYOUT REPORT helpers ──────────────────────────────────────────────────
  // Returns "YYYY-MM" shifted by n months
  function addMonths(yyyyMM, n) {
    const [y, m] = yyyyMM.split('-').map(Number)
    const d = new Date(y, m - 1 + n, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  function dealPayoutMonth(deal) {
    const src = deal.payout_date || (() => {
      if (!deal.first_payment_date) return null
      const d = new Date(deal.first_payment_date + 'T00:00:00')
      d.setMonth(d.getMonth() + 1)
      return d.toISOString().slice(0, 10)
    })()
    return src ? src.slice(0, 7) : null
  }

  const payoutReportRows = deals.reduce((rows, deal) => {
    const upfrontDue  = !deal.commission_paid && dealPayoutMonth(deal) === payoutMonth
    // Residual starts on customer's 2nd payment (M+2 from first_payment_date).
    // We pay with 1-month lag, so first residual payout is at M+2.
    // A churned deal stops earning residual.
    const residualDue = !deal.churned && deal.handoff_complete && deal.first_payment_date &&
                        addMonths(deal.first_payment_date.slice(0, 7), 2) <= payoutMonth
    if (!upfrontDue && !residualDue) return rows

    let products = []
    try { products = Array.isArray(deal.products_json) ? deal.products_json : JSON.parse(deal.products_json || '[]') } catch {}
    const productFlat = calcProductCommissionTotal(products)
    const tierUnlocked = deals
      .filter(d => d.rep_email === deal.rep_email)
      .reduce((s, d) => {
        try {
          const p = Array.isArray(d.products_json) ? d.products_json : JSON.parse(d.products_json || '[]')
          return s + calcProductCommissionTotal(p)
        } catch { return s }
      }, 0) >= RESIDUAL_TIER_THRESHOLD

    const upfrontTotal   = upfrontDue ? (parseFloat(deal.upfront_commission) || 0) : 0
    const productComm    = upfrontDue ? productFlat : 0
    const setupFeeComm   = upfrontDue ? Math.max(0, upfrontTotal - productFlat) : 0

    rows.push({
      deal,
      upfront:      upfrontTotal,
      productComm,
      setupFeeComm,
      residual: residualDue ? productFlat * (tierUnlocked ? RESIDUAL_TIER_RATE : RESIDUAL_BASE_RATE) : 0,
    })
    return rows
  }, [])

  // Unique partner list derived from ALL deals (for the selector)
  const payoutPartnerOptions = useMemo(() => {
    const seen = new Map()
    deals.forEach(d => { if (d.rep_email && !seen.has(d.rep_email)) seen.set(d.rep_email, d.rep_name || d.rep_email) })
    return Array.from(seen.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [deals])

  const payoutReportFiltered = payoutPartner === 'all'
    ? payoutReportRows
    : payoutReportRows.filter(r => r.deal.rep_email === payoutPartner)

  const payoutReportTotal = payoutReportFiltered.reduce((s, r) => s + r.upfront + r.residual, 0)

  function downloadPayoutCSV() {
    const monthLabel = new Date(payoutMonth + '-02').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const header = ['Partner', 'Partner Email', 'Client', 'Business', 'Services', 'Payout Types', 'Product Comm ($)', 'Setup Fee Comm ($)', 'Upfront Total ($)', 'Residual ($)', 'Total Due ($)']
    const rows = payoutReportFiltered.map(r => {
      let products = []
      try { products = Array.isArray(r.deal.products_json) ? r.deal.products_json : JSON.parse(r.deal.products_json || '[]') } catch {}
      const services = products.map(p => p.productLabel || p.productId).join(' | ')
      const types = [r.upfront > 0 && 'Upfront', r.residual > 0 && 'Residual'].filter(Boolean).join(' + ')
      return [
        r.deal.rep_name || '',
        r.deal.rep_email || '',
        r.deal.client_name || '',
        r.deal.business_name || '',
        services,
        types,
        r.productComm.toFixed(2),
        r.setupFeeComm.toFixed(2),
        r.upfront.toFixed(2),
        r.residual.toFixed(2),
        (r.upfront + r.residual).toFixed(2),
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    })

    // Partner subtotals
    const byPartner = {}
    payoutReportFiltered.forEach(r => {
      const key = r.deal.rep_email
      if (!byPartner[key]) byPartner[key] = { name: r.deal.rep_name || r.deal.rep_email, productComm: 0, setupFeeComm: 0, upfront: 0, residual: 0 }
      byPartner[key].productComm  += r.productComm
      byPartner[key].setupFeeComm += r.setupFeeComm
      byPartner[key].upfront      += r.upfront
      byPartner[key].residual     += r.residual
    })
    const subtotals = Object.values(byPartner).map(p =>
      `"SUBTOTAL — ${p.name}","","","","","","${p.productComm.toFixed(2)}","${p.setupFeeComm.toFixed(2)}","${p.upfront.toFixed(2)}","${p.residual.toFixed(2)}","${(p.upfront + p.residual).toFixed(2)}"`
    )

    const csv = [
      `"Payout Report — ${monthLabel}"`,
      header.map(h => `"${h}"`).join(','),
      ...rows,
      '',
      '"--- Partner Subtotals ---"',
      ...subtotals,
      `"","","","","","TOTAL","","","${payoutReportTotal.toFixed(2)}"`,
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `payout-report-${payoutMonth}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="ad-wrap">
        {user?.demo && (
          <div className="ad-demo-bar">
            <strong>Demo Mode</strong> — sample data only. Connect Supabase to see real deals.
          </div>
        )}
        <nav className="ad-nav">
          <div className="ad-nav-brand">
            <span className="ad-nav-pill ad-nav-pill-b">Brobot</span>
            <span className="ad-nav-pill ad-nav-pill-a">Admin</span>
            <span className="ad-nav-title">All Deals</span>
          </div>
          <div className="ad-nav-actions">
            <span className="ad-nav-user">{user?.email}</span>
            <button className="ad-btn-ghost" onClick={() => navigate('/')}>+ Submit Deal</button>
            <button className="ad-btn-ghost" style={{ borderColor: 'rgba(245,166,35,0.4)', color: '#f5a623' }} onClick={() => setInviteOpen(true)}>+ Invite Partner</button>
            <div className="ad-partner-drop-wrap">
              <button
                className="ad-btn-ghost"
                onClick={() => setPartnerDropOpen(o => !o)}
                style={viewAsPartner ? { borderColor: 'rgba(56,189,248,0.4)', color: '#7dd3fc' } : {}}
              >
                {viewAsPartner ? `Viewing: ${viewAsPartner.name || viewAsPartner.email}` : 'Partner View ▾'}
              </button>
              {partnerDropOpen && (
                <div className="ad-partner-drop-menu">
                  <div className="ad-partner-drop-label">View as partner</div>
                  {payoutPartnerOptions.length === 0 && (
                    <button className="ad-partner-drop-item" disabled>No partners yet</button>
                  )}
                  {payoutPartnerOptions.map(([email, name]) => (
                    <button
                      key={email}
                      className="ad-partner-drop-item"
                      onClick={() => { setViewAsPartner({ email, name }); setPartnerDropOpen(false) }}
                    >
                      {name}<small>{email}</small>
                    </button>
                  ))}
                  {viewAsPartner && (
                    <button
                      className="ad-partner-drop-item"
                      style={{ color: '#f87171', borderTop: '1px solid #1e293b' }}
                      onClick={() => { setViewAsPartner(null); setPartnerDropOpen(false) }}
                    >
                      ✕ Exit Partner View
                    </button>
                  )}
                </div>
              )}
            </div>
            <button className="ad-btn-ghost" onClick={handleSignOut}>Sign out</button>
          </div>
        </nav>

        {viewAsPartner && (
          <div className="ad-subview-banner">
            <span>👁 Viewing as partner:</span>
            <strong>{viewAsPartner.name || viewAsPartner.email}</strong>
            <span style={{ color: '#475569' }}>{viewAsPartner.name ? viewAsPartner.email : ''}</span>
            <button className="ad-subview-exit" onClick={() => setViewAsPartner(null)}>✕ Exit</button>
          </div>
        )}

        <div className="ad-body">
          {viewAsPartner ? (() => {
            const pDeals = deals.filter(d => d.rep_email === viewAsPartner.email)
            const lifetimeEarned = pDeals.reduce((s, d) => {
              try {
                const prods = Array.isArray(d.products_json) ? d.products_json : JSON.parse(d.products_json || '[]')
                return s + calcProductCommissionTotal(prods)
              } catch { return s }
            }, 0)
            const tierPct = Math.min(100, (lifetimeEarned / RESIDUAL_TIER_THRESHOLD) * 100)
            const tierUnlocked = lifetimeEarned >= RESIDUAL_TIER_THRESHOLD
            const pUpfront = pDeals.reduce((s, d) => s + (parseFloat(d.upfront_commission) || 0), 0)
            const pResidual = pDeals.reduce((s, d) => s + (parseFloat(d.monthly_residual) || 0), 0)
            const fmt = n => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
            return (
              <>
                <div className="ad-page-head">
                  <h1 className="ad-page-h1">{viewAsPartner.name || viewAsPartner.email}'s <em>Deals</em></h1>
                  <div className="ad-page-rule" />
                </div>
                <div className="ad-subview-tier">
                  <div className="ad-subview-tier-label">
                    {tierUnlocked ? '🎉 30% Residual Tier Unlocked' : `Residual Tier Progress — ${fmt(lifetimeEarned)} of $30K`}
                  </div>
                  <div className="ad-subview-tier-bar-bg">
                    <div className="ad-subview-tier-bar-fill" style={{ width: `${tierPct}%` }} />
                  </div>
                  <div className="ad-subview-tier-nums">
                    <span>{fmt(lifetimeEarned)}</span>
                    <span>$30,000</span>
                  </div>
                </div>
                <div className="ad-subview-stats">
                  <div className="ad-stat">
                    <div className="ad-stat-label">Total Deals</div>
                    <div className="ad-stat-value accent">{pDeals.length}</div>
                  </div>
                  <div className="ad-stat">
                    <div className="ad-stat-label">Upfront Earned</div>
                    <div className="ad-stat-value accent">{fmt(pUpfront)}</div>
                  </div>
                  <div className="ad-stat">
                    <div className="ad-stat-label">Monthly Residual</div>
                    <div className="ad-stat-value" style={{ color: '#4ade80' }}>{fmt(pResidual)}/mo</div>
                  </div>
                  <div className="ad-stat">
                    <div className="ad-stat-label">Residual Rate</div>
                    <div className="ad-stat-value" style={{ color: tierUnlocked ? '#4ade80' : '#f5a623' }}>{tierUnlocked ? '30%' : '25%'}</div>
                  </div>
                </div>
                <div className="ad-table-wrap">
                  <div className="ad-table-scroll">
                    <table className="ad-table">
                      <thead>
                        <tr>
                          <th>Client</th>
                          <th>Services</th>
                          <th>Status</th>
                          <th>First Payment</th>
                          <th>Upfront</th>
                          <th>Residual</th>
                          <th>Paid</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pDeals.length === 0 && (
                          <tr><td colSpan={7} style={{ textAlign: 'center', color: '#475569', padding: '32px' }}>No deals found for this partner.</td></tr>
                        )}
                        {pDeals.map(deal => {
                          const { label, cls } = dealStatus(deal)
                          return (
                            <tr key={deal.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedDeal(deal)}>
                              <td>
                                <span style={{ fontWeight: 700 }}>{deal.client_name || '—'}</span>
                                {deal.business_name && <span style={{ display: 'block', fontSize: 12, color: '#94a3b8' }}>{deal.business_name}</span>}
                                {deal.multi_location && <span style={{ fontSize: 10, background: 'rgba(56,189,248,0.15)', color: '#38bdf8', borderRadius: 4, padding: '1px 5px', marginLeft: 4 }}>MULTI-LOC</span>}
                              </td>
                              <td style={{ whiteSpace: 'pre-line', fontSize: 13 }}>{productNames(deal.products_json)}</td>
                              <td><span className={cls}>{label}</span></td>
                              <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                                {deal.first_payment_date ? new Date(deal.first_payment_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                              </td>
                              <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#f5a623' }}>
                                {deal.upfront_commission != null ? fmt(deal.upfront_commission) : '—'}
                              </td>
                              <td style={{ fontFamily: 'JetBrains Mono, monospace', color: '#4ade80' }}>
                                {deal.monthly_residual != null ? '$' + Number(deal.monthly_residual).toFixed(2) + '/mo' : '—'}
                              </td>
                              <td>
                                <button
                                  className={deal.commission_paid ? 'ad-paid-badge paid' : 'ad-paid-badge unpaid'}
                                  onClick={e => togglePaid(e, deal)}
                                >{deal.commission_paid ? '✓ Paid' : 'Unpaid'}</button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )
          })() : (
          <>
          <div className="ad-page-head">
            <h1 className="ad-page-h1">Deal <em>Command Center</em></h1>
            <div className="ad-page-rule" />
          </div>

          {/* ── CLIENT STATUS ── */}
          <div className="ad-stats-section">
            <div className="ad-stats-section-label">Client Status</div>
            <div className="ad-stats">
              <div className="ad-stat">
                <div className="ad-stat-label">Active Clients</div>
                <div className="ad-stat-value green">{activeCount}</div>
                <div className="ad-stat-sub">handoff complete</div>
              </div>
              <div className="ad-stat">
                <div className="ad-stat-label">Pending Clients</div>
                <div className="ad-stat-value" style={{ color: '#f5a623' }}>{pendingCount}</div>
                <div className="ad-stat-sub">awaiting handoff</div>
              </div>
              <div className="ad-stat">
                <div className="ad-stat-label">Commission Pending</div>
                <div className="ad-stat-value" style={{ color: unpaidCount > 0 ? '#fb7185' : '#f1f5f9' }}>{fmt(commissionPendingTotal)}</div>
                <div className="ad-stat-sub">{unpaidCount} deal{unpaidCount !== 1 ? 's' : ''} · awaiting payout</div>
              </div>
            </div>
          </div>

          {/* ── REVENUE & PAYOUTS ── */}
          <div className="ad-stats-section">
            <div className="ad-stats-section-label">Revenue &amp; Partner Payouts</div>
            <div className="ad-stats">
              <div className="ad-stat">
                <div className="ad-stat-label">Total MRC</div>
                <div className="ad-stat-value accent">{fmt(totalMrc)}</div>
                <div className="ad-stat-sub">customer monthly recurring</div>
              </div>
              <div className="ad-stat">
                <div className="ad-stat-label">Commissionable MRR</div>
                <div className="ad-stat-value" style={{ color: '#f5a623' }}>{fmt(totalCommissionableMrr)}</div>
                <div className="ad-stat-sub">product flat totals · residual base</div>
              </div>
              <div className="ad-stat">
                <div className="ad-stat-label">Upfront Commission</div>
                <div className="ad-stat-value green">{fmt(totalUpfront)}</div>
                <div className="ad-stat-sub">total payable to partners</div>
              </div>
              <div className="ad-stat">
                <div className="ad-stat-label">Monthly Residual</div>
                <div className="ad-stat-value" style={{ color: '#38bdf8' }}>{fmt(totalResidual)}</div>
                <div className="ad-stat-sub">ongoing partner payout</div>
              </div>
            </div>
          </div>

          {/* ── PAYOUT REPORT ── */}
          <div className="ad-payout-bar" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              <span className="ad-payout-label">Payout Report for:</span>
              <input
                className="ad-payout-month"
                type="month"
                value={payoutMonth}
                onChange={e => setPayoutMonth(e.target.value)}
              />
              <select
                className="ad-payout-month"
                value={payoutPartner}
                onChange={e => setPayoutPartner(e.target.value)}
                style={{ minWidth: 180 }}
              >
                <option value="all">All Partners</option>
                {payoutPartnerOptions.map(([email, name]) => (
                  <option key={email} value={email}>{name}</option>
                ))}
              </select>
              <span className="ad-payout-summary">
                <strong>{payoutReportFiltered.length}</strong> deal{payoutReportFiltered.length !== 1 ? 's' : ''} &nbsp;·&nbsp; Total due: <strong>{fmt(payoutReportTotal)}</strong>
              </span>
              <button
                className="ad-payout-download"
                onClick={downloadPayoutCSV}
                disabled={payoutReportFiltered.length === 0}
              >
                ↓ Download CSV
              </button>
            </div>
            {payoutReportFiltered.length > 0 && (
              <div className="ad-payout-mini-wrap">
                <table className="ad-payout-mini-table">
                  <thead>
                    <tr>
                      {payoutPartner === 'all' && <th>Partner</th>}
                      <th>Client</th>
                      <th>Services</th>
                      <th>Type</th>
                      <th style={{ textAlign: 'right' }}>Product Comm.</th>
                      <th style={{ textAlign: 'right' }}>Setup Fee Comm.</th>
                      <th style={{ textAlign: 'right' }}>Residual</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutReportFiltered.map((r, i) => {
                      let products = []
                      try { products = Array.isArray(r.deal.products_json) ? r.deal.products_json : JSON.parse(r.deal.products_json || '[]') } catch {}
                      const services = products.map(p => p.productLabel || p.productId).join(', ')
                      const types = [r.upfront > 0 && 'Upfront', r.residual > 0 && 'Residual'].filter(Boolean).join(' + ')
                      return (
                        <tr key={i}>
                          {payoutPartner === 'all' && <td>{r.deal.rep_name || r.deal.rep_email}</td>}
                          <td>{r.deal.client_name}<br /><span style={{ color: '#f1f5f9', fontSize: 11 }}>{r.deal.business_name}</span></td>
                          <td style={{ color: '#f1f5f9', fontSize: 11 }}>{services}</td>
                          <td><span style={{ color: r.upfront > 0 && r.residual > 0 ? '#c084fc' : r.upfront > 0 ? '#4ade80' : '#38bdf8', fontSize: 11, fontWeight: 700 }}>{types}</span></td>
                          <td style={{ textAlign: 'right', color: '#4ade80', fontFamily: 'JetBrains Mono', fontSize: 12 }}>{r.productComm > 0 ? fmt(r.productComm) : '—'}</td>
                          <td style={{ textAlign: 'right', color: '#c084fc', fontFamily: 'JetBrains Mono', fontSize: 12 }}>{r.setupFeeComm > 0 ? fmt(r.setupFeeComm) : '—'}</td>
                          <td style={{ textAlign: 'right', color: '#38bdf8', fontFamily: 'JetBrains Mono', fontSize: 12 }}>{r.residual > 0 ? fmt(r.residual) : '—'}</td>
                          <td style={{ textAlign: 'right', color: '#f1f5f9', fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 700 }}>{fmt(r.upfront + r.residual)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="ad-filters">
            <input className="ad-search" type="search" placeholder="Search client, business, partner, or closer…" value={search} onChange={e => setSearch(e.target.value)} />
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'active', label: 'Active' },
              { id: 'unpaid', label: 'Unpaid Commission' },
              { id: 'paid', label: 'Paid' },
            ].map(f => (
              <button key={f.id} className={`ad-filter-btn${filter === f.id ? ' active' : ''}`} onClick={() => setFilter(f.id)}>
                {f.label}
              </button>
            ))}
            <span className="ad-filter-count">{filtered.length} of {deals.length}</span>
          </div>

          <div className="ad-table-wrap">
            {loading ? (
              <div className="ad-loading">Loading all deals…</div>
            ) : filtered.length === 0 ? (
              <div className="ad-empty">
                <div className="ad-empty-icon">📋</div>
                <div className="ad-empty-text">{deals.length === 0 ? 'No deals submitted yet.' : 'No results match your filters.'}</div>
              </div>
            ) : (
              <div className="ad-table-scroll">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th className="ad-hide-mobile">Partner</th>
                    <th className="ad-hide-mobile">Services</th>
                    <th>Status</th>
                    <th className="ad-hide-tablet">First Payment</th>
                    <th>Commission</th>
                    <th className="ad-hide-mobile">Residual</th>
                    <th>Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(deal => {
                    const status = dealStatus(deal)
                    const partnerLifetime = deals
                      .filter(d => d.rep_email === deal.rep_email && d.commission_paid)
                      .reduce((s, d) => s + (Number(d.upfront_commission ?? d.commission_amount) || 0), 0)
                    const tierUnlocked = partnerLifetime >= RESIDUAL_TIER_THRESHOLD
                    return (
                      <tr key={deal.id} onClick={() => setSelectedDeal(deal)}>
                        <td>
                          <div className="ad-cell-primary">
                            {deal.client_name || '—'}
                            {deal.multi_location && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', padding: '2px 7px', borderRadius: 100, background: 'rgba(168,85,247,0.12)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.25)', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>MULTI-LOC</span>}
                          </div>
                          <div className="ad-cell-sub">{deal.business_name || '—'}</div>
                        </td>
                        <td className="ad-hide-mobile">
                          <div className="ad-cell-rep">{deal.rep_name || '—'}</div>
                          <div className="ad-cell-sub">{deal.rep_email}</div>
                          {tierUnlocked && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, padding: '2px 7px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 100, fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#4ade80', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700 }}>
                              30% tier
                            </div>
                          )}
                        </td>
                        <td className="ad-hide-mobile">
                          <div className="ad-products-list">
                            {productNames(deal.products_json)}
                          </div>
                        </td>
                        <td>
                          <select
                            className={`ad-paid-select ${status.selectCls}`}
                            value={deal.churned ? 'cancelled' : deal.handoff_complete ? 'active' : 'pending'}
                            onChange={e => toggleStatus(e, deal)}
                            onClick={e => e.stopPropagation()}
                          >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="ad-hide-tablet">
                          <span className="ad-cell-mono">{fmtDate(deal.first_payment_date)}</span>
                        </td>
                        <td>
                          <span className="ad-cell-commission">{fmt(deal.upfront_commission ?? deal.commission_amount)}</span>
                        </td>
                        <td className="ad-hide-mobile">
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#38bdf8', fontWeight: 700 }}>
                            {deal.monthly_residual != null ? `$${Number(deal.monthly_residual).toFixed(2)}` : '—'}<span style={{ color: '#f1f5f9', fontWeight: 400 }}>/mo</span>
                          </span>
                        </td>
                        <td>
                          <select
                            className={`ad-paid-select ${deal.commission_paid ? 'paid' : 'unpaid'}`}
                            value={deal.commission_paid ? 'paid' : 'unpaid'}
                            onChange={e => togglePaid(e, deal)}
                            onClick={e => e.stopPropagation()}
                          >
                            <option value="unpaid">Unpaid</option>
                            <option value="paid">Paid</option>
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              </div>
            )}
          </div>
          </>
          )}
        </div>
      </div>

      {selectedDeal && (
        <DealModal
          deal={selectedDeal}
          isAdmin={true}
          onClose={() => setSelectedDeal(null)}
          onUpdate={handleUpdate}
        />
      )}

      {inviteOpen && (
        <div className="ad-invite-overlay" onClick={closeInvite}>
          <div className="ad-invite-modal" onClick={e => e.stopPropagation()}>
            {inviteStatus === 'success' ? (
              <div className="ad-invite-success">
                <div className="ad-invite-success-icon">✅</div>
                <div className="ad-invite-success-msg">Invite sent!</div>
                <div className="ad-invite-success-sub">{inviteEmail} will receive an email to set their password and access the partner portal.</div>
                <button className="ad-invite-submit" style={{ marginTop: 24, width: '100%' }} onClick={closeInvite}>Done</button>
              </div>
            ) : (
              <form onSubmit={sendInvite}>
                <div className="ad-invite-title">Invite Partner</div>
                <div className="ad-invite-sub">They'll receive an email with a link to set their password and log in.</div>
                <div className="ad-invite-field">
                  <label className="ad-invite-label">Full Name</label>
                  <input
                    className="ad-invite-input"
                    type="text"
                    placeholder="Jane Smith"
                    value={inviteName}
                    onChange={e => setInviteName(e.target.value)}
                  />
                </div>
                <div className="ad-invite-field">
                  <label className="ad-invite-label">Email Address <span style={{ color: '#fb7185' }}>*</span></label>
                  <input
                    className="ad-invite-input"
                    type="email"
                    placeholder="jane@company.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                {inviteStatus === 'error' && (
                  <div style={{ color: '#fb7185', fontSize: 13, marginTop: 4 }}>{inviteError}</div>
                )}
                <div className="ad-invite-actions">
                  <button type="button" className="ad-invite-cancel" onClick={closeInvite}>Cancel</button>
                  <button type="submit" className="ad-invite-submit" disabled={inviteStatus === 'sending'}>
                    {inviteStatus === 'sending' ? 'Sending…' : 'Send Invite'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
