"use client";

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Download, ArrowRight, Landmark, Phone } from 'lucide-react';
import { createLead } from '@/app/actions/leads';
import { CONTACT } from '@/lib/site';
import Link from 'next/link';

/**
 * Exit-intent popup.
 *
 * Buyer pages (default): quick "what can I afford?" capture that routes the
 * visitor to the pre-approval form and stores a light lead.
 * Seller pages (/sell*): the original Seller's Guide PDF offer, also
 * triggered manually by the footer/guide links via `openLeadPopup`.
 */
export function ExitIntentPopup() {
  const pathname = usePathname();
  const isSeller = !!pathname && pathname.startsWith('/sell');

  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<'buyer' | 'seller'>(isSeller ? 'seller' : 'buyer');
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(isSeller ? 'seller' : 'buyer');
  }, [isSeller]);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY <= 5 && !show) {
      const alreadyShown = sessionStorage.getItem('exitPopupShown');
      if (!alreadyShown) {
        setShow(true);
        sessionStorage.setItem('exitPopupShown', 'true');
      }
    }
  }, [show]);

  // Manual trigger (Seller's Guide links).
  useEffect(() => {
    const handleManualOpen = () => {
      setMode('seller');
      setShow(true);
    };
    window.addEventListener('openLeadPopup', handleManualOpen);
    return () => window.removeEventListener('openLeadPopup', handleManualOpen);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) return;
    if (pathname?.startsWith('/ken') || pathname?.startsWith('/admin')) return;
    const timer = setTimeout(() => document.addEventListener('mouseleave', handleMouseLeave), 8000);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseLeave, pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await createLead({
        type: 'popup',
        name: name || undefined,
        email,
        asset: mode === 'seller' ? 'oakville-seller-guide' : 'buyer-affordability-check',
        source: 'exit-intent-popup',
        page: pathname || '',
      });
    } catch (err) {
      console.error('Failed to save lead:', err);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShow(false)} />

      <div className="relative w-full max-w-lg bg-background rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        <button onClick={() => setShow(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        <div className="h-1.5 bg-primary w-full" />

        <div className="p-8">
          {mode === 'buyer' ? (
            !submitted ? (
              <>
                <div className="text-center mb-6">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Landmark className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="font-headline text-2xl font-bold">Not sure what you can afford?</h2>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    Leave your email and Ken, a licensed mortgage broker, will send you a quick affordability estimate and the
                    first-time buyer programs you may qualify for. No credit check.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <Input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                  <Input type="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? 'Sending...' : 'Send my estimate'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Or skip the email and{' '}
                  <Link href="/mortgage#apply" className="text-primary font-medium hover:underline" onClick={() => setShow(false)}>
                    do the 2-minute pre-approval check
                  </Link>.
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="font-headline text-2xl font-bold">Got it. Ken will be in touch.</h2>
                <p className="text-muted-foreground mt-2">
                  Want numbers faster? Answer a few questions and Ken can call you with a real budget within one business day.
                </p>
                <div className="flex flex-col gap-3 mt-6">
                  <Link href="/mortgage#apply" onClick={() => setShow(false)}>
                    <Button className="w-full" size="lg">
                      Start the pre-approval check
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <a href={CONTACT.phoneHref}>
                    <Button className="w-full" size="lg" variant="outline">
                      <Phone className="mr-2 h-4 w-4" />
                      Call {CONTACT.phoneDisplay}
                    </Button>
                  </a>
                </div>
              </div>
            )
          ) : !submitted ? (
            <>
              <div className="text-center mb-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Download className="h-7 w-7 text-primary" />
                </div>
                <h2 className="font-headline text-2xl font-bold">Wait! Before you go&hellip;</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  Get the free <strong>Oakville Seller&apos;s Guide</strong>: a step-by-step playbook covering pricing strategy,
                  staging tips, and what top agents do differently to sell homes faster and for more money.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input type="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Sending...' : 'Get the Free Guide'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground text-center mt-4">No spam, ever. Ken will personally follow up if you have questions.</p>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-headline text-2xl font-bold">Your Guide Is Ready!</h2>
              <p className="text-muted-foreground mt-2">Download your Oakville Seller&apos;s Guide, then try the free AI home valuation.</p>
              <div className="flex flex-col gap-3 mt-6">
                <a href="/oakville-sellers-guide.pdf" download target="_blank" rel="noopener noreferrer">
                  <Button className="w-full" size="lg">
                    <Download className="mr-2 h-4 w-4" />
                    Download Seller&apos;s Guide (PDF)
                  </Button>
                </a>
                <Link href="/sell#valuation-tool" onClick={() => setShow(false)}>
                  <Button className="w-full" size="lg" variant="outline">
                    Get Your Free Valuation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
