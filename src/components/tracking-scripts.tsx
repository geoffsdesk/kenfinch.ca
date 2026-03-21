'use client';

/**
 * All analytics and tracking pixel scripts.
 *
 * Loads:
 *   - Google Analytics 4 (GA4) + Google Ads via gtag.js
 *   - Meta Pixel (Facebook / Instagram)
 *   - TikTok Pixel
 *
 * Each pixel is conditionally loaded only if its ID env var is set.
 * SPA route changes are tracked automatically via Next.js pathname changes.
 */

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { trackPageView } from '@/lib/analytics';

// ─── Environment variables (injected at build time) ──────────────────────────

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '3459484767600231';
const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

// Build the gtag config IDs — GA4 + optional Google Ads
const gtagIds = [GA_MEASUREMENT_ID, GOOGLE_ADS_ID].filter(Boolean);
const primaryGtagId = gtagIds[0]; // Used for the script src

export function TrackingScripts() {
  const pathname = usePathname();

  // Track SPA route changes
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return (
    <>
      {/* ── Google Analytics 4 + Google Ads (gtag.js) ──────────────── */}
      {primaryGtagId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${primaryGtagId}`}
            strategy="afterInteractive"
          />
          <Script
            id="gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                ${gtagIds.map((id) => `gtag('config', '${id}', { page_path: window.location.pathname });`).join('\n')}
              `,
            }}
          />
        </>
      )}

      {/* ── Meta Pixel (Facebook / Instagram) ──────────────────────── */}
      {META_PIXEL_ID && (
        <>
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* ── TikTok Pixel ───────────────────────────────────────────── */}
      {TIKTOK_PIXEL_ID && (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
              ttq.methods=["page","track","identify","instances","debug","on","off",
              "once","ready","alias","group","enableCookie","disableCookie"],
              ttq.setAndDefer=function(t,e){t[e]=function(){
              t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
              for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
              ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;
              n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
              ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
              ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,
              ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},
              ttq._o[e]=n||{};var o=document.createElement("script");
              o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;
              var a=document.getElementsByTagName("script")[0];
              a.parentNode.insertBefore(o,a)};
              ttq.load('${TIKTOK_PIXEL_ID}');
              ttq.page();
            }(window, document, 'ttq');
            `,
          }}
        />
      )}
    </>
  );
}
