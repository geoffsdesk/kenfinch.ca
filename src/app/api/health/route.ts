import { NextResponse } from 'next/server';
import { mailProvider } from '@/lib/mail';
import { TEMPLATE_VERSION } from '@/lib/campaigns/reactivation';

export const dynamic = 'force-dynamic';

/** Public, secret-free health check: which integrations are configured on this build. */
export async function GET(req: Request) {
  return NextResponse.json({
    ok: true,
    mailProvider: mailProvider(),
    sms: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_FROM),
    cron: !!process.env.CRON_SECRET,
    templateVersion: TEMPLATE_VERSION,
    host: req.headers.get('host'),
    forwardedHost: req.headers.get('x-forwarded-host'),
    at: new Date().toISOString(),
  });
}
