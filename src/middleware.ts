import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Redirect non-www to www to avoid duplicate content issues.
 * Google Search Console flagged https://www.kenfinch.ca/ as a
 * "duplicate without user-selected canonical" because both
 * www and non-www resolve to the same page.
 */
export function middleware(request: NextRequest) {
  // On Firebase App Hosting the visitor's hostname arrives in x-forwarded-host;
  // the `host` header is the internal backend name, which is why the plain
  // host check never matched and the apex kept serving a duplicate site.
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').split(':')[0].toLowerCase();

  // Redirect non-www -> www (production only)
  if (host === 'kenfinch.ca') {
    const url = request.nextUrl.clone();
    url.host = 'www.kenfinch.ca';
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except static files and Next.js internals
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
