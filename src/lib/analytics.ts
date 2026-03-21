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

// ─── Public tracking functions ───────────────────────────────────────────────

/**
 * Track a contact form submission (lead).
 */
export function trackContactFormSubmission(data: {
  name: string;
  email: string;
  phone?: string;
}) {
  // GA4 — generate_lead event
  gtag('event', 'generate_lead', {
    event_category: 'Contact',
    event_label: 'Contact Form',
    value: 1,
    currency: 'CAD',
    contact_name: data.name,
  });

  // Google Ads conversion (if configured)
  const adsConversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
  const adsConversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONTACT_LABEL;
  if (adsConversionId && adsConversionLabel) {
    gtag('event', 'conversion', {
      send_to: `${adsConversionId}/${adsConversionLabel}`,
      value: 1.0,
      currency: 'CAD',
    });
  }

  // Meta Pixel — Lead event
  fbq('track', 'Lead', {
    content_name: 'Contact Form',
    content_category: 'Contact',
  });

  // TikTok Pixel — SubmitForm event
  ttq('SubmitForm', {
    content_name: 'Contact Form',
  });
}

/**
 * Track a home valuation request (high-intent lead).
 */
export function trackValuationSubmission(data: {
  address: string;
  homeType: string;
}) {
  // GA4
  gtag('event', 'generate_lead', {
    event_category: 'Valuation',
    event_label: 'AI Home Valuation',
    value: 5,
    currency: 'CAD',
    property_address: data.address,
    home_type: data.homeType,
  });

  // Google Ads conversion
  const adsConversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
  const adsValuationLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_VALUATION_LABEL;
  if (adsConversionId && adsValuationLabel) {
    gtag('event', 'conversion', {
      send_to: `${adsConversionId}/${adsValuationLabel}`,
      value: 5.0,
      currency: 'CAD',
    });
  }

  // Meta Pixel — ViewContent + Lead
  fbq('track', 'ViewContent', {
    content_name: 'AI Home Valuation',
    content_category: 'Valuation',
  });

  // TikTok
  ttq('SubmitForm', {
    content_name: 'Home Valuation',
  });
}

/**
 * Track an expert opinion request (highest-intent lead).
 */
export function trackExpertOpinionRequest(data: {
  name: string;
  email: string;
  address: string;
}) {
  // GA4
  gtag('event', 'generate_lead', {
    event_category: 'Expert Opinion',
    event_label: 'Expert Opinion Request',
    value: 10,
    currency: 'CAD',
    contact_name: data.name,
    property_address: data.address,
  });

  // Google Ads conversion
  const adsConversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
  const adsExpertLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_EXPERT_LABEL;
  if (adsConversionId && adsExpertLabel) {
    gtag('event', 'conversion', {
      send_to: `${adsConversionId}/${adsExpertLabel}`,
      value: 10.0,
      currency: 'CAD',
    });
  }

  // Meta Pixel — Lead (high value)
  fbq('track', 'Lead', {
    content_name: 'Expert Opinion Request',
    content_category: 'Expert Opinion',
    value: 10.0,
    currency: 'CAD',
  });

  // TikTok
  ttq('SubmitForm', {
    content_name: 'Expert Opinion Request',
    value: 10,
    currency: 'CAD',
  });
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
