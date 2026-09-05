import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MortgageDisclosure } from '@/components/mortgage-disclosure';
import { Button } from '@/components/ui/button';
import { CONTACT, MORTGAGE, REAL_ESTATE, SITE_URL } from '@/lib/site';
import { neighborhoods } from '@/lib/neighborhoods';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Phone, MapPin, ArrowRight, Award, Clock, Users, BadgeCheck, Landmark } from 'lucide-react';

export const metadata: Metadata = {
  title: { absolute: 'Meet Ken Finch: Oakville Real Estate Broker & Mortgage Broker' },
  description:
    'Ken Finch is an Oakville, Ontario real estate broker with Royal LePage Signature Realty and a licensed mortgage broker with Canadian Express-Mortgage Inc., helping GTA buyers and sellers since 2004.',
  keywords: [
    'Ken Finch',
    'Oakville real estate broker',
    'Oakville mortgage broker',
    'Royal LePage Oakville',
    'best real estate agent Oakville',
    'Oakville realtor',
    'Halton Region real estate agent',
  ],
  alternates: { canonical: '/about' },
  openGraph: {
    title: { absolute: 'Meet Ken Finch: Oakville Real Estate Broker & Mortgage Broker' },
    description:
      'Licensed real estate broker and licensed mortgage broker serving Oakville and the GTA since 2004.',
    url: `${SITE_URL}/about`,
    type: 'profile',
    images: [`${SITE_URL}/ken_headshot_professional.jpg`],
  },
};

const FAQS = [
  {
    q: 'Who is Ken Finch?',
    a: `Ken Finch is an Oakville, Ontario real estate broker with ${REAL_ESTATE.brokerage} and a licensed mortgage broker with ${MORTGAGE.brokerage} (FSRA Brokerage Licence #${MORTGAGE.brokerageLicence}). Licensed in real estate since 2004, he helps buyers and sellers across Oakville and the Greater Toronto Area.`,
  },
  {
    q: 'Is Ken Finch a mortgage broker as well as a Realtor?',
    a: `Yes. Ken holds both a real estate licence (RECO) and a mortgage licence (FSRA), so he can arrange a buyer's pre-approval and financing through ${MORTGAGE.brokerage} while representing them on the purchase.`,
  },
  {
    q: 'What areas does Ken Finch serve?',
    a: 'Oakville is home base, including Old Oakville, Bronte, Glen Abbey, River Oaks, West Oak Trails, Eastlake, Morrison, Palermo, Uptown Core, Iroquois Ridge, Sixteen Hollow, and College Park. Ken also represents buyers in Burlington, Mississauga, Milton and Toronto, and arranges mortgages anywhere in Ontario.',
  },
  {
    q: 'What services does Ken Finch offer?',
    a: 'Buyer representation, mortgage pre-approvals and financing (purchases, refinances, renewals), a free AI-powered home valuation, comparative market analysis, and full listing representation for sellers.',
  },
  {
    q: 'How can I contact Ken Finch?',
    a: `Call ${CONTACT.phoneDisplay}, email ${CONTACT.email}, or use the pre-approval or contact forms at ${SITE_URL}.`,
  },
];

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/about#person`,
        name: 'Ken Finch',
        jobTitle: ['Real Estate Broker', 'Mortgage Broker'],
        image: `${SITE_URL}/ken_headshot_professional.jpg`,
        url: `${SITE_URL}/about`,
        description: FAQS[0].a,
        worksFor: [
          { '@type': 'Organization', name: REAL_ESTATE.brokerage, url: 'https://www.royallepage.ca/' },
          { '@type': 'Organization', name: MORTGAGE.brokerage },
        ],
        workLocation: { '@type': 'Place', name: 'Oakville, Ontario, Canada' },
        sameAs: [
          'https://www.royallepage.ca/en/agent/ontario/toronto/ken-finch/31668/',
          'https://www.linkedin.com/in/kenfinchrealtor/',
          'https://www.facebook.com/KenFinchRealEstate/',
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
                    alt="Ken Finch, Oakville Real Estate Broker and Mortgage Broker"
                    width={320}
                    height={320}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">About</p>
                <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Meet Ken Finch</h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Ken is one of the few advisors in the GTA licensed on both sides of a home purchase: a real estate broker with{' '}
                  {REAL_ESTATE.brokerage}, and a mortgage broker with {MORTGAGE.brokerage}. Since 2004 he has helped Oakville
                  families buy, finance, and sell homes with one plan instead of three phone numbers.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link href="/mortgage#apply">
                    <Button size="lg" className="shadow-md">
                      Get pre-approved with Ken
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <a href={CONTACT.phoneHref}>
                    <Button size="lg" variant="outline">
                      <Phone className="mr-2 h-4 w-4" />
                      {CONTACT.phoneDisplay}
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick facts */}
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-headline text-3xl font-bold mb-8 text-center">Quick facts</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {[
                  { icon: BadgeCheck, title: 'Real estate', body: `${REAL_ESTATE.title} with ${REAL_ESTATE.brokerage}. Licensed since 2004.` },
                  { icon: Landmark, title: 'Mortgages', body: `${MORTGAGE.title} with ${MORTGAGE.brokerage}, FSRA Brokerage Licence #${MORTGAGE.brokerageLicence}. Access to 30+ lenders.` },
                  { icon: MapPin, title: 'Based in', body: 'Oakville, Ontario. Buyers served across Halton, Peel and Toronto; mortgages province-wide.' },
                  { icon: Clock, title: 'Experience', body: 'Over 20 years of Oakville transactions, from first condos to lakefront estates.' },
                  { icon: Award, title: 'Credentials', body: 'FRI (Fellow of the Real Estate Institute), CPM (Certified Property Manager). Past president of the Real Estate Institute of Canada.' },
                  { icon: Users, title: 'Specialty', body: 'Buyers who want financing and the search handled together; sellers who are buying next.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 p-5 rounded-xl border bg-card">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why both licences */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div className="space-y-4">
                <h2 className="font-headline text-3xl font-bold">Why Ken added the mortgage licence</h2>
                <p className="text-muted-foreground leading-relaxed">
                  After two decades of watching good buyers lose homes to financing conditions that fell through, or overpay
                  because their bank&apos;s pre-approval was a guess, Ken decided the fix was to own both halves of the
                  transaction. Today his buyers know their real budget before the first showing, and their offers are written by
                  someone who knows exactly what the lender will ask for.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  If you are selling and buying at the same time, that also means bridge financing, closing dates and deposits
                  are planned together rather than discovered on closing week.
                </p>
              </div>
              <img
                src="/ken_with_client.jpg"
                alt="Ken Finch with happy clients"
                className="rounded-2xl object-cover aspect-[4/3] w-full shadow-md"
                width="600"
                height="450"
              />
            </div>
          </div>
        </section>

        {/* Neighbourhoods */}
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            <h2 className="font-headline text-3xl font-bold mb-4 text-center">Oakville neighbourhoods Ken knows street by street</h2>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              Each guide covers price ranges, schools, commute, and who the neighbourhood suits best.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {neighborhoods.map((n) => (
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

        {/* FAQ */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container px-4 md:px-6 max-w-3xl mx-auto">
            <h2 className="font-headline text-3xl font-bold mb-8 text-center">Frequently asked questions</h2>
            <div className="space-y-6">
              {FAQS.map((f) => (
                <div key={f.q}>
                  <h3 className="font-headline text-xl font-semibold mb-2">{f.q}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-16 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="font-headline text-3xl font-bold">Buying in Oakville or the GTA?</h2>
            <p className="text-primary-foreground/85 text-lg">Start with the two-minute pre-approval check, or call Ken directly.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/mortgage#apply">
                <Button size="lg" variant="secondary" className="font-semibold shadow-lg">
                  Get pre-approved
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href={CONTACT.phoneHref}>
                <Button size="lg" variant="secondary" className="font-semibold shadow-lg">
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
