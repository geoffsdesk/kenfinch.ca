import type { Metadata } from 'next';
import Link from 'next/link';
import { neighborhoods } from '@/lib/neighborhoods';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Oakville Neighborhoods Guide — Sell Your Home With Confidence',
  description:
    'Explore Oakville\'s top neighborhoods with expert insights on home values, market trends, and selling strategies. Find your neighborhood and get a free home valuation from Ken Finch.',
  keywords: [
    'Oakville neighborhoods',
    'sell home Oakville',
    'Old Oakville real estate',
    'Bronte homes for sale',
    'Glen Abbey real estate',
    'River Oaks Oakville',
    'Oakville home values',
  ],
};

export default function NeighborhoodsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-secondary/30 py-16 md:py-24">
          <div className="container mx-auto max-w-5xl px-4 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Oakville Neighborhood Guides
            </p>
            <h1 className="font-heading text-4xl font-bold md:text-5xl">
              Know Your Neighborhood. Sell With Confidence.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Every Oakville neighborhood has its own story, buyer profile, and pricing dynamics.
              Understanding yours is the first step to a faster sale at the best possible price.
            </p>
          </div>
        </section>

        {/* Neighborhood Grid */}
        <section className="container mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {neighborhoods.map((n) => (
              <Link key={n.slug} href={`/neighborhoods/${n.slug}`} className="group">
                <Card className="h-full transition-shadow duration-200 group-hover:shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="mb-2 flex items-center gap-2 text-primary">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">{n.avgPrice} avg</span>
                    </div>
                    <CardTitle className="font-heading text-xl">{n.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {n.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {n.homeTypes.slice(0, 3).map((type) => (
                        <span
                          key={type}
                          className="inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <span className="flex items-center gap-1 text-sm font-medium text-primary transition-colors group-hover:text-primary/80">
                      View Selling Guide <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary/5 py-16">
          <div className="container mx-auto max-w-3xl px-4 text-center">
            <Home className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h2 className="font-heading text-3xl font-bold">
              Not Sure What Your Home Is Worth?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Try our AI-powered home valuation tool for a free, instant estimate based on the
              latest Oakville market data — or schedule a private consultation with Ken.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/#valuation">Get Your Free Valuation</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Talk to Ken</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
