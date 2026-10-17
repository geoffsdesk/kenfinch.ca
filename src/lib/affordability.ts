/**
 * Mortgage affordability math for /afford. Pure functions, no I/O, no
 * environment, so `node --import tsx --test` can run affordability.test.ts.
 *
 * Rules modelled (Canada, 2026):
 *  - GDS (housing costs / gross income) capped at 39%, TDS (housing + other
 *    debts) at 44%: the insured-mortgage limits most lenders apply.
 *  - Qualifying ("stress test") rate: the greater of contract + 2% and 5.25%.
 *    The calculator takes it as an editable assumption; nothing here is a rate
 *    quote.
 *  - Canadian mortgage interest compounds semi-annually, so the monthly rate is
 *    derived from the semi-annual effective rate.
 *  - Minimum down payment: 5% of the first $500,000, 10% of the portion from
 *    $500,000 to $1,500,000, 20% of the whole price above $1,500,000.
 *  - Default insurance premium (under 20% down) is added to the mortgage.
 */

/** Editable default for the stress-test rate on /afford. An assumption, not a quote. */
export const QUALIFYING_RATE_ASSUMPTION = 6.25;
export const GDS_LIMIT = 0.39;
export const TDS_LIMIT = 0.44;
export const INSURED_PRICE_CAP = 1_500_000;

export interface AffordabilityInputs {
  /** Gross annual household income, CAD. */
  annualIncome: number;
  /** Other monthly debt payments (car, loans, 3% of card balances), CAD. */
  monthlyDebts: number;
  /** Cash down payment, CAD. */
  downPayment: number;
  /** Annual qualifying rate in percent, e.g. 6.25. */
  qualifyingRate: number;
  /** 25 or 30 years. */
  amortizationYears: number;
  /** Monthly property tax, CAD. */
  monthlyPropertyTax: number;
  /** Monthly heating, CAD. */
  monthlyHeat: number;
  /** Monthly condo fees, CAD (lenders count 50%). */
  monthlyCondoFees: number;
}

export interface AffordabilityResult {
  maxPrice: number;
  mortgageAmount: number;
  insurancePremium: number;
  minDownPayment: number;
  /** Principal + interest at the qualifying rate. */
  monthlyPayment: number;
  /** Which ratio set the ceiling. */
  bindingRatio: 'GDS' | 'TDS' | 'down-payment';
  /** Monthly P+I the ratios allow (before the down-payment constraint). */
  maxMonthlyPayment: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

/** Monthly principal + interest, Canadian semi-annual compounding. */
export function monthlyPayment(principal: number, annualRatePct: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  const n = Math.round(years * 12);
  if (annualRatePct <= 0) return round(principal / n);
  const semi = annualRatePct / 100 / 2;
  const r = Math.pow(1 + semi, 1 / 6) - 1;
  return round((principal * r) / (1 - Math.pow(1 + r, -n)));
}

/** Largest principal whose payment at the given rate and term is `payment`. */
export function principalForPayment(payment: number, annualRatePct: number, years: number): number {
  if (payment <= 0 || years <= 0) return 0;
  const n = Math.round(years * 12);
  if (annualRatePct <= 0) return payment * n;
  const semi = annualRatePct / 100 / 2;
  const r = Math.pow(1 + semi, 1 / 6) - 1;
  return (payment * (1 - Math.pow(1 + r, -n))) / r;
}

/** Minimum down payment for a price (Ontario, 2026 tiers). */
export function minDownPayment(price: number): number {
  if (price <= 0) return 0;
  if (price > INSURED_PRICE_CAP) return round(price * 0.2);
  const firstTier = Math.min(price, 500_000) * 0.05;
  const secondTier = Math.max(0, price - 500_000) * 0.1;
  return round(firstTier + secondTier);
}

/**
 * Default insurance premium (CMHC / Sagen / Canada Guaranty) on the mortgage
 * amount. Zero at 20% down or more, or above the insured price cap.
 */
export function cmhcPremium(price: number, down: number): number {
  if (price <= 0 || down >= price * 0.2 || price > INSURED_PRICE_CAP) return 0;
  const loan = price - down;
  const ltv = loan / price;
  let rate = 0;
  if (ltv > 0.9) rate = 0.04;
  else if (ltv > 0.85) rate = 0.031;
  else if (ltv > 0.8) rate = 0.028;
  return round(loan * rate);
}

/** Housing costs lenders count toward GDS, excluding P+I. */
export function carryingCosts(i: Pick<AffordabilityInputs, 'monthlyPropertyTax' | 'monthlyHeat' | 'monthlyCondoFees'>): number {
  return (i.monthlyPropertyTax || 0) + (i.monthlyHeat || 0) + 0.5 * (i.monthlyCondoFees || 0);
}

/** Total mortgage needed to buy at `price` with `down` (premium rolled in). */
export function mortgageFor(price: number, down: number): number {
  return Math.max(0, price - down) + cmhcPremium(price, down);
}

/**
 * Maximum purchase price under GDS/TDS at the qualifying rate, the minimum
 * down payment tiers and the insurance premium. Solved by bisection because
 * the premium tier depends on the price.
 */
export function maxPurchasePrice(inputs: AffordabilityInputs): AffordabilityResult {
  const income = Math.max(0, inputs.annualIncome) / 12;
  const carry = carryingCosts(inputs);
  const gdsRoom = income * GDS_LIMIT - carry;
  const tdsRoom = income * TDS_LIMIT - carry - Math.max(0, inputs.monthlyDebts);
  const maxMonthly = Math.max(0, Math.min(gdsRoom, tdsRoom));
  const ratio: AffordabilityResult['bindingRatio'] = gdsRoom <= tdsRoom ? 'GDS' : 'TDS';
  const down = Math.max(0, inputs.downPayment);
  const years = inputs.amortizationYears >= 30 ? 30 : 25;
  const maxPrincipal = principalForPayment(maxMonthly, inputs.qualifyingRate, years);

  const affordable = (price: number) => mortgageFor(price, down) <= maxPrincipal && down >= minDownPayment(price);

  let lo = 0;
  let hi = down + maxPrincipal + 1;
  // hi is not affordable (mortgage would exceed maxPrincipal by at least $1); lo is.
  for (let i = 0; i < 60 && hi - lo > 1; i += 1) {
    const mid = (lo + hi) / 2;
    if (affordable(mid)) lo = mid;
    else hi = mid;
  }
  const maxPrice = Math.floor(lo);
  const mortgageAmount = round(mortgageFor(maxPrice, down));
  const bindingRatio: AffordabilityResult['bindingRatio'] =
    maxPrice > 0 && mortgageAmount < maxPrincipal - 1 && down < minDownPayment(maxPrice + 2) ? 'down-payment' : ratio;
  return {
    maxPrice,
    mortgageAmount,
    insurancePremium: cmhcPremium(maxPrice, down),
    minDownPayment: minDownPayment(maxPrice),
    monthlyPayment: monthlyPayment(mortgageAmount, inputs.qualifyingRate, years),
    bindingRatio,
    maxMonthlyPayment: round(maxMonthly),
  };
}

/** Round to the nearest `step` (default $5,000) for display. */
export function roundTo(n: number, step = 5_000): number {
  return Math.round(n / step) * step;
}

/** Buyer-form price bucket for the GA4 `calculator_result` event. */
export function priceBucket(price: number): 'under-750k' | '750k-1m' | '1m-1.5m' | '1.5m-2.5m' | 'over-2.5m' {
  if (price < 750_000) return 'under-750k';
  if (price < 1_000_000) return '750k-1m';
  if (price < 1_500_000) return '1m-1.5m';
  if (price < 2_500_000) return '1.5m-2.5m';
  return 'over-2.5m';
}

/** Buyer-form down-payment bucket from cash down and price. */
export function downPaymentBucket(down: number, price: number): 'under-5' | '5-10' | '10-20' | '20-plus' | 'not-sure' {
  if (price <= 0 || down <= 0) return 'not-sure';
  const pct = down / price;
  if (pct < 0.05) return 'under-5';
  if (pct < 0.1) return '5-10';
  if (pct < 0.2) return '10-20';
  return '20-plus';
}

/** Buyer-form income bucket. */
export function incomeBucket(annual: number): 'under-100k' | '100k-150k' | '150k-250k' | 'over-250k' {
  if (annual < 100_000) return 'under-100k';
  if (annual < 150_000) return '100k-150k';
  if (annual < 250_000) return '150k-250k';
  return 'over-250k';
}
