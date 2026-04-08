/**
 * Demo deals — commission figures are computed by the real rules engine,
 * not hardcoded. If commissionRules.js changes, these numbers update too.
 */
import {
  calcUpfront,
  calcProductCommissionTotal,
  calcMonthlyResidual,
} from './commissionRules.js'

function buildDeal(base) {
  const products       = base.products_json
  const setupGross     = base.total_setup ?? 0
  const productCommTotal = calcProductCommissionTotal(products)
  const upfront          = calcUpfront(products, setupGross)
  const residual         = calcMonthlyResidual(productCommTotal, base._partnerLifetime ?? 0)

  return {
    ...base,
    upfront_commission: upfront,
    monthly_residual:   residual,
    commission_amount:  upfront,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Deal 1 — Brobot One Core × 3 lines, no setup
//   Stripe MRC: $387/mo (3-device tier)
//   product commission total: $297
//   upfront: $297 + 25% of $0 = $297
//   residual: $297 × 25% = $74.25
// ─────────────────────────────────────────────────────────────────────────────
const deal1 = buildDeal({
  id: 'demo-1',
  rep_email: 'sarah@example.com',
  rep_name: 'Sarah Mitchell',
  closer_name: 'Alex Torres',
  client_name: 'Marcus Webb',
  business_name: 'Webb Plumbing & HVAC',
  products_json: [
    { productId: 'brobot-one-core', productLabel: 'Brobot One Core', lineQty: '3', mrc: '387', setup: '0', term: '12' },
  ],
  total_mrc: 387,
  plan_mrc: 335,
  total_setup: 0,
  sale_date: '2026-04-02',
  handoff_complete: true,
  handoff_completed_at: '2026-04-04T14:22:00Z',
  handoff_completed_by: 'admin@thebrobot.com',
  first_payment_date: '2026-04-04',
  payout_date: '2026-05-15',
  commission_paid: true,
  commission_paid_at: '2026-05-15T10:00:00Z',
  commission_paid_by: 'admin@thebrobot.com',
  churned: false,
  submitted_at: '2026-04-02T19:45:00Z',
})

// ─────────────────────────────────────────────────────────────────────────────
// Deal 2 — AI Receptionist × 1, setup $1,560 gross ($1,500 net)
//   product commission total: $794
//   upfront: $794 + 25% of ($1560/1.04) = $794 + $375 = $1,169
//   residual: $794 × 25% = $198.50
// ─────────────────────────────────────────────────────────────────────────────
const deal2 = buildDeal({
  id: 'demo-2',
  rep_email: 'sarah@example.com',
  rep_name: 'Sarah Mitchell',
  closer_name: 'Jamie Lee',
  client_name: 'Priya Nair',
  business_name: 'Nair Family Dental',
  products_json: [
    { productId: 'ai-receptionist-priority', productLabel: 'Agent Broski (Ai Receptionist)', lineQty: '1', mrc: '852', setup: '1560', term: '24' },
  ],
  total_mrc: 852,
  plan_mrc: 852,
  total_setup: 1560,
  sale_date: '2026-04-05',
  handoff_complete: false,
  handoff_completed_at: null,
  handoff_completed_by: null,
  first_payment_date: null,
  payout_date: null,
  commission_paid: false,
  commission_paid_at: null,
  commission_paid_by: null,
  churned: false,
  submitted_at: '2026-04-05T16:10:00Z',
})

// ─────────────────────────────────────────────────────────────────────────────
// Deal 3 — Brobot One Basic × 2 lines, no setup
//   Stripe MRC: $168/mo (2-device tier)
//   product commission total: $130
//   upfront: $130 + 25% of $0 = $130
//   residual: $130 × 25% = $32.50
// ─────────────────────────────────────────────────────────────────────────────
const deal3 = buildDeal({
  id: 'demo-3',
  rep_email: 'sarah@example.com',
  rep_name: 'Sarah Mitchell',
  closer_name: 'Alex Torres',
  client_name: 'Derek Fontenot',
  business_name: 'Fontenot Auto Glass',
  products_json: [
    { productId: 'brobot-one-basic', productLabel: 'Brobot One Basic', lineQty: '2', mrc: '168', setup: '0', term: '12' },
  ],
  total_mrc: 168,
  plan_mrc: 152,
  total_setup: 0,
  sale_date: '2026-04-07',
  handoff_complete: false,
  handoff_completed_at: null,
  handoff_completed_by: null,
  first_payment_date: null,
  payout_date: null,
  commission_paid: false,
  commission_paid_at: null,
  commission_paid_by: null,
  churned: false,
  submitted_at: '2026-04-07T11:30:00Z',
})

// ─────────────────────────────────────────────────────────────────────────────
// Deal 4 — Core × 2 + AI Voice × 1, setup $2,600 gross ($2,500 net)
//   Stripe MRC: Core 2-device $361 + AI Voice $1,042 = $1,403/mo
//   product commission total: $297 + $994 = $1,291
//   upfront: $1,291 + 25% of ($2600/1.04) = $1,291 + $625 = $1,916
//   residual: $1,291 × 25% = $322.75
//   This partner has $1,916 paid (deal4 is paid) — still below $30K, so 25%
// ─────────────────────────────────────────────────────────────────────────────
const deal4 = buildDeal({
  id: 'demo-4',
  rep_email: 'james@example.com',
  rep_name: 'James Okafor',
  closer_name: 'Marcus Reid',
  client_name: 'Tanya Reyes',
  business_name: 'Reyes Law Group (2 Locations)',
  multi_location: true,
  products_json: [
    { productId: 'brobot-one-core',    productLabel: 'Brobot One Core',               lineQty: '2', mrc: '361',  setup: '0',    term: '12' },
    { productId: 'ai-growth-priority', productLabel: 'Agent Broski (Ai Voice + SMS)', lineQty: '1', mrc: '1042', setup: '2600', term: '24' },
  ],
  total_mrc: 1403,
  plan_mrc: 1377,
  total_setup: 2600,
  sale_date: '2026-03-09',
  handoff_complete: true,
  handoff_completed_at: '2026-03-11T09:00:00Z',
  handoff_completed_by: 'admin@thebrobot.com',
  first_payment_date: '2026-03-11',
  payout_date: '2026-04-15',
  commission_paid: true,
  commission_paid_at: '2026-04-15T10:00:00Z',
  commission_paid_by: 'admin@thebrobot.com',
  churned: false,
  submitted_at: '2026-03-09T20:55:00Z',
})

// ─────────────────────────────────────────────────────────────────────────────
// Deal 5 — Brobot One Basic × 4 lines, no setup
//   Stripe MRC: $199/mo (4-device tier)
//   product commission total: $130
//   upfront: $130 + 25% of $0 = $130
//   residual: $130 × 25% = $32.50
// ─────────────────────────────────────────────────────────────────────────────
const deal5 = buildDeal({
  id: 'demo-5',
  rep_email: 'james@example.com',
  rep_name: 'James Okafor',
  closer_name: 'Dana Cruz',
  client_name: 'Carlos Mendez',
  business_name: 'Mendez Landscaping Co.',
  products_json: [
    { productId: 'brobot-one-basic', productLabel: 'Brobot One Basic', lineQty: '4', mrc: '199', setup: '0', term: '12' },
  ],
  total_mrc: 199,
  plan_mrc: 152,
  total_setup: 0,
  sale_date: '2026-04-06',
  handoff_complete: false,
  handoff_completed_at: null,
  handoff_completed_by: null,
  first_payment_date: null,
  payout_date: null,
  commission_paid: false,
  commission_paid_at: null,
  commission_paid_by: null,
  churned: false,
  submitted_at: '2026-04-06T14:05:00Z',
})

export const DEMO_DEALS = [deal1, deal2, deal3, deal4, deal5]
