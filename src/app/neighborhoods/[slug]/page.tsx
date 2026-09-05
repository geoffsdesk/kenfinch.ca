import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { neighborhoods } from '@/lib/neighborhoods';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { BuyerLeadForm } from '@/components/buyer-lead-form';
import { MortgageDisclosure } from '@/components/mortgage-disclosure';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SITE_URL } from '@/lib/site';
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Home,
  MapPin,
  TrendingUp,
  Lightbulb,
  Building2,
  TreePine,
  Train,
  Users,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return neighborhoods.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const neighborhood = neighborhoods.find((n) => n.slug === slug);
  if (!neighborhood) return {};

  const canonicalPath = `/neighborhoods/${slug}`;
  return {
    title: `Buying a Home in ${neighborhood.name}, Oakville`,
    description: `Buyer's guide to ${neighborhood.name}, Oakville: homes from ${neighborhood.priceRange.split(' ')[0]}, schools, commute, and Ken Finch's buying tip. ${neighborhood.description.slice(0, 110)}...`,
    keywords: [
      `${neighborhood.name} Oakville`,
      `homes for sale ${neighborhood.name}`,
      `buy home ${neighborhood.name} Oakville`,
      `${neighborhood.name} real estate`,
      `${neighborhood.name} schools`,
      'Oakville buyer agent',
      'Ken Finch realtor',
    ],
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: neighborhood.headline,
      description: neighborhood.description.slice(0, 200),
      type: 'article',
      url: `${SITE_URL}${canonicalPath}`,
      images: [`${SITE_URL}${neighborhood.image}`],
    },
  };
}

export default async function NeighborhoodPage({ params }: PageProps) {
  const { slug } = await params;
  const neighborhood = neighborhoods.find((n) => n.slug === slug);
  if (!neighborhood) notFound();

  const canonicalUrl = `${SITE_URL}/neighborhoods/${neighborhood.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Place',
        name: `${neighborhood.name}, Oakville, Ontario`,
        description: neighborhood.description,
        url: canonicalUrl,
        image: `${SITE_URL}${neighborhood.image}`,
        containedInPlace: { '@type': 'City', name: 'Oakville' },
      },
      {
        '@type': 'RealEstateAgent',
        '@id': `${SITE_URL}/#agent`,
        name: 'Ken Finch, Broker',
        url: canonicalUrl,
        areaServed: { '@type': 'Place', name: `${neighborhood.name}, Oakville, Ontario` },
        priceRange: neighborhood.priceRange,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Neighbourhoods', item: `${SITE_URL}/neighborhoods` },
          { '@type': 'ListItem', position: 3, name: neighborhood.name, item: canonicalUrl },
        ],
      },
    ],
  };

  const others = neighborhoods.filter((n) => n.slug !== neighborhood.slug).slice(0, 4);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative h-72 md:h-96 lg:h-[28rem] overflow-hidden">
          <Image src={neighborhood.image} alt={`${neighborhood.name}, Oakville`} fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="container mx-auto max-w-4xl">
              <Link href="/neighborhoods" className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/80 transition-colors hover:text-white">
                <ArrowLeft className="h-3.5 w-3.5" />
                All Neighbourhoods
              </Link>
              <div className="flex items-center gap-2 text-primary">
                <MapPin className="h-5 w-5" />
                <span className="text-sm font-medium uppercase tracking-wider">{neighborhood.name}, Oakville</span>
              </div>
              <h1 className="mt-2 font-headline text-3xl font-bold text-white md:text-4xl lg:text-5xl drop-shadow-md">{neighborhood.headline}</h1>
            </div>
          </div>
        </section>

        {/* Description + best for */}
        <section className="container mx-auto max-w-4xl px-4 py-10">
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">{neighborhood.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {neighborhood.bestFor.map((b) => (
              <span key={b} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                <Users className="h-3.5 w-3.5" />
                {b}
              </span>
            ))}
          </div>
        </section>

        {/* Market snapshot */}
        <section className="container mx-auto max-w-4xl px-4 pb-12">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-3 pt-6">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Average Price</p>
                  <p className="text-2xl font-bold">{neighborhood.avgPrice}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 pt-6">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Price Range</p>
                  <p className="text-xl font-bold">{neighborhood.priceRange}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 pt-6">
                <Home className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Home Types</p>
                  <p className="text-sm font-medium">{neighborhood.homeTypes.join(', ')}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 pt-6">
                <Train className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Commute</p>
                  <p className="text-sm font-medium">{neighborhood.commute}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Prices are approximate neighbourhood averages and change with the market. Ask Ken for current comparable sales.
          </p>
        </section>

        {/* Highlights */}
        <section className="container mx-auto max-w-4xl px-4 pb-12">
          <h2 className="font-headline text-2xl font-bold">What makes {neighborhood.name} special</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {neighborhood.highlights.map((highlight, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border p-4">
                <TreePine className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <p className="text-sm">{highlight}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Schools + amenities */}
        <section className="bg-secondary/20 py-12">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h2 className="font-headline text-2xl font-bold">Schools</h2>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {neighborhood.schools.map((school) => (
                <span key={school} className="rounded-full border bg-background px-3 py-1.5 text-sm">{school}</span>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">School boundaries change. Ken verifies the current catchment for any specific address before you offer.</p>

            <h3 className="mt-8 font-headline text-lg font-semibold">Nearby amenities</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {neighborhood.nearbyAmenities.map((amenity) => (
                <span key={amenity} className="rounded-full border bg-background px-3 py-1.5 text-sm">{amenity}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Buyer insight */}
        <section className="container mx-auto max-w-4xl px-4 py-12">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <CardTitle className="font-headline text-xl">Ken&apos;s buying tip for {neighborhood.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">{neighborhood.buyerInsight}</p>
            </CardContent>
          </Card>
        </section>

        {/* Pre-approval CTA + form */}
        <section id="pre-approval" className="border-t bg-secondary/30 py-16 scroll-mt-20">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] items-start">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">Buying in {neighborhood.name}?</p>
                <h2 className="font-headline text-3xl font-bold">See what your budget buys here, before you tour.</h2>
                <p className="text-muted-foreground">
                  Homes in {neighborhood.name} range from {neighborhood.priceRange}. Ken, a licensed mortgage broker as well as your
                  buyer agent, will tell you where you land in that range and what it takes to win an offer here.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href="/contact">
                    <Button variant="outline" size="lg">Book a showing with Ken</Button>
                  </Link>
                  <Link href="/sell#valuation-tool">
                    <Button variant="ghost" size="lg">Selling in {neighborhood.name}? <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </Link>
                </div>
              </div>
              <BuyerLeadForm source={`neighbourhood:${neighborhood.slug}`} compact />
            </div>
          </div>
        </section>

        {/* Other neighbourhoods */}
        <section className="container mx-auto max-w-4xl px-4 py-12">
          <h2 className="font-headline text-2xl font-bold mb-6">Compare with nearby neighbourhoods</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {others.map((n) => (
              <Link key={n.slug} href={`/neighborhoods/${n.slug}`} className="rounded-xl border bg-card p-4 hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <p className="font-semibold">{n.name}</p>
                <p className="text-xs text-muted-foreground mt-1">Avg {n.avgPrice}</p>
              </Link>
            ))}
          </div>
          <MortgageDisclosure className="mt-10" />
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </main>
      <Footer />
    </>
  );
}
