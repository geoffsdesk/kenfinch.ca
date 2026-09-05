import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { BuyerLeadForm } from '@/components/buyer-lead-form';
import { MortgageDisclosure } from '@/components/mortgage-disclosure';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { neighborhoods } from '@/lib/neighborhoods';
import { CONTACT, SITE_URL } from '@/lib/site';
import { ArrowRight, Phone, CheckCircle, MapPin, Shield, Clock, Star, Landmark, Search, Handshake, KeyRound } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buy a Home in Oakville & the GTA with a Buyer Agent + Mortgage Broker',
  description:
    'Looking to buy a home in Oakville, Burlington, Mississauga or the GTA? Ken Finch is a licensed buyer agent and mortgage broker. Get pre-approved, tour the right homes, and win your offer with one advisor.',
  keywords: [
    'buy a home in Oakville',
    'Oakville buyer agent',
    'homes for sale Oakville',
    'real estate agent for buyers Oakville',
    'first time home buyer GTA',
    'mortgage broker Oakville',
    'Burlington buyer agent',
    'Mississauga real estate agent',
  ],
  alternates: { canonical: '/buy' },
  openGraph: {
    title: 'Buy a Home in Oakville & the GTA | Ken Finch',
    description: 'Buyer representation and mortgage pre-approval from one licensed advisor. Serving Oakville and the GTA.',
    url: `${SITE_URL}/buy`,
    images: [`${SITE_URL}/hero_oakville_aerial.jpg`],
  },
};

const AREAS = [
  { name: 'Oakville', blurb: 'Home base. Every neighbourhood from Bronte to Joshua Creek.' },
  { name: 'Burlington', blurb: 'Lakeshore to the escarpment, with Oakville-level schools at a lower entry price.' },
  { name: 'Mississauga', blurb: 'Port Credit, Lorne Park, Erin Mills, Streetsville and the condo core.' },
  { name: 'Milton', blurb: 'New builds and family neighbourhoods with GO access.' },
  { name: 'Toronto West', blurb: 'Etobicoke, High Park, the Junction and the west-end condo market.' },
  { name: 'Anywhere in Ontario (mortgages)', blurb: 'Mortgage pre-approvals and financing province-wide.' },
];

export default function BuyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: 'Buyer Representation - Oakville & GTA',
        serviceType: 'Real estate buyer agent',
        provider: { '@id': `${SITE_URL}/#agent` },
        areaServed: ['Oakville', 'Burlington', 'Mississauga', 'Milton', 'Toronto', 'Greater Toronto Area'],
        url: `${SITE_URL}/buy`,
        description:
          'Full buyer representation in Oakville and the GTA from Ken Finch, a licensed real estate broker and mortgage broker: pre-approval, curated search, offer strategy and closing coordination.',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Buy', item: `${SITE_URL}/buy` },
        ],
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="flex-1">
        {/* Hero with form */}
        <section className="relative w-full py-12 md:py-16 lg:py-20 hero-gradient overflow-hidden">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
              <div className="space-y-6 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  <MapPin className="h-4 w-4" />
                  Oakville &middot; Burlington &middot; Mississauga &middot; GTA
                </div>
                <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none">
                  Buy the right home in Oakville, <span className="text-gradient">with financing already handled.</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-[560px]">
                  Ken Finch represents buyers across the GTA as a licensed real estate broker, and arranges their mortgages as a
                  licensed mortgage broker. Start with a two-minute pre-approval check and Ken will call you with a real budget.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  {[
                    { icon: Landmark, label: 'Pre-approval in-house', desc: '30+ lenders, one application' },
                    { icon: Shield, label: 'No cost to you', desc: 'Buyer commission paid from the sale in most cases' },
                    { icon: Clock, label: 'Fast response', desc: 'Ken calls within one business day' },
                    { icon: Star, label: '20+ years local', desc: 'Oakville specialist since 2004' },
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

                <div className="flex items-center gap-3 pt-2 text-sm text-muted-foreground">
                  <img src="/ken_headshot_professional.jpg" alt="Ken Finch" className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/30" width="40" height="40" />
                  <span>
                    Prefer to talk?{' '}
                    <a href={CONTACT.phoneHref} className="font-semibold text-primary hover:underline">Call Ken at {CONTACT.phoneDisplay}</a>
                  </span>
                </div>
              </div>

              <div id="pre-approval" className="scroll-mt-24">
                <BuyerLeadForm source="buy-landing" />
              </div>
            </div>
          </div>
        </section>

        {/* What a buyer agent does */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Buyer representation</p>
              <h2 className="font-headline text-3xl font-bold sm:text-4xl">What Ken does for buyers</h2>
              <p className="text-lg text-muted-foreground">
                Under Ontario&apos;s TRESA rules you choose who represents you. Here is what representation by Ken includes.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {[
                { icon: Landmark, title: 'Financing plan', items: ['Pre-approval and rate hold', 'First-time buyer programs', 'Down payment and closing cost budget', 'Bridge financing if you are selling too'] },
                { icon: Search, title: 'Search', items: ['Curated listings, not a firehose', 'Off-market and coming-soon homes', 'Private showings on your schedule', 'Honest read on condition and resale'] },
                { icon: Handshake, title: 'Offer & negotiation', items: ['Comparable sales analysis', 'Pricing and escalation strategy', 'Inspection and financing conditions', 'Multiple-offer tactics that protect you'] },
                { icon: KeyRound, title: 'Closing', items: ['Lender, lawyer, and appraisal coordination', 'Final walkthrough', 'Funding confirmed for closing day', 'Post-closing support and referrals'] },
              ].map((c) => (
                <Card key={c.title} className="border-0 shadow-md card-hover">
                  <CardContent className="p-6">
                    <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <c.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-headline text-lg font-bold">{c.title}</h3>
                    <ul className="mt-3 space-y-2">
                      {c.items.map((i) => (
                        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          {i}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Areas */}
        <section className="py-16 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Where Ken works</p>
              <h2 className="font-headline text-3xl font-bold sm:text-4xl">Oakville first. The GTA, gladly.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {AREAS.map((a) => (
                <div key={a.name} className="rounded-xl border bg-card p-5 flex gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{a.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{a.blurb}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Neighbourhood guides */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Oakville neighbourhood guides</p>
              <h2 className="font-headline text-3xl font-bold sm:text-4xl">Pick a neighbourhood, see what your budget buys</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
              {neighborhoods.map((n) => (
                <Link
                  key={n.slug}
                  href={`/neighborhoods/${n.slug}`}
                  className="group rounded-xl border bg-card p-4 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <p className="font-semibold group-hover:text-primary transition-colors">{n.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">From {n.priceRange.split(' ')[0]}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-14 md:py-16 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="font-headline text-3xl font-bold">Ready to start looking?</h2>
            <p className="text-primary-foreground/85 text-lg">
              Get pre-approved first. It takes two minutes here, and it changes how every listing agent treats your offer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#pre-approval">
                <Button size="lg" variant="secondary" className="font-semibold shadow-lg text-base px-8">
                  Get pre-approved
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href={CONTACT.phoneHref}>
                <Button size="lg" variant="secondary" className="font-semibold text-base px-8 shadow-lg">
                  <Phone className="mr-2 h-4 w-4" />
                  Call {CONTACT.phoneDisplay}
                </Button>
              </a>
            </div>
          </div>
        </section>

        <div className="container px-4 md:px-6 py-8">
          <MortgageDisclosure className="max-w-4xl mx-auto text-center" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
