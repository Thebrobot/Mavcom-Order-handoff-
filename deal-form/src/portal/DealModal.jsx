import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient.js'
import {
  commissionLineItems,
  calcProductCommissionTotal,
  SETUP_FEE_COMMISSION_PCT,
  STRIPE_FEE_MULTIPLIER,
  netSetupFee,
} from './commissionRules.js'

const STYLES = `
  .dm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: dmFadeIn 0.15s ease;
  }
  @keyframes dmFadeIn { from { opacity: 0 } to { opacity: 1 } }

  .dm-modal {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 20px;
    width: 100%;
    max-width: 680px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 32px 80px rgba(0,0,0,0.6);
    animation: dmSlideUp 0.18s ease;
    font-family: 'Barlow', sans-serif;
    color: #f1f5f9;
    scrollbar-width: thin;
    scrollbar-color: #334155 transparent;
  }
  @keyframes dmSlideUp { from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

  .dm-header {
    padding: 24px 28px 20px;
    border-bottom: 1px solid #334155;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    position: sticky;
    top: 0;
    background: #1e293b;
    z-index: 1;
    border-radius: 20px 20px 0 0;
  }
  .dm-header-left { min-width: 0; }
  .dm-client-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 24px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: -0.01em;
    color: #f1f5f9;
    line-height: 1.1;
  }
  .dm-biz-name { font-size: 13px; color: #cbd5e1; margin-top: 3px; }
  .dm-close {
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 8px;
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #cbd5e1;
    font-size: 18px;
    flex-shrink: 0;
    transition: border-color 0.15s, color 0.15s;
    line-height: 1;
  }
  .dm-close:hover { border-color: #94a3b8; color: #f1f5f9; }

  .dm-body { padding: 24px 28px 28px; display: flex; flex-direction: column; gap: 22px; }

  /* ── STATUS ROW ── */
  .dm-status-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }
  .dm-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .dm-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
  .dm-badge-active { background: rgba(74,222,128,0.1); color: #4ade80; border: 1px solid rgba(74,222,128,0.2); }
  .dm-badge-trial { background: rgba(56,189,248,0.1); color: #38bdf8; border: 1px solid rgba(56,189,248,0.2); }
  .dm-badge-pending { background: rgba(245,166,35,0.1); color: #f5a623; border: 1px solid rgba(245,166,35,0.2); }
  .dm-badge-paid { background: rgba(74,222,128,0.1); color: #4ade80; border: 1px solid rgba(74,222,128,0.2); }
  .dm-badge-unpaid { background: rgba(100,116,139,0.15); color: #94a3b8; border: 1px solid rgba(100,116,139,0.2); }
  .dm-badge-cancelled { background: rgba(251,113,133,0.1); color: #fb7185; border: 1px solid rgba(251,113,133,0.3); }
  .dm-badge-multiloc { background: rgba(168,85,247,0.12); color: #c084fc; border: 1px solid rgba(168,85,247,0.25); }

  /* ── SECTION ── */
  .dm-section { display: flex; flex-direction: column; gap: 12px; }
  .dm-section-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #94a3b8;
    padding-bottom: 8px;
    border-bottom: 1px solid #1e3a5f;
  }
  .dm-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; }
  .dm-field { display: flex; flex-direction: column; gap: 4px; }
  .dm-field-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #94a3b8;
  }
  .dm-field-value { font-size: 14px; color: #f1f5f9; font-weight: 500; }
  .dm-field-value.muted { color: #cbd5e1; }
  .dm-field-value.accent { color: #f5a623; font-family: 'JetBrains Mono', monospace; font-weight: 700; }
  .dm-field-value.green { color: #4ade80; font-family: 'JetBrains Mono', monospace; font-weight: 700; }

  /* ── PRODUCTS ── */
  .dm-products { display: flex; flex-direction: column; gap: 8px; }
  .dm-product-row {
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 10px;
    padding: 12px 14px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px 18px;
    align-items: flex-start;
  }
  .dm-product-name { font-size: 16px; font-weight: 700; color: #f1f5f9; flex: 1 1 100%; margin-bottom: 4px; }
  .dm-product-detail { font-size: 15px; color: #cbd5e1; white-space: nowrap; }
  .dm-product-detail strong { color: #f1f5f9; }

  /* ── EDITABLE FIELDS (admin only) ── */
  .dm-edit-input {
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 8px 10px;
    font-size: 13px;
    font-family: 'Barlow', sans-serif;
    color: #f1f5f9;
    outline: none;
    width: 100%;
    transition: border-color 0.15s;
  }
  .dm-edit-input:focus { border-color: #f5a623; }

  /* ── ACTIONS ── */
  .dm-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding-top: 6px;
    border-top: 1px solid #334155;
  }
  .dm-btn {
    padding: 10px 18px;
    border-radius: 9px;
    font-family: 'Barlow', sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
    border: 1px solid transparent;
  }
  .dm-btn-primary { background: #f5a623; color: #000; border-color: #f5a623; }
  .dm-btn-primary:hover:not(:disabled) { opacity: 0.88; }
  .dm-btn-ghost { background: transparent; color: #cbd5e1; border-color: #475569; }
  .dm-btn-ghost:hover:not(:disabled) { border-color: #94a3b8; color: #f1f5f9; }
  .dm-btn-green { background: rgba(74,222,128,0.1); color: #4ade80; border-color: rgba(74,222,128,0.3); }
  .dm-btn-green:hover:not(:disabled) { background: rgba(74,222,128,0.18); }
  .dm-btn-danger { background: transparent; color: #f87171; border-color: rgba(248,113,113,0.3); }
  .dm-btn-danger:hover:not(:disabled) { background: rgba(248,113,113,0.08); }
  .dm-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .dm-save-hint { font-size: 11px; color: #94a3b8; align-self: center; margin-left: auto; }
  .dm-save-ok { font-size: 11px; color: #4ade80; align-self: center; margin-left: auto; }
  .dm-notes { font-size: 13px; color: #94a3b8; background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 12px 14px; line-height: 1.65; white-space: pre-wrap; }
`

function dealStatus(deal) {
  if (deal.churned) return { label: 'Cancelled', cls: 'dm-badge-cancelled' }
  if (deal.handoff_complete) return { label: 'Active', cls: 'dm-badge-active' }
  return { label: 'Pending', cls: 'dm-badge-pending' }
}

function fmtDate(d) {
  if (!d) return '—'
  try { return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
  catch { return d }
}

function fmtTs(ts) {
  if (!ts) return '—'
  try { return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
  catch { return ts }
}

function fmt(n) {
  if (n == null || !Number.isFinite(Number(n))) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(n))
}

function fmtExact(n) {
  if (n == null || !Number.isFinite(Number(n))) return '—'
  const val = Number(n)
  const decimals = val % 1 === 0 ? 0 : 2
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(val)
}

function productSummary(json) {
  if (!json) return []
  try {
    const items = Array.isArray(json) ? json : JSON.parse(json)
    return items.filter(p => p.productId || p.productLabel)
  } catch { return [] }
}

export default function DealModal({ deal: initialDeal, isAdmin, onClose, onUpdate }) {
  const [deal, setDeal] = useState(initialDeal)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Local editable state (admin only)
  const [firstPayment, setFirstPayment] = useState(initialDeal.first_payment_date ?? '')
  const [payoutDate, setPayoutDate] = useState(initialDeal.payout_date ?? '')

  // Close on Escape
  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])
  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const isDemoMode = sessionStorage.getItem('portalDemo') === 'true'

  const patch = async (updates) => {
    if (isDemoMode) {
      // Demo: update local state only
      const updated = { ...deal, ...updates }
      setDeal(updated)
      onUpdate?.(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      return
    }
    setSaving(true)
    const { data, error } = await supabase
      .from('deals')
      .update(updates)
      .eq('id', deal.id)
      .select()
      .single()
    setSaving(false)
    if (!error && data) {
      setDeal(data)
      onUpdate?.(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const saveDates = () => patch({
    first_payment_date: firstPayment || null,
    payout_date: payoutDate || null,
  })

  const toggleHandoff = () => patch({
    handoff_complete: !deal.handoff_complete,
    handoff_completed_at: !deal.handoff_complete ? new Date().toISOString() : null,
    handoff_completed_by: !deal.handoff_complete ? (isDemoMode ? 'admin@demo.com' : null) : null,
  })

  const togglePaid = () => {
    const nowPaid = !deal.commission_paid
    patch({
      commission_paid: nowPaid,
      commission_paid_at: nowPaid ? new Date().toISOString() : null,
      commission_paid_by: nowPaid ? (isDemoMode ? 'admin@demo.com' : null) : null,
    })
  }

  const status = dealStatus(deal)
  const products = productSummary(deal.products_json)

  return (
    <>
      <style>{STYLES}</style>
      <div className="dm-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
        <div className="dm-modal" role="dialog" aria-modal="true">

          {/* ── HEADER ── */}
          <div className="dm-header">
            <div className="dm-header-left">
              <div className="dm-client-name">{deal.client_name || 'Unknown Client'}</div>
              <div className="dm-biz-name">{deal.business_name || '—'}</div>
            </div>
            <button className="dm-close" onClick={onClose} aria-label="Close">×</button>
          </div>

          <div className="dm-body">

            {/* ── STATUS ── */}
            <div className="dm-status-row">
              <span className={`dm-badge ${status.cls}`}>
                <span className="dm-badge-dot" />
                {status.label}
              </span>
              <span className={`dm-badge ${deal.commission_paid ? 'dm-badge-paid' : 'dm-badge-unpaid'}`}>
                Commission: {deal.commission_paid ? 'Paid' : 'Unpaid'}
              </span>
              {deal.multi_location && (
                <span className="dm-badge dm-badge-multiloc">
                  Multi-Location
                </span>
              )}
            </div>

            {/* ── PRODUCTS ── */}
            <div className="dm-section">
              <div className="dm-section-title">Services</div>
              <div className="dm-products">
                {products.length > 0 ? products.map((p, i) => (
                  <div className="dm-product-row" key={i}>
                    <div className="dm-product-name">
                      {p.customLabel?.trim() || p.productLabel || p.productId || 'Product'}
                    </div>
                    {p.lineQty && <span className="dm-product-detail"><strong>Lines:</strong> {p.lineQty}</span>}
                    {p.mrc && <span className="dm-product-detail"><strong>MRC:</strong> ${p.mrc}/mo</span>}
                    {p.setup && p.setup !== '0' && <span className="dm-product-detail"><strong>Setup:</strong> ${p.setup}</span>}
                    {p.term && <span className="dm-product-detail"><strong>Term:</strong> {p.term} mo</span>}
                  </div>
                )) : <div style={{ color: '#94a3b8', fontSize: 13 }}>No product data</div>}
              </div>
            </div>

            {/* ── FINANCIALS ── */}
            <div className="dm-section">
              <div className="dm-section-title">Financials</div>
              <div className="dm-grid">
                <div className="dm-field">
                  <div className="dm-field-label">Monthly MRR</div>
                  <div className="dm-field-value accent">{fmt(deal.total_mrc)}</div>
                </div>
                <div className="dm-field">
                  <div className="dm-field-label">Setup Fees</div>
                  <div className="dm-field-value">{deal.total_setup > 0 ? fmt(deal.total_setup) : '—'}</div>
                </div>
              </div>
            </div>

            {/* ── COMMISSION BREAKDOWN ── */}
            <div className="dm-section">
              <div className="dm-section-title">Commission Breakdown</div>

              {/* Per-product flat amounts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                {commissionLineItems(Array.isArray(deal.products_json) ? deal.products_json : []).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', border: '1px solid #1e3a5f', borderRadius: 8, padding: '8px 14px' }}>
                    <span style={{ fontSize: 13, color: '#cbd5e1' }}>{item.label}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{fmt(item.commission)}</span>
                  </div>
                ))}
                {deal.total_setup > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', border: '1px solid #1e3a5f', borderRadius: 8, padding: '8px 14px' }}>
                    <span style={{ fontSize: 13, color: '#cbd5e1' }}>
                      Setup bonus ({Math.round(SETUP_FEE_COMMISSION_PCT * 100)}% of {fmt(netSetupFee(deal.total_setup))}
                      <span style={{ fontSize: 11, color: '#94a3b8' }}> net — {fmt(deal.total_setup)} includes 4% Stripe fee</span>
                      )
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>
                      {fmt(netSetupFee(deal.total_setup) * SETUP_FEE_COMMISSION_PCT)}
                    </span>
                  </div>
                )}
              </div>

              {/* Totals row */}
              {(() => {
                const commRevenue = calcProductCommissionTotal(
                  Array.isArray(deal.products_json) ? deal.products_json : []
                )
                const residualRate = commRevenue > 0 && deal.monthly_residual != null
                  ? Math.round((Number(deal.monthly_residual) / commRevenue) * 100)
                  : null
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <div className="dm-field">
                      <div className="dm-field-label">Upfront Commission</div>
                      <div className="dm-field-value green" style={{ fontSize: 20 }}>{fmt(deal.upfront_commission ?? deal.commission_amount)}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>paid month 1</div>
                    </div>
                    <div className="dm-field">
                      <div className="dm-field-label">Commissionable Revenue</div>
                      <div className="dm-field-value" style={{ color: '#f1f5f9', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 20 }}>{fmt(commRevenue)}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>product flat totals only</div>
                    </div>
                    <div className="dm-field">
                      <div className="dm-field-label">Monthly Residual</div>
                      <div className="dm-field-value" style={{ color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 20 }}>
                        {fmtExact(deal.monthly_residual)}<span style={{ fontSize: 12, fontWeight: 400, color: '#94a3b8' }}>/mo</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                        {residualRate != null ? `${residualRate}% of commissionable revenue` : 'starts month 2'}
                      </div>
                    </div>
                  </div>
                )
              })()}

            </div>

            {/* ── DATES ── */}
            <div className="dm-section">
              <div className="dm-section-title">Key Dates</div>
              <div className="dm-grid">
                <div className="dm-field">
                  <div className="dm-field-label">Close Date</div>
                  <div className="dm-field-value">{fmtDate(deal.sale_date)}</div>
                </div>
                <div className="dm-field">
                  <div className="dm-field-label">Handoff Date</div>
                  <div className="dm-field-value">
                    {deal.handoff_complete ? fmtTs(deal.handoff_completed_at) : <span style={{ color: '#94a3b8' }}>Pending</span>}
                  </div>
                </div>
                <div className="dm-field">
                  <div className="dm-field-label">First Payment</div>
                  {isAdmin ? (
                    <input
                      type="date"
                      className="dm-edit-input"
                      value={firstPayment}
                      onChange={e => setFirstPayment(e.target.value)}
                    />
                  ) : (
                    <div className="dm-field-value">{fmtDate(deal.first_payment_date)}</div>
                  )}
                </div>
                <div className="dm-field">
                  <div className="dm-field-label">Expected Payout</div>
                  {isAdmin ? (
                    <input
                      type="date"
                      className="dm-edit-input"
                      value={payoutDate}
                      onChange={e => setPayoutDate(e.target.value)}
                    />
                  ) : (
                    (() => {
                      // Always the 15th of the month following first payment
                      if (!deal.first_payment_date) return <div className="dm-field-value">—</div>
                      const d = new Date(deal.first_payment_date + 'T00:00:00')
                      const yr  = d.getMonth() === 11 ? d.getFullYear() + 1 : d.getFullYear()
                      const mo  = String(d.getMonth() === 11 ? 1 : d.getMonth() + 2).padStart(2, '0')
                      return <div className="dm-field-value">{fmtDate(`${yr}-${mo}-15`)}</div>
                    })()
                  )}
                </div>
                {deal.commission_paid && (
                  <div className="dm-field">
                    <div className="dm-field-label">Paid On</div>
                    <div className="dm-field-value">{fmtTs(deal.commission_paid_at)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* ── PARTNER / CLOSER ── */}
            <div className="dm-section">
              <div className="dm-section-title">Partner</div>
              <div className="dm-grid">
                <div className="dm-field">
                  <div className="dm-field-label">Partner Name</div>
                  <div className="dm-field-value">{deal.rep_name || '—'}</div>
                </div>
                <div className="dm-field">
                  <div className="dm-field-label">Partner Email</div>
                  <div className="dm-field-value muted" style={{ fontSize: 13 }}>{deal.rep_email}</div>
                </div>
                {deal.closer_name && (
                  <div className="dm-field">
                    <div className="dm-field-label">Closer</div>
                    <div className="dm-field-value">{deal.closer_name}</div>
                  </div>
                )}
              </div>
            </div>


            {/* ── ADMIN ACTIONS ── */}
            {isAdmin && (
              <div className="dm-actions">
                <button className="dm-btn dm-btn-ghost" onClick={saveDates} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Dates'}
                </button>
                <button
                  className={`dm-btn ${deal.handoff_complete ? 'dm-btn-danger' : 'dm-btn-green'}`}
                  onClick={toggleHandoff}
                  disabled={saving}
                >
                  {deal.handoff_complete ? 'Undo Handoff' : '✓ Mark Handoff Complete'}
                </button>
                <button
                  className={`dm-btn ${deal.commission_paid ? 'dm-btn-danger' : 'dm-btn-primary'}`}
                  onClick={togglePaid}
                  disabled={saving}
                >
                  {deal.commission_paid ? 'Mark Unpaid' : '$ Mark Commission Paid'}
                </button>
                {saved && <span className="dm-save-ok">✓ Saved</span>}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
