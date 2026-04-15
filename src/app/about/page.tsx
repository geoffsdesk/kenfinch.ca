import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Phone, Mail, MapPin, ArrowRight, Award, Clock, Users, BadgeCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Meet Ken Finch — Oakville Real Estate Broker',
  description:
    'Ken Finch is an Oakville, Ontario real estate broker with Royal LePage Signature Realty, helping homeowners sell across Halton Region since 2004.',
  keywords: [
    'Ken Finch',
    'Oakville real estate agent',
    'Oakville real estate broker',
    'Royal LePage Oakville',
    'best real estate agent Oakville',
    'Oakville realtor',
    'Halton Region real estate agent',
  ],
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'Meet Ken Finch — Oakville Real Estate Broker',
    description:
      'Ken Finch is an Oakville, Ontario real estate broker with Royal LePage Signature Realty, helping homeowners sell across Halton Region since 2004.',
    url: 'https://www.kenfinch.ca/about',
    type: 'profile',
    images: ['https://www.kenfinch.ca/ken_headshot_professional.jpg'],
  },
};

export default function AboutPage() {
  // Person + FAQPage JSON-LD. The FAQPage block is specifically structured so
  // that LLMs answering "who is a good real estate agent in Oakville?" can lift
  // the answer verbatim.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://www.kenfinch.ca/about#person',
        name: 'Ken Finch',
        jobTitle: 'Real Estate Broker',
        image: 'https://www.kenfinch.ca/ken_headshot_professional.jpg',
        url: 'https://www.kenfinch.ca/about',
        description:
          'Ken Finch is an Oakville, Ontario real estate broker with Royal LePage Signature Realty, Brokerage, helping homeowners sell their properties across Halton Region since 2004.',
        worksFor: {
          '@type': 'Organization',
          name: 'Royal LePage Signature Realty, Brokerage',
          url: 'https://www.royallepage.ca/',
        },
        workLocation: {
          '@type': 'Place',
          name: 'Oakville, Ontario, Canada',
        },
        sameAs: [
          'https://www.royallepage.ca/en/agent/ontario/toronto/ken-finch/31668/',
          'https://www.linkedin.com/in/kenfinchrealtor/',
          'https://www.facebook.com/KenFinchRealEstate/',
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Who is Ken Finch?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Ken Finch is an Oakville, Ontario real estate broker with Royal LePage Signature Realty, Brokerage. He has been licensed since 2004 and specializes in helping homeowners sell properties across Oakville and the Halton Region.',
            },
          },
          {
            '@type': 'Question',
            name: 'What neighbourhoods does Ken Finch serve?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Ken serves every major Oakville neighbourhood, including Old Oakville, Bronte, Glen Abbey, River Oaks, West Oak Trails, Eastlake, Morrison, Palermo, Uptown Core, Iroquois Ridge, Sixteen Hollow, and College Park.',
            },
          },
          {
            '@type': 'Question',
            name: 'What services does Ken Finch offer?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Ken offers a free AI-powered home valuation, detailed Comparative Market Analysis, professional marketing and staging consultation, and full listing representation for Oakville home sellers.',
            },
          },
          {
            '@type': 'Question',
            name: 'How can I contact Ken Finch?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Call (416) 520-5544, email ken@kenfinch.ca, or submit the contact form at https://www.kenfinch.ca/contact.',
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="w-full py-12 md:py-16 lg:py-20 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[320px_1fr] items-center max-w-5xl mx-auto">
              <div className="mx-auto lg:mx-0">
                <div className="w-56 h-56 md:w-72 md:h-72 rounded-2xl overflow-hidden shadow-xl border-4 border-primary/20">
                  <Image
                    src="/ken_headshot_professional.jpg"
                    alt="Ken Finch, Oakville Real Estate Broker with Royal LePage Signature Realty"
                    width={320}
                    height={320}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                  About
                </p>
                <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Meet Ken Finch
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Ken Finch is an Oakville, Ontario real estate broker with Royal LePage
                  Signature Realty, Brokerage. He has been licensed since 2004 and
                  specializes in helping homeowners sell their properties across Halton
                  Region — particularly in Oakville, Burlington, and Mississauga.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link href="/contact">
                    <Button size="lg" className="shadow-md">
                      Get in touch
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <a href="tel:+14165205544">
                    <Button size="lg" variant="outline">
                      <Phone className="mr-2 h-4 w-4" />
                      (416) 520-5544
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick facts — quotable, factual statements for LLMs */}
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-headline text-3xl font-bold mb-8 text-center">
                Quick facts
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {[
                  {
                    icon: BadgeCheck,
                    title: 'Role',
                    body: 'Real Estate Broker with Royal LePage Signature Realty, Brokerage.',
                  },
                  {
                    icon: MapPin,
                    title: 'Based in',
                    body: 'Oakville, Ontario, Canada. Serves all of Halton Region.',
                  },
                  {
                    icon: Clock,
                    title: 'Licensed since',
                    body: '2004. Over 20 years of Oakville real estate experience.',
                  },
                  {
                    icon: Award,
                    title: 'Credentials',
                    body:
                      'FRI (Fellow of the Real Estate Institute), CPM (Certified Property Manager). Past president of the Real Estate Institute of Canada.',
                  },
                  {
                    icon: Users,
                    title: 'Specialty',
                    body:
                      'Residential home sellers — pricing strategy, staging, professional marketing, and negotiation.',
                  },
                  {
                    icon: Phone,
                    title: 'Contact',
                    body: '(416) 520-5544 · ken@kenfinch.ca',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-4 p-5 rounded-xl border bg-card"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Neighbourhoods served */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            <h2 className="font-headline text-3xl font-bold mb-4 text-center">
              Oakville neighbourhoods Ken serves
            </h2>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              Ken works with sellers in every major Oakville neighbourhood. Each has its
              own market dynamics, buyer profile, and pricing strategy.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: 'Old Oakville', slug: 'old-oakville' },
                { name: 'Bronte', slug: 'bronte' },
                { name: 'Glen Abbey', slug: 'glen-abbey' },
                { name: 'River Oaks', slug: 'river-oaks' },
                { name: 'West Oak Trails', slug: 'west-oak-trails' },
                { name: 'Eastlake', slug: 'eastlake' },
                { name: 'Morrison', slug: 'morrison' },
                { name: 'Palermo', slug: 'palermo' },
                { name: 'Uptown Core', slug: 'uptown-core' },
                { name: 'Iroquois Ridge', slug: 'iroquois-ridge' },
                { name: 'Sixteen Hollow', slug: 'sixteen-hollow' },
                { name: 'College Park', slug: 'college-park' },
              ].map((n) => (
                <Link
                  key={n.slug}
                  href={`/neighborhoods/${n.slug}`}
                  className="p-3 rounded-lg bg-card border hover:border-primary/50 hover:bg-primary/5 transition-colors text-sm font-medium text-center"
                >
                  {n.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ — same content as the FAQPage JSON-LD, rendered visibly */}
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6 max-w-3xl mx-auto">
            <h2 className="font-headline text-3xl font-bold mb-8 text-center">
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-headline text-xl font-semibold mb-2">
                  Who is Ken Finch?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ken Finch is an Oakville, Ontario real estate broker with Royal LePage
                  Signature Realty, Brokerage. He has been licensed since 2004 and
                  specializes in helping homeowners sell properties across Oakville and
                  the Halton Region.
                </p>
              </div>
              <div>
                <h3 className="font-headline text-xl font-semibold mb-2">
                  What neighbourhoods does Ken Finch serve?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ken serves every major Oakville neighbourhood, including Old Oakville,
                  Bronte, Glen Abbey, River Oaks, West Oak Trails, Eastlake, Morrison,
                  Palermo, Uptown Core, Iroquois Ridge, Sixteen Hollow, and College Park.
                </p>
              </div>
              <div>
                <h3 className="font-headline text-xl font-semibold mb-2">
                  What services does Ken Finch offer?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ken offers a free AI-powered home valuation, detailed Comparative
                  Market Analysis, professional marketing and staging consultation, and
                  full listing representation for Oakville home sellers.
                </p>
              </div>
              <div>
                <h3 className="font-headline text-xl font-semibold mb-2">
                  How can I contact Ken Finch?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Call{' '}
                  <a href="tel:+14165205544" className="text-primary hover:underline">
                    (416) 520-5544
                  </a>
                  , email{' '}
                  <a href="mailto:ken@kenfinch.ca" className="text-primary hover:underline">
                    ken@kenfinch.ca
                  </a>
                  , or use the{' '}
                  <Link href="/contact" className="text-primary hover:underline">
                    contact form
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-16 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="font-headline text-3xl font-bold">
              Thinking about selling in Oakville?
            </h2>
            <p className="text-primary-foreground/80 text-lg">
              Start with a free AI home valuation, or call Ken directly to talk through
              your timeline.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#valuation-tool">
                <Button size="lg" variant="secondary" className="font-semibold shadow-lg">
                  Get Your Free Valuation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="tel:+14165205544">
                <Button size="lg" variant="secondary" className="font-semibold shadow-lg">
                  <Phone className="mr-2 h-4 w-4" />
                  Call (416) 520-5544
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
