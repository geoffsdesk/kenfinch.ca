import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { neighborhoods } from '@/lib/neighborhoods';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  GraduationCap,
  Home,
  MapPin,
  TrendingUp,
  Lightbulb,
  Building2,
  TreePine,
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

  return {
    title: `Sell Your Home in ${neighborhood.name} | Ken Finch Real Estate`,
    description: `Expert guide to selling your home in ${neighborhood.name}, Oakville. Average home price: ${neighborhood.avgPrice}. ${neighborhood.description.slice(0, 120)}...`,
    keywords: [
      `${neighborhood.name} Oakville`,
      `sell home ${neighborhood.name}`,
      `${neighborhood.name} home values`,
      `${neighborhood.name} real estate agent`,
      'Oakville real estate',
      'Ken Finch realtor',
    ],
    openGraph: {
      title: neighborhood.headline,
      description: neighborhood.description.slice(0, 200),
      type: 'article',
    },
  };
}

export default async function NeighborhoodPage({ params }: PageProps) {
  const { slug } = await params;
  const neighborhood = neighborhoods.find((n) => n.slug === slug);

  if (!neighborhood) {
    notFound();
  }

  // JSON-LD structured data for this neighborhood
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Ken Finch - Royal LePage',
    url: `https://www.kenfinch.ca/neighborhoods/${neighborhood.slug}`,
    description: neighborhood.description,
    areaServed: {
      '@type': 'Place',
      name: `${neighborhood.name}, Oakville, Ontario`,
    },
    priceRange: neighborhood.priceRange,
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Image */}
        <section className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
          <Image
            src={neighborhood.image}
            alt={`${neighborhood.name}, Oakville`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="container mx-auto max-w-4xl">
              <Link
                href="/neighborhoods"
                className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/80 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                All Neighborhoods
              </Link>
              <div className="flex items-center gap-2 text-primary">
                <MapPin className="h-5 w-5" />
                <span className="text-sm font-medium uppercase tracking-wider">
                  {neighborhood.name}, Oakville
                </span>
              </div>
              <h1 className="mt-2 font-heading text-3xl font-bold text-white md:text-4xl lg:text-5xl drop-shadow-md">
                {neighborhood.headline}
              </h1>
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="container mx-auto max-w-4xl px-4 py-8">
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
            {neighborhood.description}
          </p>
        </section>

        {/* Market Snapshot */}
        <section className="container mx-auto max-w-4xl px-4 py-12">
          <div className="grid gap-4 sm:grid-cols-3">
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
                  <p className="text-2xl font-bold">{neighborhood.priceRange}</p>
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
          </div>
        </section>

        {/* Highlights */}
        <section className="container mx-auto max-w-4xl px-4 pb-12">
          <h2 className="font-heading text-2xl font-bold">
            What Makes {neighborhood.name} Special
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {neighborhood.highlights.map((highlight, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border p-4">
                <TreePine className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <p className="text-sm">{highlight}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Schools */}
        <section className="bg-secondary/20 py-12">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h2 className="font-heading text-2xl font-bold">Schools</h2>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {neighborhood.schools.map((school) => (
                <span
                  key={school}
                  className="rounded-full border bg-background px-3 py-1.5 text-sm"
                >
                  {school}
                </span>
              ))}
            </div>

            <h3 className="mt-8 font-heading text-lg font-semibold">Nearby Amenities</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {neighborhood.nearbyAmenities.map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full border bg-background px-3 py-1.5 text-sm"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Seller Insight */}
        <section className="container mx-auto max-w-4xl px-4 py-12">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <CardTitle className="font-heading text-xl">
                  Ken&apos;s Selling Tip for {neighborhood.name}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">
                {neighborhood.sellerInsight}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="border-t bg-secondary/30 py-16">
          <div className="container mx-auto max-w-3xl px-4 text-center">
            <h2 className="font-heading text-3xl font-bold">
              Ready to Sell in {neighborhood.name}?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Get a free AI-powered valuation for your {neighborhood.name} home, or schedule a
              private consultation with Ken to discuss your selling strategy.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/#valuation">Get Your Free Valuation</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Schedule a Consultation</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </main>
      <Footer />
    </>
  );
}
