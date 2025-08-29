
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { HomeValuation } from '@/components/home-valuation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, BarChart, FileText, Star, Megaphone, Network, Award } from 'lucide-react';
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
    "name": "Ken Finch Real Estate",
    "url": "https://www.kenfinch.ca",
    "logo": "https://www.kenfinch.ca/kf_logo.png",
    "image": "https://www.kenfinch.ca/ken_hero_a.png",
    "telephone": "+1-905-510-3642",
    "email": "ken@kenfinch.ca",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Oakville",
      "addressRegion": "ON",
      "addressCountry": "CA"
    },
    "description": "Ken Finch is a trusted real estate agent in Oakville, Ontario, specializing in helping clients sell their homes quickly and for the best value. Offering expert market analysis, a suite of digital tools, and personalized service.",
    "areaServed": {
      "@type": "Place",
      "name": "Oakville, ON"
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
        <section id="hero" className="w-full py-8 md:py-12 lg:py-16 bg-card">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Unlock Your Oakville Home's True Value
                  </h1>
                </div>
                <div className="grid md:grid-cols-2 gap-8 pt-4">
                    <div className="flex flex-col space-y-4">
                        <h2 className="text-lg font-semibold text-primary">For an Instant Market Snapshot</h2>
                        <p className="text-muted-foreground md:text-base flex-grow">
                          Curious about your home's current standing? Our cutting-edge AI tool provides a quick, data-driven estimate of its market value. It's a fantastic starting point for your research.
                        </p>
                         <Link href="#valuation-tool" className="inline-block">
                            <Button size="lg" className="w-full">AI-Powered Valuation Now</Button>
                        </Link>
                    </div>
                     <div className="flex flex-col space-y-4">
                        <h2 className="text-lg font-semibold text-primary">For a Bespoke, Expert Analysis</h2>
                        <p className="text-muted-foreground md:text-base flex-grow">
                         For a more nuanced and comprehensive valuation, nothing surpasses a personal consultation. Ken Finch offers a confidential, white-glove assessment that considers your home's unique features, recent upgrades, and the market dynamics an algorithm can't see.
                        </p>
                        <Link href="/contact" className="inline-block">
                            <Button size="lg" className="w-full">Schedule Your Private Consultation</Button>
                        </Link>
                    </div>
                </div>
              </div>
              <img
                src="/hero_house.png"
                width="600"
                height="400"
                alt="A beautiful suburban house in Oakville, Ontario at sunset, a prime property for sale."
                data-ai-hint="large house suburb"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <div className="w-full h-8 bg-primary/20" />

        <section id="about" className="w-full py-8 md:py-12 lg:py-16">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 md:grid-cols-2 md:gap-16">
              <div>
                <img
                  src="/ken_hero_a.png"
                  width="525"
                  height="700"
                  alt="Ken Finch, a professional and friendly real estate agent in Oakville, Ontario."
                  data-ai-hint="realtor portrait"
                  className="mx-auto aspect-[3/4] overflow-hidden rounded-xl object-cover"
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="space-y-4">
                  <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">Why Sellers in Oakville Choose Ken Finch</h2>
                  <p className="text-lg font-semibold text-primary">Your Oakville Real Estate Expert for Fast, Confident Home Sales</p>
                  <p className="text-muted-foreground">
                   Sell Smarter. Sell Faster. With a realtor who truly knows the Oakville market. I’ve been helping families sell their homes in this community for years. I understand the nuances of each neighborhood, the right timing, and how to make your home stand out to attract the perfect buyer. My approach is hands-on and tailored to get you the best possible price.
                  </p>
                  <p className="text-muted-foreground">
                    Every property I list is presented with professional photography, drone video, and sharp marketing that reaches qualified buyers online and within the community. In a market where most buyers start their search online, I ensure your home makes an exceptional first impression.
                  </p>
                  <p className="text-muted-foreground">
                    My clients trust me to deliver results. I provide data-driven pricing strategies, strong negotiation, and a personal commitment to a smooth process. Backed by Royal LePage Signature Realty, I offer a blend of proven tactics and modern tools designed to get your home sold.
                  </p>
                   <Link href="/contact" className="inline-block pt-4">
                    <Button size="lg">Contact Ken</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <div className="w-full h-8 bg-primary/20" />

        <section id="features" className="w-full py-8 md:py-12 lg:py-16">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Our Services</div>
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">A Premium Selling Experience</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We provide a comprehensive suite of tools and services to ensure your property stands out and sells for its maximum value in the Oakville market.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              <Card>
                <CardHeader>
                  <BarChart className="h-8 w-8 text-primary" />
                  <CardTitle className="font-headline pt-4">AI Home Value Tool</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Get a data-driven, real-time valuation of your home, complete with a confidence score based on the latest Oakville market trends.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CheckCircle className="h-8 w-8 text-primary" />
                  <CardTitle className="font-headline pt-4">Seller Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Stay informed with a personalized dashboard to track listing prep, photo shoots, open houses, and more.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <FileText className="h-8 w-8 text-primary" />
                  <CardTitle className="font-headline pt-4">Secure Document Hub</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Access all your important files, from staging guides to closing documents, in one secure, centralized location.</p>
                </CardContent>
              </Card>
               <Card>
                <CardHeader>
                  <Megaphone className="h-8 w-8 text-primary" />
                  <CardTitle className="font-headline pt-4">Targeted Digital Marketing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Your home will be showcased with professional photography, video tours, and strategic social media campaigns to reach qualified buyers.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Network className="h-8 w-8 text-primary" />
                  <CardTitle className="font-headline pt-4">Exclusive Buyer Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">With over 20 years of experience, Ken leverages a vast network of contacts and word-of-mouth referrals to connect with exclusive buyers.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Award className="h-8 w-8 text-primary" />
                  <CardTitle className="font-headline pt-4">Masterful Negotiation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Rely on decades of experience to navigate offers and secure the best possible price and terms for your home sale.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="testimonials" className="w-full py-8 md:py-12 lg:py-16 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">What Our Clients Say</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Hear from satisfied sellers who have partnered with Ken Finch in Oakville.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-1 md:gap-12 lg:grid-cols-2 lg:max-w-none mt-12">
              <Card>
                <CardContent className="p-6 grid gap-6 md:grid-cols-[120px_1fr] items-start">
                    <img
                        src="/wei_linda_sold.png"
                        width="120"
                        height="120"
                        alt="Happy clients Wei and Linda who sold their home with Ken Finch"
                        className="rounded-full aspect-square object-cover"
                    />
                    <div className="grid gap-2">
                        <div className="flex items-center gap-1 text-primary">
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                        </div>
                        <blockquote className="text-base text-muted-foreground">
                            “Ken really knew the market and had a smart game plan from day one. Thanks to his marketing and advice, we got multiple offers within days—and ended up selling for more than we expected. He was professional, easy to work with, and kept things moving fast.”
                        </blockquote>
                         <p className="font-semibold text-right w-full">— Wei and Linda</p>
                    </div>
                </CardContent>
              </Card>
              <Card>
                 <CardContent className="p-6 grid gap-6 md:grid-cols-[120px_1fr] items-start">
                    <img
                        src="/trisha_ben.png"
                        width="120"
                        height="120"
                        alt="Happy clients Trisha and Ben who sold their home with Ken Finch"
                        className="rounded-full aspect-square object-cover"
                    />
                    <div className="grid gap-2">
                        <div className="flex items-center gap-1 text-primary">
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                            <Star className="h-5 w-5 fill-current" />
                        </div>
                        <blockquote className="text-base text-muted-foreground">
                            “Ken’s marketing, especially the photography and drone footage made our home shine. He expertly handled multiple offers and and secured a price well above our expectations, all within a week. We’re now settled in our dream home, and we’d confidently recommend Ken to anyone buying or selling.”
                        </blockquote>
                        <p className="font-semibold text-right w-full">- Trisha & Ben</p>
                    </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="valuation-tool" className="w-full py-8 md:py-12 lg:py-16 bg-card">
          <div className="container px-4 md:px-6">
             <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                    <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">AI Home Valuator</h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Fill in your property's details below to receive an instant, AI-powered valuation estimate for your Oakville home.
                    </p>
                </div>
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
