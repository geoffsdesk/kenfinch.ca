import { NextResponse } from 'next/server';
import { mailProvider } from '@/lib/mail';
import { TEMPLATE_VERSION } from '@/lib/campaigns/reactivation';

export const dynamic = 'force-dynamic';

/**
 * Public, secret-free health check: which integrations are configured on this
 * build, plus an echo of the caller's own request headers so we can see what
 * survives Google's CDN (User-Agent, forwarded IP). See docs/spam-defense.md.
 */
export async function GET(req: Request) {
  return NextResponse.json({
    ok: true,
    mailProvider: mailProvider(),
    sms: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_FROM),
    cron: !!process.env.CRON_SECRET,
    formTokens: !!(process.env.LEAD_FORM_SECRET || process.env.CRON_SECRET),
    spamEnforced: process.env.SPAM_ENFORCE !== 'false',
    templateVersion: TEMPLATE_VERSION,
    host: req.headers.get('host'),
    forwardedHost: req.headers.get('x-forwarded-host'),
    callerUa: req.headers.get('user-agent'),
    callerXff: req.headers.get('x-forwarded-for'),
    callerFahIp: req.headers.get('x-fah-client-ip'),
    callerLang: req.headers.get('accept-language'),
    callerVia: req.headers.get('via'),
    callerFetchSite: req.headers.get('sec-fetch-site'),
    at: new Date().toISOString(),
  });
}
