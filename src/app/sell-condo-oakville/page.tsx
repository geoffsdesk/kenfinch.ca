import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HomeValuation } from '@/components/home-valuation';
import { CheckCircle, Phone, ArrowRight, Star, Building2, Clock, TrendingUp, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Sell Your Condo Fast in Oakville | Ken Finch Real Estate',
  description: 'Need to sell your Oakville condo quickly? Get a free AI-powered condo valuation, expert pricing strategy, and targeted marketing to sell your condo fast at the best price.',
  keywords: [
    'quick sale condo oakville',
    'sell condo oakville',
    'oakville condo for sale',
    'sell condo fast oakville',
    'condo valuation oakville',
    'oakville condo market',
    'sell townhouse oakville',
  ],
  openGraph: {
    title: 'Sell Your Condo Fast in Oakville | Ken Finch',
    description: 'Expert condo selling strategies tailored for Oakville. Free AI valuation included.',
  },
};

const condoNeighbourhoods = [
  { name: 'Uptown Core', avgPrice: '$750K', description: 'Oakville\'s fastest-growing condo market with new developments and strong demand.' },
  { name: 'College Park', avgPrice: '$1.1M', description: 'Central location near Sheridan College with diverse condo and townhome options.' },
  { name: 'Bronte', avgPrice: '$1.6M', description: 'Lakeside village living with charming harbour-area condos and townhomes.' },
  { name: 'West Oak Trails', avgPrice: '$1.3M', description: 'Family-friendly North Oakville with stacked townhomes and condos at accessible prices.' },
];

export default function SellCondoOakvillePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative w-full py-16 md:py-24 bg-secondary/30 overflow-hidden">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                <TrendingUp className="h-4 w-4" />
                Oakville Condo Market Is Active
              </div>
              <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Sell Your Oakville Condo <span className="text-primary">Quickly &amp; For Top Dollar</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Whether you&apos;re downsizing, relocating, or upgrading, Ken Finch&apos;s data-driven approach
                and targeted marketing help Oakville condo owners sell faster and at the best possible price.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg">
                  <a href="#condo-valuation">
                    <Building2 className="mr-2 h-4 w-4" />
                    Get Your Free Condo Valuation
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="tel:+14165205544">
                    <Phone className="mr-2 h-4 w-4" />
                    Call (416) 520-5544
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Why Ken for Condos */}
        <section className="w-full py-16 md:py-20">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Why Choose Ken Finch</p>
              <h2 className="font-headline text-3xl font-bold">Condo Selling Expertise You Can Trust</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="border-0 shadow-md">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Building-Level Pricing</h3>
                  <p className="text-sm text-muted-foreground">
                    Ken analyses comparable sales within your specific building — not just neighbourhood
                    averages — to price your unit competitively from day one.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Fast Results</h3>
                  <p className="text-sm text-muted-foreground">
                    Strategic pricing and targeted digital marketing designed to generate
                    showings and offers within the first week of listing.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Condo-Specific Marketing</h3>
                  <p className="text-sm text-muted-foreground">
                    Professional photography optimised for condo spaces, plus listing copy that
                    highlights what condo buyers actually care about.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Quick Sale Checklist */}
        <section className="w-full py-16 md:py-20 bg-muted/50">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Your Quick Sale Playbook</p>
              <h2 className="font-headline text-3xl font-bold">How to Sell Your Condo Fast in Oakville</h2>
            </div>
            <div className="grid gap-4">
              {[
                { title: 'Get a data-driven price', desc: 'Based on recent sales in your building, floor level, view, and included features like parking and locker.' },
                { title: 'Stage for space', desc: 'Remove excess furniture to make every room feel larger. Show the balcony as liveable outdoor space.' },
                { title: 'Invest in professional photography', desc: 'Wide-angle shots, lifestyle photos, and building amenity images that make your listing stand out.' },
                { title: 'Highlight condo-specific features', desc: 'In-suite laundry, maintenance fees, amenities, transit proximity, and walkability score.' },
                { title: 'Time your listing strategically', desc: 'List Thursday for weekend showing traffic. Price for multiple offers within the first week.' },
                { title: 'Work with a condo-savvy agent', desc: 'Status certificate navigation, building reputation insights, and buyer pool targeting.' },
              ].map((step, i) => (
                <div key={i} className="flex gap-4 items-start bg-background rounded-lg p-5 shadow-sm">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild variant="link" className="text-primary">
                <Link href="/blog/quick-sale-condo-oakville">
                  Read the full condo selling guide <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Condo Neighbourhoods */}
        <section className="w-full py-16 md:py-20">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Oakville Condo Markets</p>
              <h2 className="font-headline text-3xl font-bold">Top Neighbourhoods for Condo Sales</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {condoNeighbourhoods.map((n) => (
                <Card key={n.name} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold">{n.name}</h3>
                      </div>
                      <span className="text-sm font-bold text-primary">{n.avgPrice}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{n.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild variant="outline">
                <Link href="/neighborhoods">
                  Explore All 12 Neighbourhoods <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* AI Valuation Tool */}
        <section id="condo-valuation" className="w-full py-16 md:py-20 bg-secondary/30">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Free Tool</p>
              <h2 className="font-headline text-3xl font-bold">What Is Your Condo Worth?</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                Get an instant AI-powered estimate for your Oakville condo. Enter your details below for a
                free valuation based on the latest market data.
              </p>
            </div>
            <HomeValuation />
          </div>
        </section>

        {/* Testimonial */}
        <section className="w-full py-16 md:py-20">
          <div className="container px-4 md:px-6 max-w-3xl mx-auto text-center">
            <div className="flex justify-center gap-1 text-primary mb-6">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <blockquote className="text-lg text-muted-foreground leading-relaxed italic">
              &ldquo;Ken really knew the market and had a smart game plan from day one. Thanks to his marketing and advice, we got multiple offers within days&mdash;and ended up selling for more than we expected.&rdquo;
            </blockquote>
            <p className="font-semibold mt-4">&mdash; Wei and Linda, Oakville</p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full py-16 md:py-20 bg-primary/5">
          <div className="container px-4 md:px-6 max-w-3xl mx-auto text-center">
            <h2 className="font-headline text-3xl font-bold">Ready to Sell Your Condo?</h2>
            <p className="mt-3 text-muted-foreground">
              Contact Ken Finch for a personalised condo market analysis, or try the free AI valuation tool above.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button asChild size="lg">
                <Link href="/contact">
                  Contact Ken <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="tel:+14165205544">
                  <Phone className="mr-2 h-4 w-4" />
                  (416) 520-5544
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
