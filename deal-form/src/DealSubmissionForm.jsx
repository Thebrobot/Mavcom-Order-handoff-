import { useState, useEffect, useLayoutEffect, useMemo } from "react";
import { PAYMENT_LINK_CATEGORIES, PAYMENT_PRICE_SUFFIX } from "./paymentLinks.js";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,800&family=Barlow+Condensed:ital,wght@0,600;0,700;0,800;1,700&family=JetBrains+Mono:wght@400;500&display=swap');

  .mb-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .mb-wrap {
    --mb-brobot-yellow: #f5a623;
    --mb-brobot-on-yellow: #000000;
    background: #f1f5f9;
    min-height: 100vh;
    font-family: 'Barlow', sans-serif;
    color: #0f172a;
    padding: 40px 16px 80px;
    position: relative;
  }
  .mb-wrap::before {
    content: '';
    position: fixed;
    inset: 0;
    background: radial-gradient(ellipse 80% 50% at 20% -10%, rgba(245,166,35,0.12) 0%, transparent 55%),
                radial-gradient(ellipse 60% 40% at 80% 110%, rgba(56,189,248,0.1) 0%, transparent 55%);
    pointer-events: none;
    z-index: 0;
  }
  .mb-inner { max-width: 760px; margin: 0 auto; position: relative; z-index: 1; }

  /* HEADER */
  .mb-header { text-align: center; margin-bottom: 40px; }
  .mb-badge { display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #e2e8f0; border-radius: 100px; padding: 6px 16px; margin-bottom: 18px; box-shadow: 0 1px 2px rgba(15,23,42,0.04); }
  .mb-pill { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 8px; border-radius: 100px; }
  .mb-pill-m { background: #f1f5f9; color: #475569; }
  .mb-pill-x { color: #64748b; font-size: 14px; }
  .mb-pill-b { background: var(--mb-brobot-yellow); color: var(--mb-brobot-on-yellow); font-weight: 700; }
  .mb-h1 { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(32px, 7vw, 54px); font-weight: 800; text-transform: uppercase; letter-spacing: -0.01em; line-height: 1; color: #0f172a; margin-bottom: 10px; }
  .mb-h1 em { font-style: italic; color: #d97706; }
  .mb-sub { font-size: 15px; color: #475569; max-width: 460px; margin: 0 auto; line-height: 1.75; }
  .mb-rule { width: 56px; height: 2px; background: linear-gradient(90deg, #f5a623, #38bdf8); margin: 16px auto 0; border-radius: 2px; }

  .mb-quick-links {
    margin: 0 auto 28px;
    width: 100%;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px 18px;
    box-shadow: 0 1px 3px rgba(15,23,42,0.06);
  }
  .mb-quick-links-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .mb-payment-block { width: 100%; }
  .mb-payment-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 12px;
  }
  .mb-payment-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 14px 16px;
  }
  .mb-payment-field { flex: 1 1 180px; min-width: 0; }
  .mb-payment-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    flex: 0 0 auto;
    padding-bottom: 2px;
  }
  .mb-payment-plan-detail {
    margin-top: 8px;
    padding: 6px 10px;
    background: linear-gradient(180deg, #fafbfc 0%, #f1f5f9 100%);
    border: 1px solid #e2e8f0;
    border-radius: 6px;
  }
  .mb-payment-plan-detail-inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0;
    min-height: 0;
  }
  .mb-payment-plan-name {
    font-family: 'Barlow', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    line-height: 1.35;
    flex: 1 1 38%;
    min-width: 140px;
    padding: 0 10px 0 0;
    border-right: 1px solid #cbd5e1;
    display: flex;
    align-items: center;
  }
  .mb-payment-plan-price-wrap {
    flex: 1 1 50%;
    min-width: 120px;
    padding: 0 0 0 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    text-align: right;
  }
  .mb-payment-plan-price-sentence {
    font-family: 'Barlow', sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: #334155;
    line-height: 1.3;
    margin: 0;
  }
  .mb-payment-plan-price-sentence strong {
    font-weight: 600;
    color: #0f172a;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 17px;
    letter-spacing: 0.02em;
  }
  .mb-payment-plan-price-unit {
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
  }
  .mb-payment-actions .mb-btn-primary,
  .mb-payment-actions .mb-btn-ghost { padding: 11px 18px; font-size: 13px; }
  .mb-payment-actions .mb-btn-primary:disabled,
  .mb-payment-actions .mb-btn-ghost:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
  }
  @media (max-width: 540px) {
    .mb-payment-plan-detail-inner {
      flex-direction: column;
      align-items: stretch;
    }
    .mb-payment-plan-name {
      border-right: none;
      border-bottom: 1px solid #cbd5e1;
      padding: 0 0 6px 0;
    }
    .mb-payment-plan-price-wrap {
      align-items: flex-start;
      text-align: left;
      padding: 6px 0 0 0;
      width: 100%;
    }
    .mb-payment-actions { width: 100%; justify-content: stretch; }
    .mb-payment-actions .mb-btn-primary,
    .mb-payment-actions .mb-btn-ghost { flex: 1 1 auto; justify-content: center; }
  }
  .mb-quick-links-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: stretch;
  }
  .mb-quick-links-pills .mb-quick-link-btn { flex: 1 1 140px; min-width: 0; }
  /* Same chip colors as .mb-pill-b — fill/text also set inline so placeholders match Brobot */
  .mb-quick-link-btn {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(9px, 2.2vw, 13px);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    line-height: 1.2;
    padding: 14px 12px;
    border-radius: 9999px;
    border: none;
    cursor: pointer;
    text-decoration: none;
    text-align: center;
    transition: filter 0.2s;
    box-shadow: none;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
  }
  .mb-quick-link-btn:hover {
    filter: brightness(1.06);
  }
  .mb-quick-link-btn:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(245,166,35,0.45);
  }
  .mb-quick-link-btn--placeholder {
    cursor: default;
    border: 1px dashed rgba(0,0,0,0.28);
  }
  @media (max-width: 420px) {
    .mb-quick-links { padding: 12px 12px; }
    .mb-quick-link-btn { min-height: 44px; padding: 12px 6px; }
  }

  /* PROGRESS */
  .mb-prog-wrap { margin-bottom: 32px; }
  .mb-prog-track-bg { position: relative; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .mb-prog-line { position: absolute; top: 50%; left: 14px; right: 14px; height: 2px; background: #cbd5e1; transform: translateY(-50%); }
  .mb-prog-fill { position: absolute; top: 50%; left: 14px; height: 2px; background: linear-gradient(90deg, #f5a623, #38bdf8); transform: translateY(-50%); transition: width 0.4s ease; }
  .mb-dot { width: 28px; height: 28px; border-radius: 50%; border: 2px solid #94a3b8; background: #fff; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #475569; position: relative; z-index: 1; transition: all 0.3s; flex-shrink: 0; box-shadow: 0 1px 2px rgba(15,23,42,0.06); }
  .mb-dot.active { border-color: #f5a623; background: rgba(245,166,35,0.12); color: #d97706; }
  .mb-dot.done { border-color: #22c55e; background: rgba(34,197,94,0.1); color: #16a34a; }
  .mb-prog-labels { display: flex; justify-content: space-between; }
  .mb-prog-labels span { font-size: 10px; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; width: 28px; text-align: center; transition: color 0.3s; }
  .mb-prog-labels span.active { color: #d97706; }
  .mb-prog-labels span.done { color: #16a34a; }

  /* SECTION CARD */
  .mb-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 14px; box-shadow: 0 1px 3px rgba(15,23,42,0.06); }
  .mb-card-head { display: flex; align-items: center; gap: 10px; padding: 14px 22px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
  .mb-card-num { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d97706; letter-spacing: 0.1em; }
  .mb-card-title { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #0f172a; }
  .mb-card-body { padding: 18px 22px; }

  /* GRID */
  .mb-g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .mb-g1 { display: grid; grid-template-columns: 1fr; gap: 12px; }
  .mb-span2 { grid-column: span 2; }

  /* FIELD */
  .mb-field { display: flex; flex-direction: column; gap: 5px; }
  .mb-label { font-family: 'Barlow', sans-serif; font-size: 15px; font-weight: 600; text-transform: none; letter-spacing: 0.01em; color: #000000; }
  .mb-label .req { color: #d97706; margin-left: 2px; }
  .mb-input { background: #fff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 11px 14px; font-family: 'Barlow', sans-serif; font-size: 16px; color: #0f172a; outline: none; width: 100%; transition: border-color 0.2s, box-shadow 0.2s; -webkit-appearance: none; }
  .mb-input::placeholder { color: #94a3b8; font-size: 15px; }
  .mb-input:focus { border-color: #f5a623; box-shadow: 0 0 0 3px rgba(245,166,35,0.2); }
  .mb-input[type="date"] { color-scheme: light; min-height: 46px; padding-right: 12px; }
  .mb-input[type="date"]::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.85;
    filter: none;
    width: 1.35rem;
    height: 1.35rem;
    padding: 4px;
    margin-left: 2px;
  }
  .mb-input[type="date"]::-moz-calendar-picker-indicator {
    opacity: 0.85;
    cursor: pointer;
  }
  .mb-input[type="date"]::-webkit-datetime-edit-text { color: #334155; padding: 0 0.2em; }
  .mb-input[type="date"]::-webkit-datetime-edit-month-field,
  .mb-input[type="date"]::-webkit-datetime-edit-day-field,
  .mb-input[type="date"]::-webkit-datetime-edit-year-field { color: #0f172a; }
  .mb-select { background-color: #fff; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='8'%3E%3Cpath d='M0 0l7 8 7-8z' fill='%23475569'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; border: 1px solid #cbd5e1; border-radius: 6px; padding: 11px 36px 11px 14px; font-family: 'Barlow', sans-serif; font-size: 16px; color: #0f172a; outline: none; width: 100%; -webkit-appearance: none; cursor: pointer; transition: border-color 0.2s; min-height: 46px; }
  .mb-select:focus { border-color: #f5a623; outline: none; box-shadow: 0 0 0 3px rgba(245,166,35,0.2); }
  .mb-select option { background: #fff; color: #0f172a; }
  .mb-textarea { background: #fff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 11px 14px; font-family: 'Barlow', sans-serif; font-size: 16px; color: #0f172a; outline: none; width: 100%; min-height: 88px; resize: vertical; line-height: 1.65; transition: border-color 0.2s; }
  .mb-textarea::placeholder { color: #94a3b8; font-size: 15px; }
  .mb-textarea:focus { border-color: #f5a623; box-shadow: 0 0 0 3px rgba(245,166,35,0.2); }

  /* PRODUCT ROWS */
  .mb-prod-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 8px; align-items: end; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; }
  .mb-prod-col { display: flex; flex-direction: column; gap: 4px; }
  .mb-prod-col-label { font-family: 'Barlow', sans-serif; font-size: 13px; font-weight: 600; text-transform: none; letter-spacing: 0.01em; color: #000000; }
  .mb-prod-input { background: transparent; border: none; border-bottom: 1px solid #cbd5e1; border-radius: 0; padding: 4px 2px; font-size: 15px; color: #0f172a; outline: none; font-family: 'Barlow', sans-serif; width: 100%; transition: border-color 0.2s; }
  .mb-prod-input::placeholder { color: #94a3b8; font-size: 14px; }
  .mb-card-deal-lines .mb-prod-row {
    grid-template-columns: minmax(140px, 2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) auto;
    padding: 14px 14px;
    margin-bottom: 10px;
    border-color: #e2e8f0;
    gap: 12px;
    align-items: start;
  }
  .mb-card-deal-lines .mb-remove-btn { margin-top: 26px; flex-shrink: 0; }
  .mb-card-deal-lines .mb-prod-col-product .mb-select { width: 100%; font-size: 16px; }
  .mb-card-deal-lines .mb-prod-other-input { margin-top: 10px; width: 100%; }
  .mb-card-deal-lines .mb-prod-col-label { font-size: 14px; font-weight: 600; letter-spacing: 0.01em; color: #000000; }
  .mb-card-deal-lines .mb-prod-input { font-size: 16px; padding: 8px 4px; border-bottom-width: 2px; }
  .mb-card-deal-lines .mb-prod-input::placeholder { font-size: 14px; color: #94a3b8; }
  .mb-deal-step-hint { font-size: 16px; color: #475569; line-height: 1.7; margin-bottom: 18px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }
  .mb-deal-step-hint strong { color: #0f172a; font-weight: 600; }
  .mb-prod-input:focus { border-color: #f5a623; }
  .mb-remove-btn { background: #fff; border: 1px solid #fecaca; color: #dc2626; border-radius: 4px; width: 28px; height: 28px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; align-self: flex-end; flex-shrink: 0; font-family: monospace; }
  .mb-remove-btn:hover { border-color: #ef4444; color: #b91c1c; background: #fef2f2; }
  .mb-add-btn { background: #fff; border: 1px dashed rgba(245,166,35,0.45); color: #d97706; border-radius: 6px; padding: 8px 16px; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; width: 100%; margin-top: 4px; }
  .mb-add-btn:hover { background: rgba(245,166,35,0.08); border-color: #f5a623; }

  .mb-deal-summary-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 20px;
    padding-top: 18px;
    border-top: 1px solid #e2e8f0;
  }
  .mb-deal-summary-box {
    padding: 16px 18px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
  }
  .mb-deal-summary-box--mrc {
    border-color: rgba(245,166,35,0.45);
    background: linear-gradient(145deg, rgba(245,166,35,0.12), rgba(255,255,255,0.9));
  }
  .mb-deal-summary-box--setup {
    border-color: rgba(56,189,248,0.4);
    background: linear-gradient(145deg, rgba(56,189,248,0.1), rgba(255,255,255,0.9));
  }
  .mb-deal-summary-label {
    font-family: 'Barlow', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.01em;
    text-transform: none;
    color: #000000;
    margin-bottom: 10px;
  }
  .mb-deal-summary-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(20px, 5vw, 26px);
    font-weight: 600;
    color: #d97706;
    line-height: 1.2;
  }
  .mb-deal-summary-box--setup .mb-deal-summary-value { color: #0284c7; }
  .mb-deal-summary-note { font-size: 13px; color: #64748b; margin-top: 8px; line-height: 1.5; }

  /* BILLING TOGGLE */
  .mb-billing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 4px; }
  .mb-billing-card { padding: 14px 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
  .mb-billing-card.selected { border-color: #f5a623; background: rgba(245,166,35,0.08); box-shadow: 0 0 0 1px rgba(245,166,35,0.1); }
  .mb-billing-title { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #000000; transition: color 0.2s; margin-bottom: 3px; }
  .mb-billing-card.selected .mb-billing-title { color: #d97706; }
  .mb-billing-sub { font-size: 13px; color: #64748b; line-height: 1.45; transition: color 0.2s; }
  .mb-billing-card.selected .mb-billing-sub { color: #92400e; }

  /* CALLOUT */
  .mb-callout { display: flex; gap: 10px; padding: 11px 14px; border-radius: 6px; margin-top: 12px; }
  .mb-callout-o { background: rgba(245,166,35,0.1); border: 1px solid rgba(245,166,35,0.25); }
  .mb-callout-c { background: rgba(56,189,248,0.07); border: 1px solid rgba(56,189,248,0.15); }
  .mb-callout-icon { font-size: 13px; flex-shrink: 0; margin-top: 1px; }
  .mb-callout-text { font-size: 14px; color: #334155; line-height: 1.65; }
  .mb-callout-text strong { color: #d97706; font-weight: 600; }
  .mb-callout-c .mb-callout-text strong { color: #0284c7; }

  /* CHECKBOXES */
  .mb-checks { display: flex; flex-direction: column; gap: 10px; margin-top: 6px; }
  .mb-check { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; }
  .mb-check input { width: 18px; height: 18px; min-width: 18px; margin-top: 2px; accent-color: #f5a623; cursor: pointer; }
  .mb-check span { font-size: 15px; font-weight: 500; color: #000000; line-height: 1.55; }

  /* GHL EMBED */
  .mb-card-upload-embed { border: none; }
  .mb-card-upload-embed .mb-card-head { border-bottom: 1px solid #e2e8f0; }
  .mb-ghl-wrap {
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;
    outline: none;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 3px;
    isolation: isolate;
    /* Enough height for the embed without a huge blank area under the frame */
    height: min(72vh, 640px);
    margin-bottom: 8px;
    line-height: 0;
  }
  .mb-ghl-wrap iframe {
    display: block;
    width: 100%;
    height: 100%;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    background: #fff;
    color-scheme: light;
    border-radius: 3px;
    margin: 0;
    padding: 0;
    vertical-align: top;
  }

  /* NAV */
  .mb-nav { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; gap: 12px; }
  .mb-btn-primary { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 12px 28px; border-radius: 6px; border: none; cursor: pointer; background: #f5a623; color: #000; transition: all 0.2s; display: flex; align-items: center; gap: 6px; box-shadow: 0 1px 2px rgba(15,23,42,0.08); }
  .mb-btn-primary:hover { background: #fbbf24; transform: translateY(-1px); }
  .mb-btn-ghost { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 12px 24px; border-radius: 6px; background: #fff; border: 1px solid #cbd5e1; color: #475569; cursor: pointer; transition: all 0.2s; }
  .mb-btn-ghost:hover { border-color: #94a3b8; color: #0f172a; background: #f8fafc; }
  .mb-btn-submit { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 13px 32px; border-radius: 6px; border: none; cursor: pointer; background: linear-gradient(135deg, #f5a623, #e8922a); color: #000; transition: all 0.2s; box-shadow: 0 2px 8px rgba(245,166,35,0.25); }
  .mb-btn-submit:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(245,166,35,0.35); }
  .mb-btn-submit:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
  .mb-submit-error { color: #b91c1c; font-size: 14px; line-height: 1.55; margin: 0 0 14px; max-width: 520px; padding: 12px 14px; border-radius: 6px; background: #fef2f2; border: 1px solid #fecaca; }

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
    color: #d97706;
    margin-bottom: 22px;
    padding: 5px 14px;
    border-radius: 100px;
    border: 1px solid rgba(245,166,35,0.35);
    background: rgba(245,166,35,0.1);
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
    box-shadow: 0 4px 24px rgba(34,197,94,0.15);
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
    color: #0f172a;
    margin-bottom: 8px;
    line-height: 1.05;
    letter-spacing: -0.02em;
  }
  .mb-success h2 em { font-style: italic; color: #16a34a; }
  .mb-success-rule {
    width: 64px;
    height: 2px;
    background: linear-gradient(90deg, #f5a623, #38bdf8);
    margin: 0 auto 22px;
    border-radius: 2px;
  }
  .mb-success-lead {
    font-size: 15px;
    color: #475569;
    max-width: 440px;
    margin: 0 auto 18px;
    line-height: 1.75;
  }
  .mb-success-lead strong { color: #0f172a; font-weight: 600; }
  .mb-success-tail {
    font-size: 14px;
    color: #64748b;
    max-width: 400px;
    margin: 0 auto;
    line-height: 1.7;
  }
  .mb-success-tail .hl { color: #d97706; font-weight: 500; }

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

/** Recurring commission catalog — default MRC matches sheet (display price). */
const PRODUCT_OPTIONS = [
  { value: "", label: "Select product…" },
  { value: "brobot-one-core", label: "Brobot One Core" },
  { value: "brobot-one-basic", label: "Brobot One Basic" },
  { value: "ai-receptionist-priority", label: "AI Receptionist ⚡PRIORITY" },
  { value: "ai-growth-priority", label: "AI Growth ⚡PRIORITY" },
  { value: "additional-numbers", label: "Additional Numbers" },
  { value: "revubro-starter", label: "RevuBro Starter" },
  { value: "revubro-growth", label: "RevuBro Growth" },
  { value: "revubro-pro", label: "RevuBro Pro" },
  { value: "imapspro", label: "iMapsPro" },
  { value: "bot-only-ai-priority", label: "Bot-Only AI ⚡PRIORITY" },
  { value: "other", label: "Other — custom product" },
];

/** Prefills monthly amount when a catalog line is chosen (rep can override). */
const PRODUCT_DEFAULT_MRC = {
  "brobot-one-core": "297",
  "brobot-one-basic": "129.99",
  "ai-receptionist-priority": "497",
  "ai-growth-priority": "697",
  "additional-numbers": "25",
  "revubro-starter": "97",
  "revubro-growth": "197",
  "revubro-pro": "297",
  imapspro: "25",
  "bot-only-ai-priority": "499",
};

/** LeadConnector file-upload widget — query param must match hidden field name in GHL (see .env.example). */
const GHL_UPLOAD_FORM_EMBED_URL =
  import.meta.env.VITE_GHL_UPLOAD_FORM_EMBED_URL?.trim() ||
  "https://api.leadconnectorhq.com/widget/form/H8C5vTrJlfHah3Evz0cR";

const GHL_UPLOAD_FORM_EMAIL_PARAM =
  import.meta.env.VITE_GHL_UPLOAD_FORM_EMAIL_PARAM?.trim() || "email";

function looksLikeValidEmail(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

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

/** List prices in payment picker: whole dollars without “.00” (e.g. $335). */
function formatListPriceUsd(n) {
  if (!Number.isFinite(n)) return "—";
  const r = Math.round(n);
  if (Math.abs(n - r) < 1e-9) return `$${r}`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
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
  const productsJsonStr = JSON.stringify(productsDetailed);
  const productsLinesText = productsDetailed
    .map((line) => {
      const name =
        line.customLabel && String(line.customLabel).trim()
          ? line.customLabel
          : line.productLabel || line.productId || "Product";
      return `${name} | MRC ${line.monthlyAmount} | Setup ${line.setupFee} | ${line.contractTermMonths} mo`;
    })
    .join("\n");

  return {
    source: "deal-submission-form",
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
    /** JSON string — map to CRM “Products JSON” field (not raw `products`). */
    productsJson: productsJsonStr,
    /** Plain-text lines — cannot become [object Object]. */
    productsText: productsLinesText,
    /** Same strings with dot-style keys (no underscores) for merge tags / GHL. */
    "products.json": productsJsonStr,
    "products.text": productsLinesText,
    meta: {
      "products.json": productsJsonStr,
      "products.text": productsLinesText,
    },
    productLines: {
      json: productsJsonStr,
      text: productsLinesText,
    },
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

export default function DealSubmissionForm() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmUploadsDone, setConfirmUploadsDone] = useState(false);
  const [paymentCategoryIndex, setPaymentCategoryIndex] = useState(0);
  const [paymentLinkIndex, setPaymentLinkIndex] = useState(0);

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

  const contactEmailTrimmed = String(form.contact_email ?? "").trim();
  const uploadIframeSrc = useMemo(() => {
    if (!looksLikeValidEmail(contactEmailTrimmed)) return GHL_UPLOAD_FORM_EMBED_URL;
    const u = new URL(GHL_UPLOAD_FORM_EMBED_URL);
    u.searchParams.set(GHL_UPLOAD_FORM_EMAIL_PARAM, contactEmailTrimmed);
    return u.toString();
  }, [contactEmailTrimmed]);

  /** GHL form_embed.js reads the *host* page query string and forwards into the iframe; iframe ?email= alone often only appears in submission metadata. */
  useLayoutEffect(() => {
    if (step !== 5) return;
    if (!looksLikeValidEmail(contactEmailTrimmed)) return;
    try {
      const u = new URL(window.location.href);
      u.searchParams.set(GHL_UPLOAD_FORM_EMAIL_PARAM, contactEmailTrimmed);
      const q = u.searchParams.toString();
      window.history.replaceState(null, "", `${u.pathname}${q ? `?${q}` : ""}${u.hash}`);
    } catch { /* invalid URL */ }
  }, [step, contactEmailTrimmed]);

  useLayoutEffect(() => {
    if (step === 5) return;
    try {
      const u = new URL(window.location.href);
      if (!u.searchParams.has(GHL_UPLOAD_FORM_EMAIL_PARAM)) return;
      u.searchParams.delete(GHL_UPLOAD_FORM_EMAIL_PARAM);
      const q = u.searchParams.toString();
      window.history.replaceState(null, "", `${u.pathname}${q ? `?${q}` : ""}${u.hash}`);
    } catch { /* invalid URL */ }
  }, [step]);

  useEffect(() => {
    if (step !== 5) setConfirmUploadsDone(false);
  }, [step]);

  useEffect(() => {
    if (step !== 3) return;
    setForm(f => {
      if (f.billing_type === "") return { ...f, billing_type: "charge_today" };
      return f;
    });
  }, [step]);

  useEffect(() => {
    setPaymentLinkIndex(0);
  }, [paymentCategoryIndex]);

  const progFill = `${((step - 1) / (STEPS.length - 1)) * 100}%`;

  const selectedPaymentLink =
    PAYMENT_LINK_CATEGORIES[paymentCategoryIndex]?.links?.[paymentLinkIndex];
  const selectedPaymentUrl = String(selectedPaymentLink?.url ?? "").trim();

  const openPaymentLink = () => {
    if (!selectedPaymentUrl) return;
    window.open(selectedPaymentUrl, "_blank", "noopener,noreferrer");
  };

  const copyPaymentLink = async () => {
    if (!selectedPaymentUrl) return;
    try {
      await navigator.clipboard.writeText(selectedPaymentUrl);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = selectedPaymentUrl;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch { /* execCommand unavailable */ }
    }
  };

  const quickResourceLinks = useMemo(() => {
    const pick = (key) => {
      const v = import.meta.env[key];
      return typeof v === "string" && v.trim() ? v.trim() : null;
    };
    return [
      { key: "ai-knowledge", href: pick("VITE_LINK_AI_KNOWLEDGE"), label: "Brobot Copilot" },
      { key: "terms-loa", href: pick("VITE_LINK_TERMS_LOA"), label: "Terms & LOA (e-sign)" },
    ];
  }, []);

  const goNext = () => { if (step < 5) setStep(s => s + 1); };
  const goPrev = () => { if (step > 1) setStep(s => s - 1); };

  const handleSubmit = async () => {
    if (!confirmUploadsDone) return;
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
              <span className="mb-pill mb-pill-m">All-in deal</span>
              <span className="mb-pill mb-pill-x">×</span>
              <span className="mb-pill mb-pill-b">Brobot</span>
            </div>
            <h1 className="mb-h1">New Client<br /><em>Deal Submission</em></h1>
            <p className="mb-sub">Complete within 24 hours of close. One form for the full handoff—submit to Brobot for account activation.</p>
            <div className="mb-rule" />
          </div>

          <nav className="mb-quick-links" aria-label="Quick links">
            <div className="mb-quick-links-grid">
              <div className="mb-payment-block">
                <div className="mb-payment-title">Payment links</div>
                <div className="mb-payment-controls">
                  <div className="mb-field mb-payment-field">
                    <label className="mb-label" htmlFor="mb-pay-category">Category</label>
                    <select
                      id="mb-pay-category"
                      className="mb-select"
                      value={paymentCategoryIndex}
                      onChange={e => setPaymentCategoryIndex(Number(e.target.value))}
                    >
                      {PAYMENT_LINK_CATEGORIES.map((cat, i) => (
                        <option key={cat.id} value={i}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-field mb-payment-field">
                    <label className="mb-label" htmlFor="mb-pay-plan">Plan / checkout</label>
                    <select
                      id="mb-pay-plan"
                      className="mb-select"
                      value={paymentLinkIndex}
                      onChange={e => setPaymentLinkIndex(Number(e.target.value))}
                    >
                      {(PAYMENT_LINK_CATEGORIES[paymentCategoryIndex]?.links ?? []).map((link, i) => (
                        <option key={link.id} value={i}>
                          {Number.isFinite(link.priceUsd)
                            ? `${link.shortLabel || link.label} · ${formatListPriceUsd(link.priceUsd)}${PAYMENT_PRICE_SUFFIX}`
                            : (link.shortLabel || link.label)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-payment-actions">
                    <button
                      type="button"
                      className="mb-btn-primary"
                      onClick={openPaymentLink}
                      disabled={!selectedPaymentUrl}
                      title={!selectedPaymentUrl ? "Add this checkout URL in deal-form/src/paymentLinks.js" : "Open in new tab"}
                    >
                      Open link
                    </button>
                    <button
                      type="button"
                      className="mb-btn-ghost"
                      onClick={copyPaymentLink}
                      disabled={!selectedPaymentUrl}
                      title={!selectedPaymentUrl ? "Add this checkout URL in deal-form/src/paymentLinks.js" : "Copy URL"}
                    >
                      Copy
                    </button>
                  </div>
                </div>
                {selectedPaymentLink ? (
                  <div className="mb-payment-plan-detail" aria-live="polite">
                    <div className="mb-payment-plan-detail-inner">
                      <div className="mb-payment-plan-name">{selectedPaymentLink.label}</div>
                      {Number.isFinite(selectedPaymentLink.priceUsd) ? (
                        <div className="mb-payment-plan-price-wrap">
                          <p className="mb-payment-plan-price-sentence">
                            Price is <strong>{formatListPriceUsd(selectedPaymentLink.priceUsd)}</strong>
                            {PAYMENT_PRICE_SUFFIX ? (
                              <span className="mb-payment-plan-price-unit">{PAYMENT_PRICE_SUFFIX}</span>
                            ) : null}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="mb-quick-links-pills">
                {quickResourceLinks.map(item =>
                  item.href ? (
                    <a
                      key={item.key}
                      className="mb-pill mb-pill-b mb-quick-link-btn"
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ backgroundColor: "#f5a623", color: "#000" }}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span
                      key={item.key}
                      className="mb-pill mb-pill-b mb-quick-link-btn mb-quick-link-btn--placeholder"
                      title="URL not set in environment (VITE_*)"
                      style={{ backgroundColor: "#f5a623", color: "#000" }}
                    >
                      {item.label}
                    </span>
                  ),
                )}
              </div>
            </div>
          </nav>

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
                    <strong>One row per product or service.</strong> Choosing a catalog product fills the default commissionable MRR; adjust if the deal differs (e.g. Brobot One Basic override, per-unit lines). Add setup and term per line. Use <strong>Add line</strong> for multiple products.
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
                            const defaultMrc = v ? PRODUCT_DEFAULT_MRC[v] : undefined;
                            setForm(f => {
                              const rows = [...f.products];
                              rows[i] = {
                                ...rows[i],
                                productId: v,
                                customLabel: v === "other" ? rows[i].customLabel : "",
                                mrc: defaultMrc !== undefined ? defaultMrc : rows[i].mrc,
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
                        { val: "att_port", title: "10-Day Trial (Port-In)", sub: "CC required on file. Charge triggers on port completion (~10 days)." },
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
                    <div className="mb-callout-text"><strong>Port-in (10-day delay):</strong> Set charge date ~10 days from sale date. Brobot will confirm the exact date once the port completes.</div>
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
                      <label className="mb-label">Sales rep full name <span className="req">*</span></label>
                      <input className="mb-input" value={form.rep_name} onChange={e => set("rep_name", e.target.value)} placeholder="First Last" />
                    </div>
                    <div className="mb-field">
                      <label className="mb-label">Sales rep email <span className="req">*</span></label>
                      <input className="mb-input" value={form.rep_email} onChange={e => set("rep_email", e.target.value)} placeholder="you@company.com" />
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
                  {!looksLikeValidEmail(contactEmailTrimmed) ? (
                    <div className="mb-callout mb-callout-o" style={{ marginBottom: 18 }} role="status">
                      <span className="mb-callout-icon">⚠️</span>
                      <div className="mb-callout-text">
                        <strong>No valid email on file.</strong> Go back to step 1 and enter the client&apos;s email so uploads can link to the right contact in CRM. You can still upload, but files may not attach to a contact.
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="mb-ghl-wrap">
                  <iframe
                    key={uploadIframeSrc}
                    src={uploadIframeSrc}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      borderRadius: "3px",
                    }}
                    id="inline-H8C5vTrJlfHah3Evz0cR"
                    data-layout="{'id':'INLINE'}"
                    data-trigger-type="alwaysShow"
                    data-trigger-value=""
                    data-activation-type="alwaysActivated"
                    data-activation-value=""
                    data-deactivation-type="neverDeactivate"
                    data-deactivation-value=""
                    data-form-name={"Porting Form\u00a0"}
                    data-height="640"
                    data-layout-iframe-id="inline-H8C5vTrJlfHah3Evz0cR"
                    data-form-id="H8C5vTrJlfHah3Evz0cR"
                    title={"Porting Form\u00a0"}
                  />
                </div>
                <div className="mb-card-body">
                  <div className="mb-checks" style={{ marginBottom: 16 }}>
                    <label className="mb-check">
                      <input
                        type="checkbox"
                        checked={confirmUploadsDone}
                        onChange={e => setConfirmUploadsDone(e.target.checked)}
                      />
                      <span>I have finished submitting documents in the uploader above and see Upload complete.</span>
                    </label>
                  </div>
                  <div className="mb-callout mb-callout-c" style={{ marginTop: 0 }}>
                    <span className="mb-callout-icon">💡</span>
                    <div className="mb-callout-text">
                      <strong>Submit your uploads in the form above first</strong>—add each file and complete that form (Upload / Submit) <em>before</em> you tap <strong>Submit Deal to Brobot</strong> below. The Brobot button only sends the deal; it does not submit the document uploader.
                    </div>
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
                <button
                  type="button"
                  className="mb-btn-submit"
                  onClick={handleSubmit}
                  disabled={submitLoading || !confirmUploadsDone}
                  title={!confirmUploadsDone ? "Confirm you finished the uploader above" : undefined}
                >
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
