
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { HomeValuation } from '@/components/home-valuation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, BarChart, FileText, Star, Megaphone, Network, Award, ArrowRight, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sell Your Home in Oakville | Ken Finch Real Estate',
    description: 'Partner with Ken Finch, your trusted Oakville real estate agent, for a seamless and successful home selling experience. Get an AI-powered home valuation and expert market analysis for your Oakville property.',
    keywords: ['sell home Oakville', 'Oakville real estate agent', 'home valuation Oakville', 'Ken Finch realtor', 'real estate listings Oakville'],
};


export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Ken Finch, Broker",
    "url": "https://www.kenfinch.ca",
    "logo": "https://www.kenfinch.ca/kf_logo.png",
    "image": "https://www.kenfinch.ca/ken_headshot_professional.jpg",
    "telephone": "+1-905-510-3642",
    "email": "ken@kenfinch.ca",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Oakville",
      "addressRegion": "ON",
      "addressCountry": "CA"
    },
    "description": "Ken Finch is a real estate Broker with Royal LePage Signature Realty, Brokerage, specializing in helping clients sell their homes in Oakville, Ontario. Offering expert market analysis, digital marketing tools, and personalized service.",
    "areaServed": {
      "@type": "Place",
      "name": "Oakville, ON"
    },
    "memberOf": {
      "@type": "Organization",
      "name": "Royal LePage Signature Realty, Brokerage"
    },
    "priceRange" : "$$$"
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />
      <main className="flex-1">
        {/* Hero Section - Full-width, immersive */}
        <section id="hero" className="relative w-full py-16 md:py-24 lg:py-32 bg-card hero-gradient overflow-hidden">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[1fr_500px] lg:gap-16 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-6 animate-fade-in-up">
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-widest text-primary animate-fade-in-up">Oakville&apos;s Trusted Real Estate Expert</p>
                  <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl xl:text-7xl/none">
                    Unlock Your Home&apos;s <span className="text-gradient">True Value</span>
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-[540px] animate-fade-in-up animate-delay-100">
                    Data-driven pricing. Professional marketing. Masterful negotiation. Everything you need to sell your Oakville home for top dollar.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-2 animate-fade-in-up animate-delay-200">
                  <Link href="#valuation-tool">
                    <Button size="lg" className="text-base px-8 py-6 shadow-lg shadow-primary/20">
                      Get Your Free AI Valuation
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline" className="text-base px-8 py-6">
                      <Phone className="mr-2 h-5 w-5" />
                      Schedule a Consultation
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-6 pt-4 animate-fade-in-up animate-delay-300">
                  <div className="flex items-center gap-1 text-primary">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <p className="text-sm text-muted-foreground">Trusted by Oakville families for 20+ years</p>
                </div>
              </div>
              <div className="animate-fade-in-up animate-delay-200">
                <img
                  src="/hero_sold.jpg"
                  width="600"
                  height="400"
                  alt="Beautiful Oakville home with SOLD by Ken Finch sign at golden hour, Royal LePage"
                  className="mx-auto aspect-video overflow-hidden rounded-2xl object-cover sm:w-full lg:order-last shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Gold divider */}
        <div className="gold-divider w-full" />

        {/* Quick stats bar */}
        <section className="w-full py-8 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-3xl font-bold font-headline text-primary">20+</p>
                <p className="text-sm text-muted-foreground mt-1">Years Experience</p>
              </div>
              <div>
                <p className="text-3xl font-bold font-headline text-primary">#1</p>
                <p className="text-sm text-muted-foreground mt-1">Oakville Specialist</p>
              </div>
              <div>
                <p className="text-3xl font-bold font-headline text-primary">5&#11088;</p>
                <p className="text-sm text-muted-foreground mt-1">Client Reviews</p>
              </div>
              <div>
                <p className="text-3xl font-bold font-headline text-primary">10</p>
                <p className="text-sm text-muted-foreground mt-1">Oakville Neighborhoods</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Ken Section */}
        <section id="about" className="w-full py-16 md:py-24 lg:py-28">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 md:grid-cols-2 md:gap-20 items-center">
              <div className="space-y-4">
                <img
                  src="/ken_headshot_professional.jpg"
                  width="525"
                  height="700"
                  alt="Ken Finch, a professional and friendly real estate agent in Oakville, Ontario."
                  className="mx-auto aspect-[3/4] overflow-hidden rounded-2xl object-cover shadow-xl"
                />
                <div className="grid grid-cols-2 gap-3">
                  <img
                    src="/ken_with_client.jpg"
                    alt="Ken Finch with happy clients in front of a SOLD sign"
                    className="rounded-xl object-cover aspect-[4/3] w-full shadow-md"
                  />
                  <img
                    src="/ken_community.jpg"
                    alt="Ken Finch at the Oakville Farmers Market"
                    className="rounded-xl object-cover aspect-[4/3] w-full shadow-md"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="space-y-6">
                  <p className="text-sm font-semibold uppercase tracking-widest text-primary">About Your Broker</p>
                  <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Why Sellers Choose Ken Finch</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                   Sell smarter. Sell faster. With a broker who truly knows Oakville. I&apos;ve been helping families sell their homes in this community for over two decades. I understand the nuances of each neighborhood, the right timing, and how to make your home stand out.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Every property I list is presented with professional photography, drone video, and sharp marketing that reaches qualified buyers online and within the community. My clients trust me to deliver results with data-driven pricing, strong negotiation, and a personal commitment to a smooth process.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Link href="/contact">
                      <Button size="lg" className="px-8">
                        Contact Ken
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/neighborhoods">
                      <Button size="lg" variant="outline" className="px-8">
                        <MapPin className="mr-2 h-4 w-4" />
                        Explore Neighborhoods
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="gold-divider w-full" />

        {/* Services Section */}
        <section id="features" className="w-full py-16 md:py-24 lg:py-28">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Our Services</p>
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">A Premium Selling Experience</h2>
              <p className="text-lg text-muted-foreground">
                A comprehensive suite of tools and services to ensure your property stands out and sells for its maximum value.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-none mt-16">
              <Card className="card-hover border-0 shadow-md">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <BarChart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl">AI Home Value Tool</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">Get a data-driven, real-time valuation of your home, complete with a confidence score based on the latest Oakville market trends.</p>
                </CardContent>
              </Card>
              <Card className="card-hover border-0 shadow-md">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl">Dedicated Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">From listing prep to closing day, Ken personally guides you through every step of the selling process.</p>
                </CardContent>
              </Card>
              <Card className="card-hover border-0 shadow-md">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl">Secure Document Hub</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">Access all your important files, from staging guides to closing documents, in one secure, centralized location.</p>
                </CardContent>
              </Card>
              <Card className="card-hover border-0 shadow-md">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Megaphone className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl">Targeted Digital Marketing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">Your home showcased with professional photography, video tours, and strategic social media campaigns to reach qualified buyers.</p>
                </CardContent>
              </Card>
              <Card className="card-hover border-0 shadow-md">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Network className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl">Exclusive Buyer Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">Ken leverages a vast network of contacts and word-of-mouth referrals to connect with exclusive, qualified buyers.</p>
                </CardContent>
              </Card>
              <Card className="card-hover border-0 shadow-md">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl">Masterful Negotiation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">Rely on decades of experience to navigate offers and secure the best possible price and terms for your home sale.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Full-width image band — social proof */}
        <section className="w-full">
          <div className="grid md:grid-cols-3 gap-0">
            <div className="relative h-48 md:h-64 overflow-hidden">
              <img src="/hero_oakville_aerial.jpg" alt="Aerial view of Oakville waterfront at sunset" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <p className="text-white font-headline text-xl font-bold drop-shadow-lg">Oakville&apos;s Waterfront</p>
              </div>
            </div>
            <div className="relative h-48 md:h-64 overflow-hidden">
              <img src="/ken_at_open_house.jpg" alt="Ken Finch hosting an open house" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <p className="text-white font-headline text-xl font-bold drop-shadow-lg">Open House Expert</p>
              </div>
            </div>
            <div className="relative h-48 md:h-64 overflow-hidden">
              <img src="/hero_family_moving.jpg" alt="Happy family celebrating their home sale with Ken Finch" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <p className="text-white font-headline text-xl font-bold drop-shadow-lg">Happy Families</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-16 md:py-24 lg:py-28 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Testimonials</p>
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">What Our Clients Say</h2>
              <p className="text-lg text-muted-foreground">
                Hear from satisfied sellers who have partnered with Ken Finch in Oakville.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-1 lg:grid-cols-2 lg:max-w-none mt-16">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 grid gap-6 md:grid-cols-[120px_1fr] items-start">
                    <img
                        src="/wei_linda_sold.png"
                        width="120"
                        height="120"
                        alt="Happy clients Wei and Linda who sold their home with Ken Finch"
                        className="rounded-full aspect-square object-cover ring-4 ring-primary/20"
                    />
                    <div className="grid gap-3">
                        <div className="flex items-center gap-1 text-primary">
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                        </div>
                        <blockquote className="text-base text-muted-foreground leading-relaxed italic">
                            &ldquo;Ken really knew the market and had a smart game plan from day one. Thanks to his marketing and advice, we got multiple offers within days&mdash;and ended up selling for more than we expected. He was professional, easy to work with, and kept things moving fast.&rdquo;
                        </blockquote>
                         <p className="font-semibold text-right w-full">&mdash; Wei and Linda</p>
                    </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                 <CardContent className="p-8 grid gap-6 md:grid-cols-[120px_1fr] items-start">
                    <img
                        src="/trisha_ben.png"
                        width="120"
                        height="120"
                        alt="Happy clients Trisha and Ben who sold their home with Ken Finch"
                        className="rounded-full aspect-square object-cover ring-4 ring-primary/20"
                    />
                    <div className="grid gap-3">
                        <div className="flex items-center gap-1 text-primary">
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                        </div>
                        <blockquote className="text-base text-muted-foreground leading-relaxed italic">
                            &ldquo;Ken&apos;s marketing, especially the photography and drone footage made our home shine. He expertly handled multiple offers and secured a price well above our expectations, all within a week. We&apos;d confidently recommend Ken to anyone buying or selling.&rdquo;
                        </blockquote>
                        <p className="font-semibold text-right w-full">&mdash; Trisha &amp; Ben</p>
                    </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Neighborhoods CTA Section */}
        <section className="w-full py-16 md:py-20 bg-card">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-3xl mx-auto">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Local Expertise</p>
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Know Your Oakville Neighborhood</h2>
              <p className="text-lg text-muted-foreground">
                From Old Oakville&apos;s charming streets to West Oak Trails&apos; family-friendly communities, explore market insights for every corner of Oakville.
              </p>
              <Link href="/neighborhoods">
                <Button size="lg" variant="outline" className="text-base px-8 py-6 mt-2">
                  <MapPin className="mr-2 h-5 w-5" />
                  Explore All 10 Neighborhoods
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <div className="gold-divider w-full" />

        {/* Valuation Tool Section */}
        <section id="valuation-tool" className="w-full py-16 md:py-24 lg:py-28 bg-card">
          <div className="container px-4 md:px-6">
             <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">Free Tool</p>
                <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">AI Home Valuator</h2>
                <p className="text-lg text-muted-foreground">
                  Fill in your property&apos;s details below to receive an instant, AI-powered valuation estimate for your Oakville home.
                </p>
            </div>
            <div className="mx-auto max-w-4xl pt-12">
              <HomeValuation />
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
