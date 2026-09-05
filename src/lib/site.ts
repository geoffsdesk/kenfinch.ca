/**
 * Central site configuration — contact details, licensing, and the
 * Express Mortgage (Finmo) hand-off URL.
 *
 * Everything that appears in compliance text or CTAs should come from here so
 * a change (new phone number, new licence title) is a one-line edit.
 */

export const SITE_URL = 'https://www.kenfinch.ca';

export const CONTACT = {
  name: 'Ken Finch',
  phoneDisplay: '(416) 520-5544',
  phoneHref: 'tel:+14165205544',
  /** E.164 digits only, for wa.me deep links. */
  whatsappNumber: '14165205544',
  email: 'ken@kenfinch.ca',
  leadInbox: 'realtor@kenfinch.ca',
  city: 'Oakville, Ontario',
} as const;

/** Real estate licensing (RECO). */
export const REAL_ESTATE = {
  title: 'Broker',
  brokerage: 'Royal LePage Signature Realty, Brokerage',
  brokerageShort: 'Royal LePage Signature Realty',
  disclaimer: 'Independently owned and operated.',
} as const;

/**
 * Mortgage licensing (FSRA / MBLAA). Ontario advertising rules require the
 * brokerage's authorized name and licence number on every mortgage-related
 * page. The individual's licence number is optional; the approved title is
 * required when the individual is named.
 *
 * TODO(Ken): confirm the approved title in the FSRA public registry
 * ("Mortgage Broker" vs "Mortgage Agent Level 1/2") before launch.
 */
export const MORTGAGE = {
  title: 'Mortgage Broker',
  brokerage: 'Canadian Express-Mortgage Inc.',
  brokerageShort: 'Express Mortgage',
  brokerageLicence: '13241',
  brokeragePhone: '(905) 785-9926',
} as const;

/** Finmo borrower-portal hand-off. */
const FINMO_BASE = 'https://cemi.mtg-app.com/signup';
const FINMO_BROKER_NAME = 'ken.finch';
const FINMO_BROKER_ID = '05293159-120d-4019-aa51-5ca60e1acc65';

/**
 * Build the Express Mortgage application URL. Finmo reads `brokerId` /
 * `brokerName` so the application lands on Ken, and stores `externalId` on
 * the borrower record — we pass our Firestore lead ID so Ken can match the
 * application to the kenfinch.ca lead.
 */
export function finmoApplicationUrl(externalId?: string): string {
  const params = new URLSearchParams({
    brokerName: FINMO_BROKER_NAME,
    brokerId: FINMO_BROKER_ID,
  });
  if (externalId) params.set('externalId', externalId);
  return `${FINMO_BASE}?${params.toString()}`;
}

/** Areas Ken actively serves for buyers. */
export const SERVICE_AREAS = [
  'Oakville',
  'Burlington',
  'Mississauga',
  'Milton',
  'Toronto',
  'Other GTA',
] as const;
