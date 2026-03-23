import { useState, useEffect, useLayoutEffect, useMemo } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,800&family=Barlow+Condensed:ital,wght@0,600;0,700;0,800;1,700&family=JetBrains+Mono:wght@400;500&display=swap');

  .mb-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .mb-wrap {
    background: #0b0f1a;
    min-height: 100vh;
    font-family: 'Barlow', sans-serif;
    color: #f1f5f9;
    padding: 40px 16px 80px;
    position: relative;
  }
  .mb-wrap::before {
    content: '';
    position: fixed;
    inset: 0;
    background: radial-gradient(ellipse 80% 50% at 20% -10%, rgba(245,166,35,0.06) 0%, transparent 60%),
                radial-gradient(ellipse 60% 40% at 80% 110%, rgba(56,189,248,0.05) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }
  .mb-inner { max-width: 760px; margin: 0 auto; position: relative; z-index: 1; }

  /* HEADER */
  .mb-header { text-align: center; margin-bottom: 40px; }
  .mb-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 100px; padding: 6px 16px; margin-bottom: 18px; }
  .mb-pill { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 8px; border-radius: 100px; }
  .mb-pill-m { background: rgba(255,255,255,0.1); color: #f1f5f9; }
  .mb-pill-x { color: #94a3b8; font-size: 14px; }
  .mb-pill-b { background: #f5a623; color: #000; font-weight: 700; }
  .mb-h1 { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(32px, 7vw, 54px); font-weight: 800; text-transform: uppercase; letter-spacing: -0.01em; line-height: 1; color: #fff; margin-bottom: 10px; }
  .mb-h1 em { font-style: italic; color: #f5a623; }
  .mb-sub { font-size: 15px; color: #cbd5e1; max-width: 460px; margin: 0 auto; line-height: 1.75; }
  .mb-rule { width: 56px; height: 2px; background: linear-gradient(90deg, #f5a623, #38bdf8); margin: 16px auto 0; border-radius: 2px; }

  /* PROGRESS */
  .mb-prog-wrap { margin-bottom: 32px; }
  .mb-prog-track-bg { position: relative; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .mb-prog-line { position: absolute; top: 50%; left: 14px; right: 14px; height: 1px; background: rgba(255,255,255,0.07); transform: translateY(-50%); }
  .mb-prog-fill { position: absolute; top: 50%; left: 14px; height: 1px; background: linear-gradient(90deg, #f5a623, #38bdf8); transform: translateY(-50%); transition: width 0.4s ease; }
  .mb-dot { width: 28px; height: 28px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.1); background: #111827; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #64748b; position: relative; z-index: 1; transition: all 0.3s; flex-shrink: 0; }
  .mb-dot.active { border-color: #f5a623; background: rgba(245,166,35,0.12); color: #f5a623; }
  .mb-dot.done { border-color: #22c55e; background: rgba(34,197,94,0.1); color: #22c55e; }
  .mb-prog-labels { display: flex; justify-content: space-between; }
  .mb-prog-labels span { font-size: 10px; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; width: 28px; text-align: center; transition: color 0.3s; }
  .mb-prog-labels span.active { color: #f5a623; }
  .mb-prog-labels span.done { color: #22c55e; }

  /* SECTION CARD */
  .mb-card { background: #111827; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; overflow: hidden; margin-bottom: 14px; }
  .mb-card-head { display: flex; align-items: center; gap: 10px; padding: 14px 22px; border-bottom: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.02); }
  .mb-card-num { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #f5a623; letter-spacing: 0.1em; }
  .mb-card-title { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #f8fafc; }
  .mb-card-body { padding: 18px 22px; }

  /* GRID */
  .mb-g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .mb-g1 { display: grid; grid-template-columns: 1fr; gap: 12px; }
  .mb-span2 { grid-column: span 2; }

  /* FIELD */
  .mb-field { display: flex; flex-direction: column; gap: 5px; }
  .mb-label { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: #cbd5e1; }
  .mb-label .req { color: #f5a623; margin-left: 2px; }
  .mb-input { background: #0d1220; border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; padding: 11px 14px; font-family: 'Barlow', sans-serif; font-size: 16px; color: #f8fafc; outline: none; width: 100%; transition: border-color 0.2s, box-shadow 0.2s; -webkit-appearance: none; }
  .mb-input::placeholder { color: #94a3b8; font-size: 15px; }
  .mb-input:focus { border-color: rgba(245,166,35,0.5); box-shadow: 0 0 0 3px rgba(245,166,35,0.12); }
  .mb-input[type="date"] { color-scheme: dark; min-height: 46px; padding-right: 12px; }
  .mb-input[type="date"]::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 1;
    filter: invert(1) brightness(1.15);
    scale: 1.2;
    padding: 6px;
    margin-left: 4px;
  }
  .mb-input[type="date"]::-webkit-datetime-edit-text { color: #e2e8f0; padding: 0 0.2em; }
  .mb-input[type="date"]::-webkit-datetime-edit-month-field,
  .mb-input[type="date"]::-webkit-datetime-edit-day-field,
  .mb-input[type="date"]::-webkit-datetime-edit-year-field { color: #f1f5f9; }
  .mb-select { background: #0d1220; border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; padding: 11px 36px 11px 14px; font-family: 'Barlow', sans-serif; font-size: 16px; color: #f8fafc; outline: none; width: 100%; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='8'%3E%3Cpath d='M0 0l7 8 7-8z' fill='%23e2e8f0'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; cursor: pointer; transition: border-color 0.2s; min-height: 46px; }
  .mb-select:focus { border-color: rgba(245,166,35,0.4); outline: none; }
  .mb-select option { background: #1e293b; }
  .mb-textarea { background: #0d1220; border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; padding: 11px 14px; font-family: 'Barlow', sans-serif; font-size: 16px; color: #f8fafc; outline: none; width: 100%; min-height: 88px; resize: vertical; line-height: 1.65; transition: border-color 0.2s; }
  .mb-textarea::placeholder { color: #94a3b8; font-size: 15px; }
  .mb-textarea:focus { border-color: rgba(245,166,35,0.4); box-shadow: 0 0 0 3px rgba(245,166,35,0.1); }

  /* PRODUCT ROWS */
  .mb-prod-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 8px; align-items: end; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; }
  .mb-prod-col { display: flex; flex-direction: column; gap: 4px; }
  .mb-prod-col-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; }
  .mb-prod-input { background: transparent; border: none; border-bottom: 1px solid rgba(255,255,255,0.12); border-radius: 0; padding: 4px 2px; font-size: 15px; color: #f8fafc; outline: none; font-family: 'Barlow', sans-serif; width: 100%; transition: border-color 0.2s; }
  .mb-prod-input::placeholder { color: #64748b; font-size: 14px; }
  .mb-card-deal-lines .mb-prod-row {
    grid-template-columns: minmax(140px, 2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) auto;
    padding: 14px 14px;
    margin-bottom: 10px;
    border-color: rgba(255,255,255,0.1);
    gap: 12px;
    align-items: start;
  }
  .mb-card-deal-lines .mb-remove-btn { margin-top: 26px; flex-shrink: 0; }
  .mb-card-deal-lines .mb-prod-col-product .mb-select { width: 100%; font-size: 16px; }
  .mb-card-deal-lines .mb-prod-other-input { margin-top: 10px; width: 100%; }
  .mb-card-deal-lines .mb-prod-col-label { font-size: 11px; letter-spacing: 0.1em; color: #cbd5e1; }
  .mb-card-deal-lines .mb-prod-input { font-size: 16px; padding: 8px 4px; border-bottom-width: 2px; }
  .mb-card-deal-lines .mb-prod-input::placeholder { font-size: 14px; color: #94a3b8; }
  .mb-deal-step-hint { font-size: 16px; color: #cbd5e1; line-height: 1.7; margin-bottom: 18px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .mb-deal-step-hint strong { color: #f1f5f9; font-weight: 600; }
  .mb-prod-input:focus { border-color: #f5a623; }
  .mb-remove-btn { background: none; border: 1px solid rgba(239,68,68,0.2); color: rgba(239,68,68,0.4); border-radius: 4px; width: 28px; height: 28px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; align-self: flex-end; flex-shrink: 0; font-family: monospace; }
  .mb-remove-btn:hover { border-color: #ef4444; color: #ef4444; background: rgba(239,68,68,0.05); }
  .mb-add-btn { background: none; border: 1px dashed rgba(245,166,35,0.25); color: #f5a623; border-radius: 6px; padding: 8px 16px; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; width: 100%; margin-top: 4px; }
  .mb-add-btn:hover { background: rgba(245,166,35,0.08); border-color: rgba(245,166,35,0.5); }

  .mb-deal-summary-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 20px;
    padding-top: 18px;
    border-top: 1px solid rgba(255,255,255,0.07);
  }
  .mb-deal-summary-box {
    padding: 16px 18px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    background: #111827;
  }
  .mb-deal-summary-box--mrc {
    border-color: rgba(245,166,35,0.3);
    background: linear-gradient(145deg, rgba(245,166,35,0.1), rgba(245,166,35,0.02));
  }
  .mb-deal-summary-box--setup {
    border-color: rgba(56,189,248,0.3);
    background: linear-gradient(145deg, rgba(56,189,248,0.1), rgba(56,189,248,0.02));
  }
  .mb-deal-summary-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #cbd5e1;
    margin-bottom: 10px;
  }
  .mb-deal-summary-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(20px, 5vw, 26px);
    font-weight: 600;
    color: #f5a623;
    line-height: 1.2;
  }
  .mb-deal-summary-box--setup .mb-deal-summary-value { color: #38bdf8; }
  .mb-deal-summary-note { font-size: 13px; color: #94a3b8; margin-top: 8px; line-height: 1.5; }

  /* BILLING TOGGLE */
  .mb-billing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 4px; }
  .mb-billing-card { padding: 14px 16px; background: #0d1220; border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; cursor: pointer; transition: all 0.2s; }
  .mb-billing-card.selected { border-color: #f5a623; background: rgba(245,166,35,0.08); }
  .mb-billing-title { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #cbd5e1; transition: color 0.2s; margin-bottom: 3px; }
  .mb-billing-card.selected .mb-billing-title { color: #f5a623; }
  .mb-billing-sub { font-size: 13px; color: #94a3b8; line-height: 1.45; transition: color 0.2s; }
  .mb-billing-card.selected .mb-billing-sub { color: rgba(245,166,35,0.6); }

  /* CALLOUT */
  .mb-callout { display: flex; gap: 10px; padding: 11px 14px; border-radius: 6px; margin-top: 12px; }
  .mb-callout-o { background: rgba(245,166,35,0.08); border: 1px solid rgba(245,166,35,0.2); }
  .mb-callout-c { background: rgba(56,189,248,0.07); border: 1px solid rgba(56,189,248,0.15); }
  .mb-callout-icon { font-size: 13px; flex-shrink: 0; margin-top: 1px; }
  .mb-callout-text { font-size: 14px; color: #cbd5e1; line-height: 1.65; }
  .mb-callout-text strong { color: #f5a623; font-weight: 600; }
  .mb-callout-c .mb-callout-text strong { color: #38bdf8; }

  /* CHECKBOXES */
  .mb-checks { display: flex; flex-direction: column; gap: 10px; margin-top: 6px; }
  .mb-check { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; }
  .mb-check input { width: 18px; height: 18px; min-width: 18px; margin-top: 2px; accent-color: #f5a623; cursor: pointer; }
  .mb-check span { font-size: 15px; color: #cbd5e1; line-height: 1.55; }

  /* GHL EMBED */
  .mb-card-upload-embed { border: none; }
  .mb-card-upload-embed .mb-card-head { border-bottom: 1px solid rgba(255,255,255,0.07); }
  .mb-ghl-wrap {
    position: relative;
    overflow: hidden;
    border: none;
    outline: none;
    background: #111827;
    height: 580px;
    line-height: 0;
  }
  .mb-ghl-wrap iframe {
    position: absolute;
    top: -16px;
    left: -24px;
    width: calc(100% + 24px + 28px);
    height: calc(100% + 32px);
    display: block;
    border: 0 !important;
    outline: none !important;
    box-shadow: none !important;
    margin: 0 !important;
    padding: 0 !important;
    max-width: none;
  }

  /* NAV */
  .mb-nav { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; gap: 12px; }
  .mb-btn-primary { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 12px 28px; border-radius: 6px; border: none; cursor: pointer; background: #f5a623; color: #000; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
  .mb-btn-primary:hover { background: #fbbf24; transform: translateY(-1px); }
  .mb-btn-ghost { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 12px 24px; border-radius: 6px; background: transparent; border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; cursor: pointer; transition: all 0.2s; }
  .mb-btn-ghost:hover { border-color: #64748b; color: #f8fafc; }
  .mb-btn-submit { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 13px 32px; border-radius: 6px; border: none; cursor: pointer; background: linear-gradient(135deg, #f5a623, #e8922a); color: #000; transition: all 0.2s; }
  .mb-btn-submit:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(245,166,35,0.35); }
  .mb-btn-submit:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
  .mb-submit-error { color: #fca5a5; font-size: 14px; line-height: 1.55; margin: 0 0 14px; max-width: 520px; padding: 12px 14px; border-radius: 6px; background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.3); }

  /* SUCCESS */
  .mb-success { text-align: center; padding: 72px 20px 80px; animation: mb-success-in 0.55s ease-out; }
  @keyframes mb-success-in {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .mb-success-badge {
    display: inline-flex;
    align-items: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #f5a623;
    margin-bottom: 22px;
    padding: 5px 14px;
    border-radius: 100px;
    border: 1px solid rgba(245,166,35,0.35);
    background: rgba(245,166,35,0.08);
  }
  .mb-success-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: rgba(34,197,94,0.12);
    border: 2px solid #22c55e;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    font-size: 30px;
    box-shadow: 0 0 40px rgba(34,197,94,0.15);
    animation: mb-success-pop 0.6s cubic-bezier(0.34, 1.45, 0.64, 1);
  }
  @keyframes mb-success-pop {
    from { opacity: 0; transform: scale(0.65); }
    to { opacity: 1; transform: scale(1); }
  }
  .mb-success h2 {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(34px, 8vw, 46px);
    font-weight: 800;
    text-transform: uppercase;
    color: #fff;
    margin-bottom: 8px;
    line-height: 1.05;
    letter-spacing: -0.02em;
  }
  .mb-success h2 em { font-style: italic; color: #22c55e; }
  .mb-success-rule {
    width: 64px;
    height: 2px;
    background: linear-gradient(90deg, #f5a623, #38bdf8);
    margin: 0 auto 22px;
    border-radius: 2px;
  }
  .mb-success-lead {
    font-size: 15px;
    color: #cbd5e1;
    max-width: 440px;
    margin: 0 auto 18px;
    line-height: 1.75;
  }
  .mb-success-lead strong { color: #fff; font-weight: 600; }
  .mb-success-tail {
    font-size: 14px;
    color: #94a3b8;
    max-width: 400px;
    margin: 0 auto;
    line-height: 1.7;
  }
  .mb-success-tail .hl { color: #f5a623; font-weight: 500; }

  @media (max-width: 560px) {
    .mb-g2 { grid-template-columns: 1fr; }
    .mb-span2 { grid-column: span 1; }
    .mb-billing-grid { grid-template-columns: 1fr; }
    .mb-prod-row { grid-template-columns: 1fr 1fr; }
    .mb-card-deal-lines .mb-prod-row { grid-template-columns: 1fr; }
    .mb-card-deal-lines .mb-remove-btn { margin-top: 8px; justify-self: end; }
    .mb-deal-summary-row { grid-template-columns: 1fr; }
  }
`;

const STEPS = ["Client", "Deal", "Billing", "Rep", "Files"];
const INDUSTRIES = ["Select industry…","Healthcare","Legal / Law Firm","Real Estate","Home Services","Restaurant / Food & Bev","Retail / eCommerce","Automotive","Financial Services","Professional Services","Nonprofit","Other"];

const PRODUCT_OPTIONS = [
  { value: "", label: "Select product…" },
  { value: "brobot-one", label: "Brobot One (voice, messaging & CRM)" },
  { value: "brobot-voice", label: "Brobot Voice / VoIP only" },
  { value: "brobot-crm", label: "Brobot CRM / automation add-on" },
  { value: "porting", label: "Number porting / carrier services" },
  { value: "professional-services", label: "Professional services / project" },
  { value: "other", label: "Other — custom product" },
];

function parseMoney(raw) {
  if (raw == null) return NaN;
  const s = String(raw).trim();
  if (!s) return NaN;
  const n = parseFloat(s.replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

function formatUsd(n) {
  if (!Number.isFinite(n)) return "$0.00";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function buildWebhookPayload(form, dealLineSummaries) {
  const productsDetailed = form.products.map(p => {
    const opt = PRODUCT_OPTIONS.find(o => o.value === p.productId);
    return {
      productId: p.productId,
      productLabel: opt?.label ?? "",
      customLabel: p.customLabel,
      monthlyAmount: p.mrc,
      setupFee: p.setup,
      contractTermMonths: p.term,
    };
  });
  return {
    source: "maverick-deal-form",
    submittedAt: new Date().toISOString(),
    contact: {
      firstName: form.contact_first,
      lastName: form.contact_last,
      phone: form.contact_phone,
      email: form.contact_email,
    },
    business: {
      legalName: form.business_name,
      address: form.address,
      industry: form.industry,
      website: form.website,
      phone: form.biz_phone,
    },
    products: productsDetailed,
    totals: {
      expectedMonthlyBilling: dealLineSummaries.sumMrc,
      totalSetupFees: dealLineSummaries.sumSetup,
    },
    billing: {
      saleDate: form.sale_date,
      billingType: form.billing_type,
      ccCollected: form.cc_collected,
      estimatedChargeDate: form.charge_date,
    },
    rep: {
      name: form.rep_name,
      email: form.rep_email,
    },
    agreement: {
      signedDate: form.signed_date,
      serviceStartDate: form.start_date,
    },
    notes: form.notes,
    confirmations: {
      agreementSigned: form.confirm_signed,
      payment: form.confirm_payment,
      onboarding: form.confirm_onboard,
    },
  };
}

const today = new Date().toISOString().split("T")[0];

export default function MaverickBrobotForm() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    business_name: "", address: "", industry: "", website: "", biz_phone: "",
    contact_first: "", contact_last: "", contact_phone: "", contact_email: "",
    products: [{ productId: "", customLabel: "", mrc: "", setup: "", term: "" }],
    sale_date: today, billing_type: "", cc_collected: "", charge_date: "",
    rep_name: "", rep_email: "", signed_date: today, start_date: "",
    notes: "", confirm_signed: false, confirm_payment: false, confirm_onboard: false,
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setProduct = (i, key, val) => setForm(f => {
    const p = [...f.products];
    p[i] = { ...p[i], [key]: val };
    return { ...f, products: p };
  });
  const addProduct = () => setForm(f => ({ ...f, products: [...f.products, { productId: "", customLabel: "", mrc: "", setup: "", term: "" }] }));
  const removeProduct = (i) => setForm(f => ({ ...f, products: f.products.filter((_, idx) => idx !== i) }));

  const dealLineSummaries = useMemo(() => {
    let sumMrc = 0;
    let sumSetup = 0;
    for (const p of form.products) {
      const m = parseMoney(p.mrc);
      const s = parseMoney(p.setup);
      if (Number.isFinite(m)) sumMrc += m;
      if (Number.isFinite(s)) sumSetup += s;
    }
    return { sumMrc, sumSetup };
  }, [form.products]);

  const progFill = `${((step - 1) / (STEPS.length - 1)) * 100}%`;

  const goNext = () => { if (step < 5) setStep(s => s + 1); };
  const goPrev = () => { if (step > 1) setStep(s => s - 1); };

  const handleSubmit = async () => {
    const url = import.meta.env.VITE_SUBMIT_WEBHOOK_URL;
    if (!url || !String(url).trim()) {
      setSubmitError("Add your webhook URL to the environment as VITE_SUBMIT_WEBHOOK_URL (see .env.example), then rebuild.");
      return;
    }
    setSubmitError("");
    setSubmitLoading(true);
    try {
      const payload = buildWebhookPayload(form, dealLineSummaries);
      const res = await fetch(String(url).trim(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text?.trim() || `Webhook returned ${res.status}`);
      }
      setSubmitted(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Submission failed.";
      setSubmitError(
        msg.includes("Failed to fetch") || msg.includes("NetworkError")
          ? "Could not reach the webhook (network or CORS). If this persists, use a serverless proxy or check the URL."
          : msg,
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    if (step < 4) return;
    const id = "msgsndr-embed-prefetch";
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id;
    l.rel = "prefetch";
    l.href = "https://link.msgsndr.com/js/form_embed.js";
    document.head.appendChild(l);
  }, [step]);

  useLayoutEffect(() => {
    if (step !== 5) return;
    const id = "msgsndr-form-embed-script";
    if (document.getElementById(id)) return;
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://link.msgsndr.com/js/form_embed.js";
    s.async = true;
    document.body.appendChild(s);
  }, [step]);

  if (submitted) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="mb-wrap">
          <div className="mb-inner">
            <div className="mb-success">
              <div className="mb-success-badge">In the books</div>
              <div className="mb-success-icon">✓</div>
              <h2>Deal <em>Logged.</em></h2>
              <div className="mb-success-rule" />
              <p className="mb-success-lead">
                Everything you sent is with the Brobot team. <strong>Watch your inbox</strong> — your confirmation email should land shortly.
              </p>
              <p className="mb-success-tail">
                Questions? We&apos;re here for you — <span className="hl">info@thebrobot.com</span>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="mb-wrap">
        <div className="mb-inner">

          {/* HEADER */}
          <div className="mb-header">
            <div className="mb-badge">
              <span className="mb-pill mb-pill-m">Maverick</span>
              <span className="mb-pill mb-pill-x">×</span>
              <span className="mb-pill mb-pill-b">Brobot</span>
            </div>
            <h1 className="mb-h1">New Client<br /><em>Deal Submission</em></h1>
            <p className="mb-sub">Complete within 24 hours of close. Submit to Brobot for account activation.</p>
            <div className="mb-rule" />
          </div>

          {/* PROGRESS */}
          <div className="mb-prog-wrap">
            <div className="mb-prog-track-bg">
              <div className="mb-prog-line" />
              <div className="mb-prog-fill" style={{ width: progFill }} />
              {STEPS.map((_, i) => (
                <div key={i} className={`mb-dot ${i + 1 === step ? "active" : i + 1 < step ? "done" : ""}`}>
                  {i + 1 < step ? "✓" : `0${i + 1}`}
                </div>
              ))}
            </div>
            <div className="mb-prog-labels">
              {STEPS.map((label, i) => (
                <span key={i} className={i + 1 === step ? "active" : i + 1 < step ? "done" : ""}>{label}</span>
              ))}
            </div>
          </div>

          {/* ── STEP 1: CLIENT ── */}
          {step === 1 && (
            <div>
              <div className="mb-card">
                <div className="mb-card-head">
                  <span className="mb-card-num">01 —</span>
                  <span className="mb-card-title">Client Business Information</span>
                </div>
                <div className="mb-card-body">
                  <div className="mb-g2">
                    <div className="mb-field mb-span2">
                      <label className="mb-label">Legal Business Name <span className="req">*</span></label>
                      <input className="mb-input" value={form.business_name} onChange={e => set("business_name", e.target.value)} placeholder="As it appears on the signed agreement" />
                    </div>
                    <div className="mb-field mb-span2">
                      <label className="mb-label">Full Address <span className="req">*</span></label>
                      <input className="mb-input" value={form.address} onChange={e => set("address", e.target.value)} placeholder="123 Main St, City, State ZIP" />
                    </div>
                    <div className="mb-field">
                      <label className="mb-label">Industry / Vertical <span className="req">*</span></label>
                      <select className="mb-select" value={form.industry} onChange={e => set("industry", e.target.value)}>
                        {INDUSTRIES.map(i => <option key={i} value={i === "Select industry…" ? "" : i}>{i}</option>)}
                      </select>
                    </div>
                    <div className="mb-field">
                      <label className="mb-label">Business Website <span className="req">*</span></label>
                      <input className="mb-input" value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://" />
                    </div>
                    <div className="mb-field mb-span2">
                      <label className="mb-label">Main Business Phone <span className="req">*</span></label>
                      <input className="mb-input" value={form.biz_phone} onChange={e => set("biz_phone", e.target.value)} placeholder="(000) 000-0000" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-card">
                <div className="mb-card-head">
                  <span className="mb-card-num">02 —</span>
                  <span className="mb-card-title">Decision-Maker Contact</span>
                </div>
                <div className="mb-card-body">
                  <div className="mb-g2">
                    <div className="mb-field">
                      <label className="mb-label">First Name <span className="req">*</span></label>
                      <input className="mb-input" value={form.contact_first} onChange={e => set("contact_first", e.target.value)} placeholder="First" />
                    </div>
                    <div className="mb-field">
                      <label className="mb-label">Last Name <span className="req">*</span></label>
                      <input className="mb-input" value={form.contact_last} onChange={e => set("contact_last", e.target.value)} placeholder="Last" />
                    </div>
                    <div className="mb-field">
                      <label className="mb-label">Direct Phone <span className="req">*</span></label>
                      <input className="mb-input" value={form.contact_phone} onChange={e => set("contact_phone", e.target.value)} placeholder="(000) 000-0000" />
                    </div>
                    <div className="mb-field">
                      <label className="mb-label">Email Address <span className="req">*</span></label>
                      <input className="mb-input" value={form.contact_email} onChange={e => set("contact_email", e.target.value)} placeholder="name@business.com" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-nav">
                <div />
                <button className="mb-btn-primary" onClick={goNext}>Next — Deal Details →</button>
              </div>
            </div>
          )}

          {/* ── STEP 2: DEAL ── */}
          {step === 2 && (
            <div>
              <div className="mb-card mb-card-deal-lines">
                <div className="mb-card-head">
                  <span className="mb-card-num">03 —</span>
                  <span className="mb-card-title">Line items on this deal</span>
                </div>
                <div className="mb-card-body">
                  <p className="mb-deal-step-hint">
                    <strong>One row per product or service.</strong> On each line, choose the product, then enter monthly amount, any one-time setup fee for that line, and contract term in months. Multiple products? Use <strong>Add line</strong> for each.
                  </p>
                  {form.products.map((p, i) => (
                    <div className="mb-prod-row" key={i}>
                      <div className="mb-prod-col mb-prod-col-product">
                        <div className="mb-prod-col-label">Product</div>
                        <select
                          className="mb-select"
                          value={p.productId}
                          onChange={e => {
                            const v = e.target.value;
                            setForm(f => {
                              const rows = [...f.products];
                              rows[i] = {
                                ...rows[i],
                                productId: v,
                                customLabel: v === "other" ? rows[i].customLabel : "",
                              };
                              return { ...f, products: rows };
                            });
                          }}
                        >
                          {PRODUCT_OPTIONS.map(opt => (
                            <option key={opt.value || "placeholder"} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {p.productId === "other" && (
                          <>
                            <label className="mb-prod-col-label" style={{ marginTop: 10 }} htmlFor={`mb-custom-product-${i}`}>Describe the product or service</label>
                            <input
                              id={`mb-custom-product-${i}`}
                              className="mb-input mb-prod-other-input"
                              value={p.customLabel}
                              onChange={e => setProduct(i, "customLabel", e.target.value)}
                              placeholder="Type the product or service name"
                            />
                          </>
                        )}
                      </div>
                      <div className="mb-prod-col">
                        <div className="mb-prod-col-label">Monthly amount</div>
                        <input className="mb-prod-input" value={p.mrc} onChange={e => setProduct(i, "mrc", e.target.value)} placeholder="$ / month" />
                      </div>
                      <div className="mb-prod-col">
                        <div className="mb-prod-col-label">Setup fee</div>
                        <input className="mb-prod-input" value={p.setup} onChange={e => setProduct(i, "setup", e.target.value)} placeholder="$ one-time or 0" />
                      </div>
                      <div className="mb-prod-col">
                        <div className="mb-prod-col-label">Contract term</div>
                        <input className="mb-prod-input" value={p.term} onChange={e => setProduct(i, "term", e.target.value)} placeholder="Months" />
                      </div>
                      <button type="button" className="mb-remove-btn" onClick={() => removeProduct(i)} disabled={form.products.length === 1} title={form.products.length === 1 ? "Keep at least one line" : "Remove line"}>×</button>
                    </div>
                  ))}
                  <button type="button" className="mb-add-btn" onClick={addProduct}>+ Add line</button>
                  <div className="mb-deal-summary-row">
                    <div className="mb-deal-summary-box mb-deal-summary-box--mrc">
                      <div className="mb-deal-summary-label">Total expected monthly billing</div>
                      <div className="mb-deal-summary-value">{formatUsd(dealLineSummaries.sumMrc)}</div>
                      <div className="mb-deal-summary-note">Adds up every line&apos;s monthly amount.</div>
                    </div>
                    <div className="mb-deal-summary-box mb-deal-summary-box--setup">
                      <div className="mb-deal-summary-label">Total setup fees</div>
                      <div className="mb-deal-summary-value">{formatUsd(dealLineSummaries.sumSetup)}</div>
                      <div className="mb-deal-summary-note">Adds up one-time setup fees from each line.</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-nav">
                <button className="mb-btn-ghost" onClick={goPrev}>← Back</button>
                <button className="mb-btn-primary" onClick={goNext}>Next — Billing →</button>
              </div>
            </div>
          )}

          {/* ── STEP 3: BILLING ── */}
          {step === 3 && (
            <div>
              <div className="mb-card">
                <div className="mb-card-head">
                  <span className="mb-card-num">04 —</span>
                  <span className="mb-card-title">Payment &amp; Billing</span>
                </div>
                <div className="mb-card-body">
                  <div className="mb-g2" style={{ marginBottom: 16 }}>
                    <div className="mb-field">
                      <label className="mb-label">Date of Sale <span className="req">*</span></label>
                      <input className="mb-input" type="date" value={form.sale_date} onChange={e => set("sale_date", e.target.value)} />
                    </div>
                  </div>

                  <div className="mb-field" style={{ marginBottom: 16 }}>
                    <label className="mb-label">Billing Type <span className="req">*</span></label>
                    <div className="mb-billing-grid">
                      {[
                        { val: "charge_today", title: "Charge Today", sub: "CC collected at close. Billing begins immediately on service start date." },
                        { val: "att_port", title: "AT&T Port — 10-Day Trial", sub: "CC required on file. Charge triggers on port completion (~10 days)." }
                      ].map(opt => (
                        <div key={opt.val} className={`mb-billing-card${form.billing_type === opt.val ? " selected" : ""}`} onClick={() => set("billing_type", opt.val)}>
                          <div className="mb-billing-title">{opt.title}</div>
                          <div className="mb-billing-sub">{opt.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-callout mb-callout-o" style={{ marginBottom: 16 }}>
                    <span className="mb-callout-icon">💳</span>
                    <div className="mb-callout-text"><strong>Payment link must be sent and CC collected before submitting.</strong> A valid CC on file is required in both billing scenarios.</div>
                  </div>

                  <div className="mb-g2">
                    <div className="mb-field">
                      <label className="mb-label">CC Collected? <span className="req">*</span></label>
                      <select className="mb-select" value={form.cc_collected} onChange={e => set("cc_collected", e.target.value)}>
                        <option value="">Select…</option>
                        <option value="yes">Yes — CC on file, confirmed</option>
                        <option value="pending">Sent — awaiting client</option>
                      </select>
                    </div>
                    <div className="mb-field">
                      <label className="mb-label">Estimated First Charge Date <span className="req">*</span></label>
                      <input className="mb-input" type="date" value={form.charge_date} onChange={e => set("charge_date", e.target.value)} />
                    </div>
                  </div>

                  <div className="mb-callout mb-callout-c">
                    <span className="mb-callout-icon">📡</span>
                    <div className="mb-callout-text"><strong>AT&T port clients:</strong> Set charge date ~10 days from sale date. Brobot will confirm exact date once port completes.</div>
                  </div>
                </div>
              </div>
              <div className="mb-nav">
                <button className="mb-btn-ghost" onClick={goPrev}>← Back</button>
                <button className="mb-btn-primary" onClick={goNext}>Next — Rep Info →</button>
              </div>
            </div>
          )}

          {/* ── STEP 4: REP ── */}
          {step === 4 && (
            <div>
              <div className="mb-card">
                <div className="mb-card-head">
                  <span className="mb-card-num">05 —</span>
                  <span className="mb-card-title">Rep &amp; Deal Attribution</span>
                </div>
                <div className="mb-card-body">
                  <div className="mb-g2">
                    <div className="mb-field">
                      <label className="mb-label">Maverick Rep Full Name <span className="req">*</span></label>
                      <input className="mb-input" value={form.rep_name} onChange={e => set("rep_name", e.target.value)} placeholder="First Last" />
                    </div>
                    <div className="mb-field">
                      <label className="mb-label">Maverick Rep Email <span className="req">*</span></label>
                      <input className="mb-input" value={form.rep_email} onChange={e => set("rep_email", e.target.value)} placeholder="rep@maverickcomm.com" />
                    </div>
                    <div className="mb-field">
                      <label className="mb-label">Agreement Signed Date <span className="req">*</span></label>
                      <input className="mb-input" type="date" value={form.signed_date} onChange={e => set("signed_date", e.target.value)} />
                    </div>
                    <div className="mb-field">
                      <label className="mb-label">Service Start Date <span className="req">*</span></label>
                      <input className="mb-input" type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} />
                    </div>
                  </div>
                  <div className="mb-field" style={{ marginTop: 14 }}>
                    <label className="mb-label">Special Notes / Client Requests</label>
                    <textarea className="mb-textarea" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="e.g. Client requested onboarding before April 1st, existing Hibu contract expires end of month…" />
                  </div>
                  <div className="mb-field" style={{ marginTop: 14 }}>
                    <label className="mb-label">Rep Confirms <span className="req">*</span></label>
                    <div className="mb-checks">
                      {[
                        { key: "confirm_signed", text: "Client has reviewed and signed the service agreement." },
                        { key: "confirm_payment", text: "Payment link was sent and CC has been collected or is pending collection." },
                        { key: "confirm_onboard", text: "Client has been told to expect an onboarding call from Brobot within 1–2 business days." },
                      ].map(c => (
                        <label key={c.key} className="mb-check">
                          <input type="checkbox" checked={form[c.key]} onChange={e => set(c.key, e.target.checked)} />
                          <span>{c.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-nav">
                <button className="mb-btn-ghost" onClick={goPrev}>← Back</button>
                <button className="mb-btn-primary" onClick={goNext}>Next — Upload Files →</button>
              </div>
            </div>
          )}

          {/* ── STEP 5: FILES ── */}
          {step === 5 && (
            <div>
              <div className="mb-card mb-card-upload-embed">
                <div className="mb-card-head">
                  <span className="mb-card-num">06 —</span>
                  <span className="mb-card-title">Document Uploads</span>
                </div>
                <div className="mb-card-body">
                  <div className="mb-callout mb-callout-o" style={{ marginBottom: 18 }}>
                    <span className="mb-callout-icon">📎</span>
                    <div className="mb-callout-text"><strong>Upload all required documents below.</strong> LOA and Signed Terms are required. AT&T Bill is required for port clients only. PDFs only.</div>
                  </div>
                </div>
                <div className="mb-ghl-wrap">
                  <iframe
                    src="https://api.leadconnectorhq.com/widget/form/H8C5vTrJlfHah3Evz0cR"
                    style={{
                      border: "none",
                      outline: "none",
                      boxShadow: "none",
                      margin: 0,
                      padding: 0,
                      display: "block",
                      borderRadius: 0,
                    }}
                    frameBorder={0}
                    loading="eager"
                    id="inline-H8C5vTrJlfHah3Evz0cR"
                    data-layout="{'id':'INLINE'}"
                    data-trigger-type="alwaysShow"
                    data-trigger-value=""
                    data-activation-type="alwaysActivated"
                    data-activation-value=""
                    data-deactivation-type="neverDeactivate"
                    data-deactivation-value=""
                    data-form-name={"Porting Form\u00a0"}
                    data-height="560"
                    data-layout-iframe-id="inline-H8C5vTrJlfHah3Evz0cR"
                    data-form-id="H8C5vTrJlfHah3Evz0cR"
                    title={"Porting Form\u00a0"}
                  />
                </div>
                <div className="mb-card-body">
                  <div className="mb-callout mb-callout-c" style={{ marginTop: 0 }}>
                    <span className="mb-callout-icon">💡</span>
                    <div className="mb-callout-text">Files go directly into the client record in Brobot's CRM. Once uploaded, hit <strong>Submit Deal</strong> below.</div>
                  </div>
                </div>
              </div>
              <div className="mb-nav" style={{ flexWrap: "wrap", justifyContent: "flex-end", gap: 12 }}>
                {submitError ? (
                  <div className="mb-submit-error" style={{ width: "100%", flexBasis: "100%" }} role="alert">
                    {submitError}
                  </div>
                ) : null}
                <button type="button" className="mb-btn-ghost" onClick={goPrev} disabled={submitLoading}>← Back</button>
                <button type="button" className="mb-btn-submit" onClick={handleSubmit} disabled={submitLoading}>
                  {submitLoading ? "Sending…" : "Submit Deal to Brobot ⚡"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
