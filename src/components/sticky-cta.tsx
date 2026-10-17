"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Phone, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CONTACT } from '@/lib/site';

/** Paths where the sticky bar would compete with an on-page form or is irrelevant. */
const HIDDEN_ON = ['/ken', '/admin'];

/** Route-aware copy: each landing page points the bar at its own form. */
function ctaFor(pathname: string | null): { headline: string; href: string; label: string } {
  if (pathname?.startsWith('/sell')) {
    return { headline: 'Ready to find out what your home is worth?', href: '/sell#valuation-tool', label: 'Free AI valuation' };
  }
  if (pathname?.startsWith('/renewal')) {
    return { headline: 'Renewal coming up? Do not sign the bank letter yet.', href: '/renewal#renewal-form', label: 'Tell Ken your renewal month' };
  }
  if (pathname?.startsWith('/mortgage')) {
    return { headline: 'Not sure what you can afford? Two minutes, no credit check.', href: '/afford#calculator', label: 'See what you can afford' };
  }
  if (pathname?.startsWith('/afford')) {
    return { headline: 'Ready to turn the estimate into a pre-approval?', href: '/mortgage#apply', label: 'Start your pre-approval' };
  }
  return { headline: 'Know your budget before you fall for a house.', href: '/mortgage#apply', label: 'Get pre-approved' };
}

export function StickyCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (dismissed || !visible) return null;
  if (HIDDEN_ON.some((p) => pathname?.startsWith(p))) return null;

  const { headline, href: ctaHref, label: ctaLabel } = ctaFor(pathname);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 animate-fade-in-up">
      <div className="bg-slate-950/95 backdrop-blur-sm text-white shadow-[0_-4px_20px_rgba(0,0,0,0.25)] border-t border-white/10">
        <div className="container px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <p className="hidden sm:block font-headline text-sm font-bold">{headline}</p>
            <div className="flex items-center gap-3 flex-1 sm:flex-none justify-center sm:justify-end">
              <Link href={ctaHref}>
                <Button size="sm" className="font-semibold shadow-md text-xs sm:text-sm">
                  {ctaLabel}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
              <a href={CONTACT.phoneHref}>
                <Button size="sm" variant="secondary" className="font-semibold shadow-md text-xs sm:text-sm">
                  <Phone className="mr-1.5 h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Call {CONTACT.phoneDisplay}</span>
                  <span className="sm:hidden">Call Ken</span>
                </Button>
              </a>
              <button onClick={() => setDismissed(true)} className="text-white/60 hover:text-white ml-1" aria-label="Dismiss">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
