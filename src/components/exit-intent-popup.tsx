"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Download, ArrowRight } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Only trigger when mouse moves toward the top of the viewport
    if (e.clientY <= 5 && !show) {
      // Check if already shown this session
      const alreadyShown = sessionStorage.getItem('exitPopupShown');
      if (!alreadyShown) {
        setShow(true);
        sessionStorage.setItem('exitPopupShown', 'true');
      }
    }
  }, [show]);

  useEffect(() => {
    // Only add listener on desktop (no exit intent on mobile)
    if (window.innerWidth < 768) return;

    // Delay adding the listener so it doesn't fire immediately
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseLeave]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "leads"), {
        name: name || 'Not provided',
        email,
        source: 'exit-intent-popup',
        asset: 'oakville-seller-guide',
        submittedAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to save lead:', err);
      // Still show success to user
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShow(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-background rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        <button
          onClick={() => setShow(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Gold accent bar */}
        <div className="h-1.5 bg-primary w-full" />

        <div className="p-8">
          {!submitted ? (
            <>
              <div className="text-center mb-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Download className="h-7 w-7 text-primary" />
                </div>
                <h2 className="font-headline text-2xl font-bold">
                  Wait! Before you go&hellip;
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  Get our free <strong>Oakville Seller&apos;s Guide</strong> — a step-by-step playbook covering pricing strategy, staging tips, and what top agents do differently to sell homes faster and for more money.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Sending...' : 'Get the Free Guide'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-4">
                No spam, ever. Ken will personally follow up if you have questions.
              </p>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-headline text-2xl font-bold">Your Guide Is Ready!</h2>
              <p className="text-muted-foreground mt-2">
                Click below to download your Oakville Seller&apos;s Guide, then try our free AI home valuation.
              </p>
              <div className="flex flex-col gap-3 mt-6">
                <a href="/oakville-sellers-guide.pdf" download target="_blank" rel="noopener noreferrer">
                  <Button className="w-full" size="lg" variant="default">
                    <Download className="mr-2 h-4 w-4" />
                    Download Seller&apos;s Guide (PDF)
                  </Button>
                </a>
                <a href="/#valuation-tool">
                  <Button className="w-full" size="lg" variant="outline" onClick={() => setShow(false)}>
                    Get Your Free Valuation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
