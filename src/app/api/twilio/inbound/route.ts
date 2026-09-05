import { NextRequest, NextResponse } from 'next/server';
import { findLeadByPhone, recordCheckinReply, addNote } from '@/lib/leads/store';
import { sendMail, KEN_EMAIL, OVERSIGHT_EMAIL, dashboardUrl, esc } from '@/lib/leads/notify';
import { CONTACT } from '@/lib/site';

export const dynamic = 'force-dynamic';

/**
 * Twilio inbound SMS webhook. Point the Twilio number's "A message comes in"
 * webhook at https://www.kenfinch.ca/api/twilio/inbound (HTTP POST).
 *
 * Matches the sender to a lead by phone number and records YES / NO replies to
 * the check-in. Anything else is stored as a note. Responds with TwiML.
 */

function twiml(message?: string) {
  const body = message ? `<Message>${esc(message)}</Message>` : '';
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`, {
    headers: { 'content-type': 'text/xml' },
  });
}

async function validSignature(req: NextRequest, params: Record<string, string>) {
  const token = process.env.TWILIO_AUTH_TOKEN;
  const sig = req.headers.get('x-twilio-signature');
  if (!token || !sig) return false;
  const { default: twilio } = await import('twilio');
  const url = process.env.TWILIO_WEBHOOK_URL || `https://www.kenfinch.ca${req.nextUrl.pathname}`;
  return twilio.validateRequest(token, sig, url, params);
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const params: Record<string, string> = {};
  form.forEach((v, k) => {
    params[k] = String(v);
  });
  if (!(await validSignature(req, params))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }

  const from = params.From ?? '';
  const body = (params.Body ?? '').trim();
  const lead = await findLeadByPhone(from);
  if (!lead) return twiml(`Thanks for texting Ken Finch. Ken will reply shortly, or call ${CONTACT.phoneDisplay}.`);

  const normalized = body.toLowerCase().replace(/[^a-z]/g, '');
  if (normalized === 'yes' || normalized === 'y') {
    await recordCheckinReply(lead.id, 'yes', 'sms');
    return twiml('Great, thanks for confirming. Ken will keep in touch.');
  }
  if (normalized === 'no' || normalized === 'n') {
    await recordCheckinReply(lead.id, 'no', 'sms');
    try {
      await sendMail({
        to: KEN_EMAIL,
        bcc: OVERSIGHT_EMAIL,
        subject: `ACTION: ${lead.name} texted that you have not reached them`,
        html: `<p><strong>${esc(lead.name)}</strong> (${esc(lead.phone ?? '')}) replied NO to the check-in.</p><p>${esc(lead.summary)}</p><p><a href="${dashboardUrl()}">Open the lead inbox</a></p>`,
      });
    } catch (err) {
      console.error('nudge email failed:', err);
    }
    return twiml(`Sorry about that. Ken has been notified and will call you today. You can also reach him at ${CONTACT.phoneDisplay}.`);
  }
  if (normalized === 'stop' || normalized === 'unsubscribe') {
    // Twilio handles STOP at the carrier level; just record it.
    await addNote(lead.id, 'Lead replied STOP to SMS. Do not text.', 'lead');
    return twiml();
  }
  await addNote(lead.id, `SMS from lead: ${body.slice(0, 500)}`, 'lead');
  return twiml(`Thanks, got it. Ken will follow up, or call him at ${CONTACT.phoneDisplay}.`);
}
