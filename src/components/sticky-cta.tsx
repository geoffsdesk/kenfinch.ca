"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Phone, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CONTACT } from '@/lib/site';

/** Paths where the sticky bar would compete with an on-page form or is irrelevant. */
const HIDDEN_ON = ['/ken', '/admin'];

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

  const isSeller = pathname?.startsWith('/sell');
  const headline = isSeller ? 'Ready to find out what your home is worth?' : 'Know your budget before you fall for a house.';
  const ctaHref = isSeller ? '/sell#valuation-tool' : '/mortgage#apply';
  const ctaLabel = isSeller ? 'Free AI valuation' : 'Get pre-approved';

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
