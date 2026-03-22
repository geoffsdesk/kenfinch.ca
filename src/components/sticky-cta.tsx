"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function StickyCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past the hero (roughly 600px)
      setVisible(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 animate-fade-in-up">
      <div className="bg-primary/95 backdrop-blur-sm text-primary-foreground shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
        <div className="container px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="hidden sm:block">
              <p className="font-headline text-sm font-bold">Ready to find out what your home is worth?</p>
            </div>
            <div className="flex items-center gap-3 flex-1 sm:flex-none justify-center sm:justify-end">
              <Link href="/#valuation-tool">
                <Button
                  size="sm"
                  variant="secondary"
                  className="font-semibold shadow-md text-xs sm:text-sm"
                >
                  Free AI Valuation
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
              <a href="tel:+19055103642">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-xs sm:text-sm"
                >
                  <Phone className="mr-1.5 h-3.5 w-3.5" />
                  <span className="hidden sm:inline">(905) 510-3642</span>
                  <span className="sm:hidden">Call Ken</span>
                </Button>
              </a>
              <button
                onClick={() => setDismissed(true)}
                className="text-primary-foreground/60 hover:text-primary-foreground ml-1"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
