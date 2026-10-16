/**
 * Deal line-item catalog & pricing rules.
 *
 * **Source of truth:** `paymentLinks.js` → `PAYMENT_LINK_CATEGORIES`
 * (Brobot ONE payment-link sheet).
 * `computeCatalogMrc` reads the same `priceUsd` ladder so the deal form always matches the payment picker.
 *
 * Product ids for Voice, Growth, and the two Growth + Agent Broski bundles are unchanged
 * so deals already saved under Basic / Core / AI still resolve.
 */

import { PAYMENT_LINK_CATEGORIES } from "./paymentLinks.js";

/** Maps deal form `productId` → payment category `id` in `paymentLinks.js`. */
export const PRODUCT_ID_TO_PAYMENT_CATEGORY = {
  "brobot-one-basic": "one-voice",
  "brobot-one-connect": "one-connect",
  "brobot-one-core": "one-growth",
  "ai-receptionist-priority": "growth-ai-receptionist",
  "ai-growth-priority": "growth-ai-voice-sms",
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

/** Brobot One Voice — devices 1–10 (from the payment-link sheet). */
export const BROBOT_ONE_BASIC_BY_LINES = Object.fromEntries(
  Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    return [n, getStripePriceUsd("brobot-one-basic", n)];
  }),
);

/** Shorthand: Growth MRR by device count (Stripe ladder). */
export function brobotOneCoreMrcForLines(n) {
  return getStripePriceUsd("brobot-one-core", n) ?? 0;
}

/**
 * Default one-time setup fee (USD, no $) when a rep selects an Agent Broski line.
 * Sheet: AI Receptionist setup $1,560 (price_1THsGyKLhcRydgv7ICx0x6a9),
 * AI Growth setup $2,600 (price_1THsILKLhcRydgv7rutxbqzZ).
 * Those setup prices have no standalone checkout link — they are optional add-ons on the Growth bundle links.
 */
export const DEFAULT_SETUP_FEE_USD_BY_PRODUCT = {
  "ai-receptionist-priority": "1560",
  "ai-growth-priority": "2600",
};

export function defaultSetupFeeForProduct(productId) {
  if (!productId) return "";
  return DEFAULT_SETUP_FEE_USD_BY_PRODUCT[productId] ?? "";
}

/** Deal line product selector — same catalog as the payment-link sheet. */
export const PRODUCT_OPTIONS = [
  { value: "", label: "Select product…" },
  { value: "brobot-one-basic", label: "Brobot One Voice" },
  { value: "brobot-one-connect", label: "Brobot One Connect" },
  { value: "brobot-one-core", label: "Brobot One Growth" },
  { value: "ai-receptionist-priority", label: "Brobot One Growth + AI Receptionist" },
  { value: "ai-growth-priority", label: "Brobot One Growth + AI Growth (Voice + SMS)" },
];

function oneLineDefaultFromStripe(productId) {
  const p = getStripePriceUsd(productId, 1);
  return p != null ? String(p) : undefined;
}

/** Single-line prefills — Stripe 1-device price from `paymentLinks.js`. */
export const PRODUCT_DEFAULT_MRC = {
  "brobot-one-basic": oneLineDefaultFromStripe("brobot-one-basic") ?? "152",
  "brobot-one-connect": oneLineDefaultFromStripe("brobot-one-connect") ?? "172",
  "brobot-one-core": oneLineDefaultFromStripe("brobot-one-core") ?? "345",
  "ai-receptionist-priority": oneLineDefaultFromStripe("ai-receptionist-priority") ?? "862",
  "ai-growth-priority": oneLineDefaultFromStripe("ai-growth-priority") ?? "1070",
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
