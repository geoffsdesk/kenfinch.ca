
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { HomeValuation } from '@/components/home-valuation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, BarChart, FileText, Star, Megaphone, Network, Award } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Your Trusted Oakville Real Estate Partner',
    description: 'Unlock your Oakville home\'s true value with Ken Finch. Get a free, AI-powered home valuation and experience a seamless, successful home selling process.',
    keywords: ['Oakville real estate', 'sell home Oakville', 'Ken Finch realtor', 'home valuation Oakville', 'Westoak Trails real estate'],
};


export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section id="hero" className="w-full py-8 md:py-12 lg:py-16 bg-card">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Unlock Your Oakville Home's True Value
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Partner with Ken Finch for a seamless, successful home selling experience in Oakville. Get started with a free, AI-powered home valuation today.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                   <Link href="#valuation-tool" className="inline-block">
                    <Button size="lg">Get Free Valuation</Button>
                  </Link>
                </div>
              </div>
              <img
                src="/hero_house.png"
                width="600"
                height="400"
                alt="A beautiful suburban house in Oakville at sunset"
                data-ai-hint="large house suburb"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <div className="w-full h-8 bg-secondary" />

        <section id="about" className="w-full py-8 md:py-12 lg:py-16">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 md:grid-cols-2 md:gap-16">
              <div>
                <img
                  src="/brick.jpg"
                  width="600"
                  height="700"
                  alt="Ken Finch, an Oakville real estate agent"
                  data-ai-hint="realtor portrait"
                  className="mx-auto aspect-[3/4] overflow-hidden rounded-xl object-cover"
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="space-y-4">
                  <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">Why Sellers Choose Ken Finch</h2>
                  <p className="text-lg font-semibold text-primary">Your Westoak Trails Expert for Fast, Confident Home Sales</p>
                  <p className="text-muted-foreground">
                   Sell Smarter. Sell Faster. With Someone Who Knows Oakville. I’ve been helping families sell in Oakville—especially in Westoak Trails—for years. I know the streets, the buyers, the timing, and what makes a home stand out in this market. My approach is hands-on and tailored to get your home sold quickly and for the best possible price.
                  </p>
                  <p className="text-muted-foreground">
                    Every property I list is presented with care. That means professional photos, drone video, and sharp marketing that reaches the right buyers, online and in the community. With most buyers starting their search on the web, I make sure your home is front and center from the start.
                  </p>
                  <p className="text-muted-foreground">
                    Clients come to me for results. I bring pricing strategies that match the market, strong negotiations, and a personal commitment to making the process smooth. Backed by my team at Royal LePage Signature Realty, I offer a balance of proven tactics and modern tools that get homes sold. Whether you're moving up, moving on, or just starting to plan, I'm here to help you take that next step with confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-8 md:py-12 lg:py-16">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Our Services</div>
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">A Premium Selling Experience</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We provide a comprehensive suite of tools and services to ensure your property stands out and sells for its maximum value.
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
                  Hear from satisfied sellers who have partnered with Ken Finch.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-1 md:gap-12 lg:grid-cols-2 lg:max-w-none mt-12">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 text-primary mb-2">
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                  </div>
                  <blockquote className="text-lg text-muted-foreground">
                    “Ken really knew the market and had a smart game plan from day one. Thanks to his marketing and advice, we got multiple offers within days—and ended up selling for more than we expected. He was professional, easy to work with, and kept things moving fast.”
                  </blockquote>
                </CardContent>
                <CardFooter>
                    <p className="font-semibold text-right w-full">— Peter & Elizabeth</p>
                </CardFooter>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 text-primary mb-2">
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                  </div>
                  <blockquote className="text-lg text-muted-foreground">
                    “Ken’s marketing, especially the photography and drone footage made our home shine. He expertly handled multiple offers and and secured a price well above our expectations, all within a week. We’re now settled in our dream home, and we’d confidently recommend Ken to anyone buying or selling.”
                  </blockquote>
                </CardContent>
                <CardFooter>
                    <p className="font-semibold text-right w-full">- Trisha & Ben</p>
                </CardFooter>
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
                    Fill in your property's details below to receive an instant, AI-powered valuation estimate.
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
