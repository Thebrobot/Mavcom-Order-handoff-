/**
 * BROBOT PARTNER COMMISSION RULES
 *
 * Single source of truth for all commission math.
 * Update values here only — everything else imports from this file.
 */

// ── Flat upfront commission per product (regardless of line count) ────────────
export const PRODUCT_COMMISSION = {
  'brobot-one-basic':            130,
  'brobot-one-core':             297,
  'ai-receptionist-priority':    794,
  'ai-growth-priority':          994,
}

// ── Setup fee commission percentage ──────────────────────────────────────────
// Setup fees stored in the system are grossed up by 4% to cover Stripe processing.
// Commission is on the NET setup fee (before the Stripe markup), not the gross amount.
//   net = gross / 1.04
export const STRIPE_FEE_MULTIPLIER    = 1.04   // gross = net × 1.04
export const SETUP_FEE_COMMISSION_PCT = 0.25   // 25% of NET setup fees

// ── Residual rates ────────────────────────────────────────────────────────────
export const RESIDUAL_BASE_RATE      = 0.25    // 25% until tier threshold
export const RESIDUAL_TIER_THRESHOLD = 30000   // lifetime earned to unlock higher rate
export const RESIDUAL_TIER_RATE      = 0.30    // 30% after threshold

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Sum of flat commission amounts for every product line on a deal.
 * Line count (# devices) does NOT affect the commission — it's always the
 * flat per-product amount regardless of how many lines are on the plan.
 *
 * @param {Array} products  - deal product rows: [{ productId, ... }, ...]
 * @returns {number}
 */
export function calcProductCommissionTotal(products) {
  if (!Array.isArray(products)) return 0
  return products.reduce((sum, p) => {
    return sum + (PRODUCT_COMMISSION[p.productId] ?? 0)
  }, 0)
}

/**
 * Full upfront commission for a deal.
 *   = sum of per-product flat amounts  +  25% of NET setup fees
 *
 * Setup fees in the system are grossed up by 4% (Stripe fee).
 * We strip that out before calculating the commission bonus:
 *   net setup = gross setup / 1.04
 *
 * @param {Array}  products        - deal product rows
 * @param {number} totalSetupGross - gross setup fee as stored (includes 4% Stripe markup)
 * @returns {number}
 */
export function calcUpfront(products, totalSetupGross) {
  const productTotal  = calcProductCommissionTotal(products)
  const netSetup      = (parseFloat(totalSetupGross) || 0) / STRIPE_FEE_MULTIPLIER
  const setupBonus    = netSetup * SETUP_FEE_COMMISSION_PCT
  return productTotal + setupBonus
}

/**
 * Returns the net setup fee (strips 4% Stripe markup).
 * Useful for display in commission breakdowns.
 * @param {number} totalSetupGross
 * @returns {number}
 */
export function netSetupFee(totalSetupGross) {
  return (parseFloat(totalSetupGross) || 0) / STRIPE_FEE_MULTIPLIER
}

/**
 * Monthly residual commission for a deal (paid from month 2 onward).
 *   = product commission total × residual rate
 * Rate is 25% until the partner's lifetime earned crosses $30K, then 30%.
 *
 * @param {number} productCommissionTotal - from calcProductCommissionTotal()
 * @param {number} partnerLifetimeEarned  - cumulative paid commission for this partner
 * @returns {number}
 */
export function calcMonthlyResidual(productCommissionTotal, partnerLifetimeEarned = 0) {
  const rate = partnerLifetimeEarned >= RESIDUAL_TIER_THRESHOLD
    ? RESIDUAL_TIER_RATE
    : RESIDUAL_BASE_RATE
  return productCommissionTotal * rate
}

/**
 * Returns the residual rate a partner is currently on.
 * @param {number} partnerLifetimeEarned
 * @returns {number} 0.25 or 0.30
 */
export function residualRate(partnerLifetimeEarned = 0) {
  return partnerLifetimeEarned >= RESIDUAL_TIER_THRESHOLD
    ? RESIDUAL_TIER_RATE
    : RESIDUAL_BASE_RATE
}

/**
 * Per-product commission breakdown — useful for the deal modal display.
 * Returns an array of { label, commission } objects for every product that
 * has a known flat commission amount.
 *
 * @param {Array} products
 * @returns {Array<{ label: string, commission: number }>}
 */
export function commissionLineItems(products) {
  if (!Array.isArray(products)) return []
  return products
    .filter(p => PRODUCT_COMMISSION[p.productId] != null)
    .map(p => ({
      label:      p.customLabel?.trim() || p.productLabel || p.productId,
      commission: PRODUCT_COMMISSION[p.productId],
    }))
}
