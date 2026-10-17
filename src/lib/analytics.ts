/**
 * Centralized analytics & conversion tracking.
 *
 * Fires events to all configured platforms:
 *   - Google Analytics 4 (GA4) via gtag.js
 *   - Google Ads conversion tracking
 *   - Meta Pixel (Facebook / Instagram)
 *   - TikTok Pixel
 *
 * Each platform gracefully no-ops if its pixel isn't loaded.
 *
 * Conversion model (docs: kenfinch-marketing/CLAUDE.md "Conversion labels"):
 *   - Every real lead (contact, expert opinion, gated valuation reveal, mortgage,
 *     renewal, affordability report, lead magnet) fires ONE Google Ads conversion
 *     to the "Lead form submitted" action (NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL) with
 *     a per-type value and `transaction_id` = the Firestore lead id, so Ads
 *     de-duplicates on its side and /ken can be reconciled against it.
 *   - Using the valuation tool is NOT a lead. It fires GA4 `valuation_tool_used`
 *     and the Secondary "Valuation tool used" Ads action.
 *   - The Finmo hand-off click fires the Secondary "Finmo application click"
 *     action when NEXT_PUBLIC_GOOGLE_ADS_FINMO_LABEL is set.
 *   - Callers only fire these when createLead returned `track: true` (held and
 *     test submissions never count as conversions).
 */

// ─── Type declarations for global pixel functions ────────────────────────────

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track: (...args: unknown[]) => void;
      page: () => void;
      identify: (data: Record<string, string>) => void;
    };
    dataLayer?: Record<string, unknown>[];
  }
}

// ─── Environment (inlined at build time by Next) ─────────────────────────────

const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
/** Primary "Lead form submitted" action. Every lead type sends here once it is set. */
const LEAD_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL;
/** Legacy per-form labels, used only until LEAD_LABEL exists. */
const CONTACT_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONTACT_LABEL;
const EXPERT_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_EXPERT_LABEL;
const MORTGAGE_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_MORTGAGE_LABEL;
/** Secondary "Valuation tool used" action (repointed from the old shared label). */
const VALUATION_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_VALUATION_LABEL;
/** Optional dedicated label for the tool; when present it wins over VALUATION_LABEL. */
const VALUATION_TOOL_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_VALUATION_TOOL_LABEL;
/** Secondary "Finmo application click" action. */
const FINMO_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_FINMO_LABEL;

/** Conversion values (CAD) per lead type. The Ads action must use "different values for each conversion". */
export const CONVERSION_VALUES = {
  contact: 1,
  leadMagnet: 1,
  valuationGated: 5,
  valuationTool: 5,
  expert: 10,
  affordability: 10,
  mortgage: 15,
  renewal: 15,
} as const;

// ─── Helper: safe pixel calls ────────────────────────────────────────────────

function gtag(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
}

function fbq(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.fbq) {
    (window.fbq as (...a: unknown[]) => void)(...args);
  }
}

function ttq(event: string, data?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.ttq) {
    if (data) {
      window.ttq.track(event, data);
    } else {
      window.ttq.track(event);
    }
  }
}

function currentPage(): string {
  return typeof window !== 'undefined' ? window.location.pathname : '';
}

/** Google Ads conversion. `transactionId` lets Ads de-duplicate repeat fires for one lead. */
function adsConversion(label: string | undefined, value: number, transactionId?: string) {
  if (!ADS_ID || !label) return;
  gtag('event', 'conversion', {
    send_to: `${ADS_ID}/${label}`,
    value,
    currency: 'CAD',
    ...(transactionId ? { transaction_id: transactionId } : {}),
  });
}

/** GA4 generate_lead with the parameters every lead carries. */
function generateLead(params: { category: string; label: string; value: number; leadId: string; source: string } & Record<string, unknown>) {
  const { category, label, value, leadId, source, ...rest } = params;
  gtag('event', 'generate_lead', {
    event_category: category,
    event_label: label,
    value,
    currency: 'CAD',
    lead_id: leadId,
    lead_source: source,
    page: currentPage(),
    ...rest,
  });
}

// ─── Public tracking functions ───────────────────────────────────────────────

/**
 * Track a contact form submission (lead).
 */
export function trackContactFormSubmission(data: { name: string; email: string; phone?: string; leadId: string }) {
  const value = CONVERSION_VALUES.contact;
  generateLead({ category: 'Contact', label: 'Contact Form', value, leadId: data.leadId, source: 'contact-form' });
  adsConversion(LEAD_LABEL ?? CONTACT_LABEL, value, data.leadId);
  fbq('track', 'Lead', { content_name: 'Contact Form', content_category: 'Contact' });
  ttq('SubmitForm', { content_name: 'Contact Form' });
}

/**
 * Track a run of the AI valuation tool. Not a lead: GA4 `valuation_tool_used`
 * and the Secondary Ads action only, so Search campaigns stop optimising
 * toward tool runs.
 */
export function trackValuationSubmission(data: { address: string; homeType: string }) {
  const value = CONVERSION_VALUES.valuationTool;
  gtag('event', 'valuation_tool_used', {
    event_category: 'Valuation',
    event_label: 'AI Home Valuation',
    value,
    currency: 'CAD',
    home_type: data.homeType,
    page: currentPage(),
  });
  adsConversion(VALUATION_TOOL_LABEL ?? VALUATION_LABEL, value);
  fbq('track', 'ViewContent', { content_name: 'AI Home Valuation', content_category: 'Valuation' });
  ttq('ViewContent', { content_name: 'Home Valuation' });
}

export type ExpertOpinionSource = 'valuation-gated' | 'valuation-expert-opinion';

/**
 * Track a valuation lead: the contact gate before the exact figure
 * (`valuation-gated`, value 5) or the full expert-opinion request
 * (`valuation-expert-opinion`, value 10).
 */
export function trackExpertOpinionRequest(data: { name: string; email: string; source: ExpertOpinionSource; leadId: string }) {
  const gated = data.source === 'valuation-gated';
  const value = gated ? CONVERSION_VALUES.valuationGated : CONVERSION_VALUES.expert;
  const label = gated ? 'Valuation Gate' : 'Expert Opinion Request';
  generateLead({ category: gated ? 'Valuation' : 'Expert Opinion', label, value, leadId: data.leadId, source: data.source });
  adsConversion(LEAD_LABEL ?? EXPERT_LABEL, value, data.leadId);
  fbq('track', 'Lead', { content_name: label, content_category: gated ? 'Valuation' : 'Expert Opinion', value, currency: 'CAD' });
  ttq('SubmitForm', { content_name: label, value, currency: 'CAD' });
}

/**
 * Track a page view across all platforms.
 * Called automatically by the TrackingScripts component,
 * but can also be called manually for SPA route changes.
 */
export function trackPageView(url?: string) {
  const path = url || (typeof window !== 'undefined' ? window.location.pathname : '/');

  // GA4 handles page views automatically via gtag config
  // but we send an explicit one for SPA navigation
  gtag('event', 'page_view', {
    page_path: path,
  });

  // Meta Pixel
  fbq('track', 'PageView');

  // TikTok
  if (typeof window !== 'undefined' && window.ttq) {
    window.ttq.page();
  }
}

/**
 * Track a buyer / mortgage pre-approval lead (highest-intent buyer event).
 */
export function trackMortgageLead(data: { leadId: string; goal: string; timeline: string; source?: string }) {
  const value = CONVERSION_VALUES.mortgage;
  generateLead({
    category: 'Mortgage',
    label: 'Buyer Pre-Approval Form',
    value,
    leadId: data.leadId,
    source: data.source ?? 'site',
    lead_goal: data.goal,
    lead_timeline: data.timeline,
  });
  adsConversion(LEAD_LABEL ?? MORTGAGE_LABEL ?? CONTACT_LABEL, value, data.leadId);
  fbq('track', 'Lead', { content_name: 'Buyer Pre-Approval Form', content_category: 'Mortgage', value, currency: 'CAD' });
  ttq('SubmitForm', { content_name: 'Buyer Pre-Approval Form', value, currency: 'CAD' });
}

/**
 * Track the hand-off click to the Express Mortgage (Finmo) application.
 */
export function trackFinmoHandoff(leadId?: string) {
  gtag('event', 'mortgage_application_click', {
    event_category: 'Mortgage',
    event_label: 'Express Mortgage Application',
    lead_id: leadId ?? '',
    page: currentPage(),
  });
  adsConversion(FINMO_LABEL, 0, leadId || undefined);
  fbq('trackCustom', 'MortgageApplicationClick', { lead_id: leadId ?? '' });
  ttq('ClickButton', { content_name: 'Express Mortgage Application' });
}

/**
 * Track a mortgage renewal lead (/renewal).
 */
export function trackRenewalLead(data: { name: string; email: string; phone?: string; leadId: string }) {
  const value = CONVERSION_VALUES.renewal;
  generateLead({ category: 'Renewal', label: 'Renewal Form', value, leadId: data.leadId, source: 'renewal-form' });
  adsConversion(LEAD_LABEL ?? CONTACT_LABEL, value, data.leadId);
  fbq('track', 'Lead', { content_name: 'Renewal Form', content_category: 'Renewal', value, currency: 'CAD' });
  ttq('SubmitForm', { content_name: 'Renewal Form', value, currency: 'CAD' });
}

/**
 * Track a result on the affordability calculator (/afford). Not a lead and not
 * an Ads conversion; GA4 + Meta ViewContent only.
 */
export function trackAffordabilityResult(data: { maxPrice: number; monthlyPayment: number; bucket: string }) {
  gtag('event', 'calculator_result', {
    event_category: 'Affordability',
    event_label: 'Affordability Calculator',
    max_price: data.maxPrice,
    monthly_payment: data.monthlyPayment,
    price_bucket: data.bucket,
    page: currentPage(),
  });
  fbq('track', 'ViewContent', { content_name: 'Affordability Calculator', content_category: 'Affordability' });
}

/**
 * Track an affordability report request (/afford lead form).
 */
export function trackAffordabilityLead(data: { name: string; email: string; leadId: string }) {
  const value = CONVERSION_VALUES.affordability;
  generateLead({ category: 'Affordability', label: 'Affordability Report', value, leadId: data.leadId, source: 'affordability-form' });
  adsConversion(LEAD_LABEL ?? CONTACT_LABEL, value, data.leadId);
  fbq('track', 'Lead', { content_name: 'Affordability Report', content_category: 'Affordability', value, currency: 'CAD' });
  ttq('SubmitForm', { content_name: 'Affordability Report', value, currency: 'CAD' });
}

/**
 * Track a lead-magnet request (Ken's Never Lists and similar email captures).
 */
export function trackNeverListRequest(asset: string, leadId: string) {
  const value = CONVERSION_VALUES.leadMagnet;
  generateLead({ category: 'Lead magnet', label: asset, value, leadId, source: 'never-list', asset });
  adsConversion(LEAD_LABEL ?? CONTACT_LABEL, value, leadId);
  fbq('track', 'Lead', { content_name: asset, content_category: 'Lead magnet', value, currency: 'CAD' });
}

/**
 * Track a click on the floating WhatsApp button.
 */
export function trackWhatsAppClick(page: string) {
  gtag('event', 'whatsapp_click', {
    event_category: 'Contact',
    event_label: 'WhatsApp Button',
    page_path: page,
  });
  fbq('track', 'Contact', { content_name: 'WhatsApp Button' });
  ttq('Contact', { content_name: 'WhatsApp Button' });
}
