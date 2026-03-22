import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Redirect non-www to www to avoid duplicate content issues.
 * Google Search Console flagged https://www.kenfinch.ca/ as a
 * "duplicate without user-selected canonical" because both
 * www and non-www resolve to the same page.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  // Redirect non-www → www (production only)
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
