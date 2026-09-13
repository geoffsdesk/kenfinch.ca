import { NextResponse } from 'next/server';
import { mailProvider } from '@/lib/mail';

export const dynamic = 'force-dynamic';

/** Public, secret-free health check: which integrations are configured on this build. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    mailProvider: mailProvider(),
    sms: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_FROM),
    cron: !!process.env.CRON_SECRET,
    at: new Date().toISOString(),
  });
}
