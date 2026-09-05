"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { trackWhatsAppClick } from '@/lib/analytics';
import { CONTACT } from '@/lib/site';

/** Paths where the floating button should not appear. */
const HIDDEN_ON = ['/ken', '/admin'];

/**
 * Floating WhatsApp button (bottom-right, every page).
 *
 * Opens a chat with Ken's number via the wa.me deep link, pre-filled with a
 * message that says the visitor came from KenFinch.ca and which page they were
 * on, so Ken has context before he replies. Lifts above the sticky CTA bar
 * once that bar is showing (same scroll threshold).
 */
export function WhatsAppButton() {
  const pathname = usePathname();
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (HIDDEN_ON.some((p) => pathname?.startsWith(p))) return null;

  const pageLabel = pathname && pathname !== '/' ? ` (page: ${pathname})` : '';
  const message =
    `Hi Ken, I'm on KenFinch.ca${pageLabel} and I'm looking for more information. ` +
    `Can you help?`;
  const href = `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick(pathname || '/')}
      aria-label="Chat with Ken on WhatsApp"
      title="Chat with Ken on WhatsApp"
      data-testid="whatsapp-button"
      className={[
        'fixed right-4 sm:right-5 z-50 flex items-center gap-2 rounded-full',
        'bg-[#25D366] text-white shadow-lg shadow-black/25 hover:bg-[#1ebe5b] hover:shadow-xl',
        'transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40',
        'h-14 w-14 justify-center sm:h-auto sm:w-auto sm:pl-4 sm:pr-5 sm:py-3',
        lifted ? 'bottom-[84px]' : 'bottom-5',
      ].join(' ')}
    >
      <WhatsAppIcon className="h-7 w-7 sm:h-6 sm:w-6 shrink-0" />
      <span className="hidden sm:inline text-sm font-semibold">Chat with Ken</span>
    </a>
  );
}

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.004 3C8.83 3 3.004 8.826 3.004 16c0 2.29.6 4.53 1.74 6.5L3 29l6.68-1.72A12.94 12.94 0 0 0 16.004 29C23.18 29 29 23.174 29 16S23.18 3 16.004 3zm0 23.7a10.7 10.7 0 0 1-5.46-1.49l-.39-.23-3.96 1.02 1.06-3.86-.26-.4A10.66 10.66 0 0 1 5.3 16c0-5.9 4.8-10.7 10.7-10.7 5.9 0 10.7 4.8 10.7 10.7 0 5.9-4.8 10.7-10.7 10.7zm5.87-8c-.32-.16-1.9-.94-2.2-1.05-.3-.11-.51-.16-.73.16-.21.32-.83 1.05-1.02 1.26-.19.21-.37.24-.69.08-.32-.16-1.36-.5-2.59-1.6-.96-.85-1.6-1.9-1.79-2.23-.19-.32-.02-.5.14-.66.15-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.73-1.75-1-2.4-.26-.63-.53-.54-.73-.55h-.62c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66s1.15 3.09 1.31 3.3c.16.21 2.26 3.45 5.47 4.84.76.33 1.36.53 1.82.68.77.24 1.46.21 2.01.13.61-.09 1.9-.78 2.16-1.53.27-.75.27-1.39.19-1.53-.08-.13-.29-.21-.61-.37z" />
    </svg>
  );
}
