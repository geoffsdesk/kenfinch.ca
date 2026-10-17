/**
 * Ken's "Never Lists": the things he would never do in his own transaction,
 * one list per audience. Shared by the landing pages, the lead-magnet capture
 * and the confirmation emails so the copy is identical everywhere.
 *
 * Item 1 of the seller list is the one Ken says on camera in
 * public/ken-intro-720p.mp4; the rest expand on that video.
 */

export const SELLER_NEVER_LIST = [
  'Overprice to test the market. The first week is when you get the most interest, and you do not get it back.',
  'List before the house is ready. Repairs, a deep clean and the photos come first; the listing goes live once.',
  'Pick an agent because they quoted the highest number. Ask how they arrived at it.',
  'Hide a known problem. It surfaces at the inspection with a bigger discount attached.',
  'Skip professional photos and a floor plan. Buyers decide in the first scroll.',
  'Be home for showings. Buyers need to picture themselves in the house, not meet you in the kitchen.',
  'Take the first offer out of relief or refuse it on principle. Every offer is information; use it.',
] as const;

export const RENEWAL_NEVER_LIST = [
  "Sign the bank's renewal letter the week it arrives.",
  'Assume switching lenders costs money. On a standard renewal it usually costs nothing.',
  'Let one lender quote one term and call it a comparison.',
  'Renew into a longer amortization without asking what it costs over the life of the loan.',
  'Wait until the last 30 days. Rate holds run up to 120 days; that is the window.',
] as const;

export const BUYER_NEVER_LIST = [
  'Start touring before a real pre-approval. A bank pre-qualification is a guess.',
  'Spend the full maximum a lender will give you. Qualifying for it and living with it are different things.',
  'Forget closing costs. Land transfer tax, legal fees and the inspection add roughly 2 to 4 percent on top of the price.',
  'Waive the inspection to win a bidding war on a house you know nothing about.',
  'Change jobs or finance a car between pre-approval and closing.',
  "Shop with a budget set at today's rate instead of the stress-test rate you have to qualify at.",
] as const;

export const NEWCOMER_NEVER_LIST = [
  'Assume no Canadian credit history means no mortgage. Several lenders have newcomer programs.',
  'Open five credit cards at once to build credit fast. One or two, paid in full, does the job.',
  'Carry a balance because someone said it builds credit. Paying in full every month works.',
  'Send a deposit before your lawyer has confirmed the offer is accepted and the payee is right.',
  "Take one bank's answer as the market's answer.",
  'Forget the paper trail. Savings held outside Canada need 90 days of statements before a lender counts them.',
] as const;

/**
 * Why the valuation tool asks for contact details before the exact figure.
 * Default assumes Ken sends three recent comparable sales (KEN-PLAYBOOK.md,
 * "Gate lead comps template"). Swap to GATE_REASON_ALT if Ken declines the
 * comps work.
 */
export const GATE_REASON = 'Ken will send the three most recent sales near you and tell you if the AI is high or low.';
export const GATE_REASON_ALT = 'Ken will tell you if the AI estimate looks high or low for your street.';
