import { Button } from '@/components/ui/button';
import { HomeValuation } from '@/components/home-valuation';
import { CheckCircle, Phone, ArrowRight, Star, Shield, Clock, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'What Is Your Oakville Home Worth? | Free AI Valuation',
  description: 'Get a free, instant AI-powered home valuation for your Oakville property. See what your home is worth in today\'s market. No obligation.',
  keywords: ['home valuation Oakville', 'what is my home worth', 'sell home Oakville', 'Oakville house value', 'free home appraisal Oakville'],
  robots: { index: false, follow: false }, // Don't index paid landing pages
};

export default function SellLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Minimal header — no navigation, just branding + phone */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/kf_logo.png" alt="Ken Finch Real Estate" width={160} height={45} className="h-10 w-auto" />
            <span className="hidden sm:inline-block h-6 w-px bg-border" />
            <img src="/logo_rlp.png" alt="Royal LePage Signature" className="hidden sm:inline-block" style={{ height: '28px', width: 'auto' }} />
          </Link>
          <a href="tel:+14165205544" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
            <Phone className="h-4 w-4" />
            (416) 520-5544
          </a>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero — single focus: get the valuation */}
        <section className="relative w-full py-12 md:py-16 lg:py-20 hero-gradient overflow-hidden">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-start">
              {/* Left — headline + trust signals */}
              <div className="flex flex-col justify-center space-y-6 animate-fade-in-up">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                    <TrendingUp className="h-4 w-4" />
                    Oakville Market Is Moving — Are You Ready?
                  </div>
                  <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl xl:text-6xl/none">
                    Find Out What Your Home Is <span className="text-gradient">Really Worth</span>
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-[520px]">
                    Get a free, instant AI-powered valuation for your Oakville home. No obligation, no pressure — just the data you need to make smart decisions.
                  </p>
                </div>

                {/* Trust signals */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  {[
                    { icon: Clock, label: "Instant Results", desc: "AI-powered in seconds" },
                    { icon: Shield, label: "100% Free", desc: "No obligation ever" },
                    { icon: Star, label: "5-Star Service", desc: "20+ years experience" },
                    { icon: CheckCircle, label: "Local Expert", desc: "Oakville specialist" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Social proof */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                        <Star className="h-3 w-3 text-primary fill-primary" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">5-Star Service</span> — Trusted by Oakville homeowners
                  </p>
                </div>
              </div>

              {/* Right — Valuation form */}
              <div className="w-full" id="valuation-tool">
                <HomeValuation />
              </div>
            </div>
          </div>
        </section>

        {/* How it works — 3 simple steps */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Simple Process</p>
              <h2 className="font-headline text-2xl font-bold sm:text-3xl">How It Works</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
              {[
                { step: "1", title: "Enter Your Address", desc: "Type in your Oakville home address and a few basic details about your property." },
                { step: "2", title: "Get Your Valuation", desc: "Our AI analyzes recent sales, market trends, and neighbourhood data to estimate your home's current value." },
                { step: "3", title: "Talk to Ken (Optional)", desc: "Want a more precise number? Ken will prepare a detailed Comparative Market Analysis — free, no strings attached." },
              ].map((item) => (
                <div key={item.step} className="text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-lg font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-headline text-lg font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Ken — brief credibility section */}
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[300px_1fr] items-center max-w-5xl mx-auto">
              <div className="relative mx-auto lg:mx-0">
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-xl border-4 border-primary/20">
                  <Image
                    src="/ken_headshot_professional.jpg"
                    alt="Ken Finch — Oakville Real Estate Agent"
                    width={300}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">Your Local Expert</p>
                <h2 className="font-headline text-2xl font-bold sm:text-3xl">
                  Meet Ken Finch
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  With over 20 years of experience serving Oakville homeowners, Ken combines deep local knowledge with modern marketing to help sellers get top dollar. As a Broker with Royal LePage Signature Realty, Ken brings the resources of Canada&apos;s largest real estate network to every client.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  {[
                    "20+ years in Oakville",
                    "Oakville specialist",
                    "Royal LePage",
                    "5-star client reviews",
                  ].map((badge) => (
                    <span key={badge} className="inline-flex items-center gap-1.5 text-sm bg-primary/10 text-primary font-medium px-3 py-1 rounded-full">
                      <CheckCircle className="h-3.5 w-3.5" />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 md:py-16 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="font-headline text-2xl font-bold sm:text-3xl">
              Ready to See What Your Home Is Worth?
            </h2>
            <p className="text-primary-foreground/80 text-lg">
              Join hundreds of Oakville homeowners who have used our free AI valuation tool. Get your results in under 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#valuation-tool">
                <Button size="lg" variant="secondary" className="font-semibold shadow-lg text-base px-8">
                  Get My Free Valuation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href="tel:+14165205544">
                <Button size="lg" variant="secondary" className="font-semibold text-base px-8 shadow-lg">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Ken Directly
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal footer */}
      <footer className="border-t py-6">
        <div className="container px-4 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Ken Finch, Broker — Royal LePage Signature Realty, Brokerage. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
