/**
 * Pure math tests for /afford. Run with `npm run test:unit`
 * (node --import tsx --test).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  monthlyPayment,
  principalForPayment,
  minDownPayment,
  cmhcPremium,
  maxPurchasePrice,
  roundTo,
  priceBucket,
  downPaymentBucket,
  incomeBucket,
  QUALIFYING_RATE_ASSUMPTION,
  type AffordabilityInputs,
} from './affordability';

const base: AffordabilityInputs = {
  annualIncome: 150_000,
  monthlyDebts: 0,
  downPayment: 200_000,
  qualifyingRate: QUALIFYING_RATE_ASSUMPTION,
  amortizationYears: 25,
  monthlyPropertyTax: 450,
  monthlyHeat: 150,
  monthlyCondoFees: 0,
};

test('monthlyPayment uses Canadian semi-annual compounding', () => {
  // $500,000 at 5% over 25 years is $2,908.02/month (any Canadian mortgage calculator).
  assert.equal(monthlyPayment(500_000, 5, 25), 2908.02);
  assert.equal(monthlyPayment(0, 5, 25), 0);
  assert.equal(monthlyPayment(120_000, 0, 10), 1000);
});

test('principalForPayment inverts monthlyPayment', () => {
  const p = principalForPayment(2908.02, 5, 25);
  assert.ok(Math.abs(p - 500_000) < 5, `got ${p}`);
  assert.equal(principalForPayment(0, 5, 25), 0);
});

test('minimum down payment tiers', () => {
  assert.equal(minDownPayment(400_000), 20_000);
  assert.equal(minDownPayment(500_000), 25_000);
  assert.equal(minDownPayment(800_000), 55_000); // 25,000 + 10% of 300,000
  assert.equal(minDownPayment(1_500_000), 125_000);
  assert.equal(minDownPayment(1_500_001), 300_000.2);
  assert.equal(minDownPayment(2_000_000), 400_000);
  assert.equal(minDownPayment(0), 0);
});

test('insurance premium by loan-to-value, none at 20% down or over the cap', () => {
  assert.equal(cmhcPremium(800_000, 160_000), 0); // exactly 20%
  assert.equal(cmhcPremium(800_000, 200_000), 0);
  assert.equal(cmhcPremium(800_000, 120_000), 19_040); // 85% LTV -> 2.80% of 680,000
  assert.equal(cmhcPremium(800_000, 100_000), 21_700); // 87.5% LTV -> 3.10% of 700,000
  assert.equal(cmhcPremium(800_000, 55_000), 29_800); // 93.1% LTV -> 4.00% of 745,000
  assert.equal(cmhcPremium(1_600_000, 200_000), 0); // above the insured cap
});

test('maxPurchasePrice: 20%+ down, TDS binds with debts, GDS binds without', () => {
  const noDebts = maxPurchasePrice(base);
  assert.equal(noDebts.bindingRatio, 'GDS');
  // 150,000/12 * 0.39 = 4,875 - 600 carrying = 4,275 P+I room.
  assert.equal(noDebts.maxMonthlyPayment, 4275);
  assert.ok(noDebts.maxPrice > 800_000 && noDebts.maxPrice < 900_000, `maxPrice ${noDebts.maxPrice}`);
  assert.equal(noDebts.insurancePremium, 0);
  assert.ok(Math.abs(noDebts.monthlyPayment - 4275) < 15, `payment ${noDebts.monthlyPayment}`);
  assert.equal(noDebts.mortgageAmount, noDebts.maxPrice - 200_000);

  const withDebts = maxPurchasePrice({ ...base, monthlyDebts: 1_200 });
  assert.equal(withDebts.bindingRatio, 'TDS');
  // 150,000/12 * 0.44 = 5,500 - 600 - 1,200 = 3,700.
  assert.equal(withDebts.maxMonthlyPayment, 3700);
  assert.ok(withDebts.maxPrice < noDebts.maxPrice);
});

test('maxPurchasePrice rises with income and with a 30-year amortization', () => {
  const a = maxPurchasePrice(base);
  const b = maxPurchasePrice({ ...base, annualIncome: 200_000 });
  const c = maxPurchasePrice({ ...base, amortizationYears: 30 });
  assert.ok(b.maxPrice > a.maxPrice);
  assert.ok(c.maxPrice > a.maxPrice);
});

test('maxPurchasePrice with a small down payment rolls the premium in and respects the minimum down', () => {
  const r = maxPurchasePrice({ ...base, downPayment: 40_000 });
  assert.ok(r.maxPrice > 0);
  assert.ok(r.insurancePremium > 0, 'premium applies under 20% down');
  assert.ok(40_000 >= r.minDownPayment, `down 40,000 must cover the minimum ${r.minDownPayment}`);
  assert.ok(r.mortgageAmount > r.maxPrice - 40_000, 'premium is part of the mortgage');
  // A down payment too small for any price above the tier floor is the binding constraint.
  const tiny = maxPurchasePrice({ ...base, annualIncome: 400_000, downPayment: 30_000 });
  assert.equal(tiny.bindingRatio, 'down-payment');
  assert.ok(tiny.maxPrice <= 600_000, `maxPrice ${tiny.maxPrice}`);
});

test('zero income means a cash purchase at most; zero down payment affords nothing', () => {
  const cash = maxPurchasePrice({ ...base, annualIncome: 0 });
  assert.ok(cash.maxPrice <= 200_000 && cash.maxPrice >= 199_000, `maxPrice ${cash.maxPrice}`);
  assert.equal(cash.mortgageAmount, 0);
  assert.equal(cash.monthlyPayment, 0);
  assert.equal(maxPurchasePrice({ ...base, downPayment: 0 }).maxPrice, 0);
});

test('helpers: rounding and buckets', () => {
  assert.equal(roundTo(812_345), 810_000);
  assert.equal(roundTo(812_345, 10_000), 810_000);
  assert.equal(priceBucket(600_000), 'under-750k');
  assert.equal(priceBucket(900_000), '750k-1m');
  assert.equal(priceBucket(1_200_000), '1m-1.5m');
  assert.equal(priceBucket(2_000_000), '1.5m-2.5m');
  assert.equal(priceBucket(3_000_000), 'over-2.5m');
  assert.equal(downPaymentBucket(0, 800_000), 'not-sure');
  assert.equal(downPaymentBucket(30_000, 800_000), 'under-5');
  assert.equal(downPaymentBucket(60_000, 800_000), '5-10');
  assert.equal(downPaymentBucket(120_000, 800_000), '10-20');
  assert.equal(downPaymentBucket(200_000, 800_000), '20-plus');
  assert.equal(incomeBucket(90_000), 'under-100k');
  assert.equal(incomeBucket(120_000), '100k-150k');
  assert.equal(incomeBucket(200_000), '150k-250k');
  assert.equal(incomeBucket(300_000), 'over-250k');
});
