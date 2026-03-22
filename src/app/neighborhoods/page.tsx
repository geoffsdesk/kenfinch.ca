import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { neighborhoods } from '@/lib/neighborhoods';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home, MapPin, TrendingUp, Star } from 'lucide-react';

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
        {/* Hero with map background */}
        <section className="relative bg-secondary/30 py-16 md:py-24 overflow-hidden">
          <div className="container mx-auto max-w-5xl px-4 text-center relative z-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              Oakville Neighborhood Guides
            </p>
            <h1 className="font-heading text-4xl font-bold md:text-5xl">
              Know Your Neighborhood. Sell With Confidence.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Every Oakville neighborhood has its own story, buyer profile, and pricing dynamics.
              Understanding yours is the first step to a faster sale at the best possible price.
            </p>

            {/* Stats bar */}
            <div className="flex flex-wrap justify-center gap-8 mt-8 pt-8 border-t border-border/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary font-headline">{neighborhoods.length}</p>
                <p className="text-xs text-muted-foreground">Neighborhoods</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary font-headline">20+</p>
                <p className="text-xs text-muted-foreground">Years Local Experience</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary font-headline">500+</p>
                <p className="text-xs text-muted-foreground">Homes Sold</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">5-Star Service</p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Map Section */}
        <section className="container mx-auto max-w-6xl px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="font-heading text-2xl font-bold">Explore Oakville</h2>
            <p className="text-sm text-muted-foreground mt-2">Click a neighborhood below or browse the map</p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg border h-[350px] md:h-[400px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d46208.69021862645!2d-79.6877!3d43.4500!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sca!4v1711000000000!5m2!1sen!2sca"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Oakville neighborhoods map"
            />
          </div>
        </section>

        {/* Neighborhood Grid — visual cards */}
        <section className="container mx-auto max-w-6xl px-4 pb-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {neighborhoods.map((n, idx) => (
              <Link key={n.slug} href={`/neighborhoods/${n.slug}`} className="group">
                <Card className="h-full transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 overflow-hidden">
                  {/* Neighbourhood photo */}
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={n.image}
                      alt={`${n.name}, Oakville`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {/* Neighbourhood name overlay */}
                    <div className="absolute bottom-3 left-4">
                      <p className="text-lg font-bold font-headline text-white drop-shadow-md">{n.name}</p>
                    </div>
                    {/* Price badge */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-3 w-3 text-primary" />
                        <span className="text-xs font-bold text-primary">{n.avgPrice}</span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="pt-4 pb-3">
                    <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
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
                  <CardFooter className="pt-0">
                    <span className="flex items-center gap-1 text-sm font-medium text-primary transition-colors group-hover:text-primary/80">
                      View Selling Guide <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
