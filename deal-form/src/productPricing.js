/**
 * Deal line-item catalog & pricing rules.
 *
 * **Source of truth for Brobot Basic / Core / AI stacks:** `paymentLinks.js` → `PAYMENT_LINK_CATEGORIES`.
 * `computeCatalogMrc` reads the same `priceUsd` ladder so the deal form always matches the payment picker.
 */

import { PAYMENT_LINK_CATEGORIES } from "./paymentLinks.js";

/** Maps deal form `productId` → payment category `id` in `paymentLinks.js`. */
export const PRODUCT_ID_TO_PAYMENT_CATEGORY = {
  "brobot-one-basic": "one-basic-devices",
  "brobot-one-core": "one-core-devices",
  "ai-receptionist-priority": "one-core-broski-aire",
  "ai-growth-priority": "one-core-broski",
};

function paymentCategoryForProduct(productId) {
  const catId = PRODUCT_ID_TO_PAYMENT_CATEGORY[productId];
  return catId ? PAYMENT_LINK_CATEGORIES.find(c => c.id === catId) : null;
}

/**
 * Monthly total (USD) for a catalog product at a given line/device count — same values as Stripe list in `paymentLinks.js`.
 * Links are ordered 1 device → N devices. Beyond the last Stripe tier, extrapolates using the last step (Δ between final two prices).
 */
export function getStripePriceUsd(productId, lineQtyRaw) {
  const cat = paymentCategoryForProduct(productId);
  if (!cat?.links?.length) return null;

  const lines = Math.max(1, Math.floor(Number(lineQtyRaw)) || 1);
  const L = cat.links;
  const idx = lines - 1;

  if (idx < L.length) {
    return L[idx].priceUsd;
  }

  const last = L[L.length - 1].priceUsd;
  if (L.length < 2) {
    return last;
  }
  const step = L[L.length - 1].priceUsd - L[L.length - 2].priceUsd;
  return last + step * (lines - L.length);
}

/** Brobot One Basic — lines 1–7 totals (from Stripe); useful for CRM hints. */
export const BROBOT_ONE_BASIC_BY_LINES = Object.fromEntries(
  Array.from({ length: 7 }, (_, i) => {
    const n = i + 1;
    return [n, getStripePriceUsd("brobot-one-basic", n)];
  }),
);

/** Shorthand: Core MRR by line count (Stripe ladder). */
export function brobotOneCoreMrcForLines(n) {
  return getStripePriceUsd("brobot-one-core", n) ?? 0;
}

/** Default one-time setup fee (USD, no $) when a rep selects an Agent Broski line — edit here. */
export const DEFAULT_SETUP_FEE_USD_BY_PRODUCT = {
  /** Agent Broski Ai Receptionist */
  "ai-receptionist-priority": "1560",
  /** Agent Broski Ai Receptionist + Conversational AI (SMS) */
  "ai-growth-priority": "2600",
};

export function defaultSetupFeeForProduct(productId) {
  if (!productId) return "";
  return DEFAULT_SETUP_FEE_USD_BY_PRODUCT[productId] ?? "";
}

/** Deal line product selector — only the four Stripe ladders in `paymentLinks.js`. */
export const PRODUCT_OPTIONS = [
  { value: "", label: "Select product…" },
  { value: "brobot-one-basic", label: "Brobot One Basic" },
  { value: "brobot-one-core", label: "Brobot One Core" },
  { value: "ai-receptionist-priority", label: "Agent Broski Ai Receptionist" },
  { value: "ai-growth-priority", label: "Agent Broski Ai Receptionist + Conversational AI (SMS)" },
];

function oneLineDefaultFromStripe(productId) {
  const p = getStripePriceUsd(productId, 1);
  return p != null ? String(p) : undefined;
}

/** Single-line prefills — Stripe 1-device price from `paymentLinks.js`. */
export const PRODUCT_DEFAULT_MRC = {
  "brobot-one-basic": oneLineDefaultFromStripe("brobot-one-basic") ?? "152",
  "brobot-one-core": oneLineDefaultFromStripe("brobot-one-core") ?? "335",
  "ai-receptionist-priority": oneLineDefaultFromStripe("ai-receptionist-priority") ?? "852",
  "ai-growth-priority": oneLineDefaultFromStripe("ai-growth-priority") ?? "1042",
};

function parseUsd(raw) {
  const n = parseFloat(String(raw ?? "").replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

function effectiveLineQty(lineQtyRaw) {
  const q = parseInt(String(lineQtyRaw ?? "").trim(), 10);
  if (Number.isFinite(q) && q >= 1) return q;
  return 1;
}

/** For CRM / webhook — how this line was priced (optional). */
export function getPricingHints(productId) {
  const setupDefault = defaultSetupFeeForProduct(productId);
  const cat = paymentCategoryForProduct(productId);
  if (cat?.links?.length) {
    const L = cat.links;
    const first = L[0].priceUsd;
    const step =
      L.length >= 2 ? L[L.length - 1].priceUsd - L[L.length - 2].priceUsd : null;
    return {
      paymentCategoryId: cat.id,
      stripeFirstTierUsd: first,
      stripeMaxTierDevices: L.length,
      stripeExtrapolationStepUsd: step,
      formula: `Uses Stripe ladder from paymentLinks (“${cat.label}”). Tier ${L.length} = $${L[L.length - 1].priceUsd}; beyond that +$${step}/device (last step).`,
      stripeTieredPricesUsd: L.map(l => l.priceUsd),
      ...(setupDefault ? { defaultSetupFeeUsdSuggested: setupDefault } : {}),
    };
  }
  return null;
}

/**
 * Auto monthly MRC from product + # lines. Stripe-backed products use `getStripePriceUsd`.
 */
export function computeCatalogMrc(productId, lineQtyRaw) {
  if (!productId) return null;

  const n = effectiveLineQty(lineQtyRaw);

  const stripe = getStripePriceUsd(productId, n);
  if (stripe != null) {
    return stripe.toFixed(2);
  }

  const raw = PRODUCT_DEFAULT_MRC[productId];
  if (raw === undefined) return null;
  const perLine = parseUsd(raw);
  if (!Number.isFinite(perLine)) return null;
  return (perLine * n).toFixed(2);
}
