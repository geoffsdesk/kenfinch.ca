import { NextRequest, NextResponse } from 'next/server';
import { getLead, recordCheckinReply } from '@/lib/leads/store';
import { sendMail, KEN_EMAIL, OVERSIGHT_EMAIL, dashboardUrl, esc } from '@/lib/leads/notify';
import { CONTACT } from '@/lib/site';

export const dynamic = 'force-dynamic';

/**
 * One-click reply target for the check-in email:
 *   /api/leads/checkin?id=<leadId>&t=<token>&a=yes|no
 * Records the answer on the lead and, on "no", nudges Ken immediately.
 */

function page(title: string, body: string, status = 200) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
  <style>body{font-family:Inter,Arial,sans-serif;background:#faf9f6;color:#111;margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
  .card{max-width:480px;background:#fff;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.08);padding:32px;border-top:4px solid #d4af37}h1{font-size:22px;margin:0 0 12px}p{line-height:1.6;color:#444}a{color:#a58a2a}</style></head>
  <body><div class="card"><h1>${esc(title)}</h1>${body}</div></body></html>`;
  return new NextResponse(html, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') ?? '';
  const token = req.nextUrl.searchParams.get('t') ?? '';
  const answer = req.nextUrl.searchParams.get('a');
  if (!id || !token || (answer !== 'yes' && answer !== 'no')) {
    return page('That link is not valid', `<p>Please use the buttons in the email, or call Ken at <a href="${CONTACT.phoneHref}">${CONTACT.phoneDisplay}</a>.</p>`, 400);
  }
  const lead = await getLead(id);
  if (!lead || !lead.followUp?.token || lead.followUp.token !== token) {
    return page('That link is not valid', `<p>Please use the buttons in the email, or call Ken at <a href="${CONTACT.phoneHref}">${CONTACT.phoneDisplay}</a>.</p>`, 404);
  }

  if (lead.followUp.checkinReply !== answer) {
    await recordCheckinReply(id, answer, 'email');
    if (answer === 'no') {
      try {
        await sendMail({
          to: KEN_EMAIL,
          bcc: OVERSIGHT_EMAIL,
          subject: `ACTION: ${lead.name} says you have not reached them yet`,
          html: `<p><strong>${esc(lead.name)}</strong> (${esc(lead.phone ?? '')} ${esc(lead.email)}) replied to the 48-hour check-in saying they have <strong>not</strong> heard from Ken.</p><p>${esc(lead.summary)}</p><p><a href="${dashboardUrl()}">Open the lead inbox</a></p>`,
        });
      } catch (err) {
        console.error('nudge email failed:', err);
      }
    }
  }

  return answer === 'yes'
    ? page('Thanks, glad you connected', `<p>We have noted that Ken has been in touch. If you need anything else, reply to any of his emails or call <a href="${CONTACT.phoneHref}">${CONTACT.phoneDisplay}</a>.</p>`)
    : page('Sorry about that. Ken has been notified.', `<p>We have flagged your request so Ken follows up today. You can also reach him directly at <a href="${CONTACT.phoneHref}">${CONTACT.phoneDisplay}</a>.</p>`);
}
