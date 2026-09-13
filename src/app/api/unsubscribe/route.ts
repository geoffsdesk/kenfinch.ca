import { NextRequest, NextResponse } from 'next/server';
import { findContactByToken, setContactStatus } from '@/lib/contacts/store';
import { SITE_URL, CONTACT } from '@/lib/site';

export const dynamic = 'force-dynamic';

/**
 * One-click unsubscribe for database campaigns.
 *   GET  /api/unsubscribe?t=<token>  -> confirmation page (link in the footer)
 *   POST /api/unsubscribe?t=<token>  -> RFC 8058 one-click (Gmail/Yahoo "Unsubscribe" button)
 */
async function unsubscribe(token: string) {
  const c = await findContactByToken(token);
  if (!c) return false;
  if (c.status === 'active' || c.status === 'converted') {
    await setContactStatus(c.id, 'unsubscribed', 'Unsubscribed via email link.', 'contact');
  }
  return true;
}

function page(ok: boolean) {
  const body = ok
    ? `<h1>You're unsubscribed</h1><p>You won't get any more emails from Ken. If you ever need a hand with a home or a mortgage in Oakville, he's at ${CONTACT.phoneDisplay}.</p>`
    : `<h1>Link not recognised</h1><p>This unsubscribe link is not valid. Reply to the email you received and Ken will remove you by hand.</p>`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribe</title>
  <style>body{font-family:Georgia,serif;max-width:520px;margin:60px auto;padding:0 20px;color:#1a1a1a;line-height:1.6}h1{font-size:24px}a{color:#1a1a1a}</style></head>
  <body>${body}<p><a href="${SITE_URL}">kenfinch.ca</a></p></body></html>`;
}

export async function GET(req: NextRequest) {
  const t = req.nextUrl.searchParams.get('t') ?? '';
  let ok = false;
  try {
    ok = await unsubscribe(t);
  } catch (err) {
    console.error('unsubscribe failed:', err);
  }
  return new NextResponse(page(ok), { status: ok ? 200 : 404, headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex' } });
}

export async function POST(req: NextRequest) {
  const t = req.nextUrl.searchParams.get('t') ?? '';
  try {
    const ok = await unsubscribe(t);
    return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
  } catch (err) {
    console.error('unsubscribe failed:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
