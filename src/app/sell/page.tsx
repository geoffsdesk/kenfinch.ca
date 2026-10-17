import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { HomeValuation } from '@/components/home-valuation';
import { NeverListCapture } from '@/components/never-list-capture';
import { CheckCircle, Phone, ArrowRight, Star, Shield, Clock, ListChecks } from 'lucide-react';
import Image from 'next/image';
import type { Metadata } from 'next';
import { CONTACT, REAL_ESTATE } from '@/lib/site';
import { SELLER_NEVER_LIST } from '@/lib/never-lists';

export const metadata: Metadata = {
  title: 'Free Oakville Home Valuation',
  description: 'Get a free, instant AI-powered home valuation for your Oakville property. See what your home is worth in today\'s market. No obligation.',
  keywords: ['home valuation Oakville', 'what is my home worth', 'sell home Oakville', 'Oakville house value', 'free home appraisal Oakville'],
  alternates: { canonical: '/sell' },
  openGraph: {
    title: 'Free Oakville Home Valuation | Ken Finch',
    description: 'Get a free, instant AI-powered home valuation for your Oakville property.',
    url: 'https://www.kenfinch.ca/sell',
  },
};

const WHATSAPP_HREF = `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(
  "Hi Ken, I saw your video on KenFinch.ca. I'm thinking about selling. Please send me your complete list of things you'd never do when selling your own home.",
)}`;

export default function SellLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero — single focus: get the valuation */}
        <section className="relative w-full py-12 md:py-16 lg:py-20 hero-gradient overflow-hidden">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-start">
              {/* Left — headline + trust signals */}
              <div className="flex flex-col justify-center space-y-6 animate-fade-in-up">
                <div className="space-y-4">
                  <a href="#never-list" className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary hover:bg-primary/15">
                    <ListChecks className="h-4 w-4" />
                    Ken&apos;s Never List for Oakville sellers
                  </a>
                  <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl xl:text-6xl/none">
                    Find Out What Your Home Is <span className="text-gradient">Really Worth</span>
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-[520px]">
                    Get a free, instant AI-powered valuation for your Oakville home. No obligation, no pressure — just the data you need to make smart decisions.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {CONTACT.name}, {REAL_ESTATE.title}, {REAL_ESTATE.brokerage}
                  </p>
                </div>

                {/* Trust signals (desktop only: on phones the form takes the first screen) */}
                <div className="hidden lg:grid grid-cols-2 gap-4 pt-4">
                  {[
                    { icon: Clock, label: "Instant Results", desc: "AI-powered in seconds" },
                    { icon: Shield, label: "100% Free", desc: "No obligation ever" },
                    { icon: Star, label: "5-Star Service", desc: "20+ years experience" },
                    { icon: CheckCircle, label: "Local Expert", desc: "Oakville specialist" },
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

                {/* Social proof */}
                <div className="hidden lg:flex items-center gap-3 pt-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                        <Star className="h-3 w-3 text-primary fill-primary" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">5-Star Service</span> — Trusted by Oakville homeowners
                  </p>
                </div>
              </div>

              {/* Right — Valuation form (first on phones so it sits above the fold) */}
              <div className="w-full order-first lg:order-none scroll-mt-24" id="valuation-tool">
                <HomeValuation />
              </div>
            </div>
          </div>
        </section>

        {/* Ken's Never List */}
        <section className="py-12 md:py-16" id="never-list">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Ken&apos;s Never List</p>
                <h2 className="font-headline text-2xl font-bold sm:text-3xl">Seven things I would never do selling my own house</h2>
                <p className="mt-3 text-muted-foreground">
                  Twenty-two years of Oakville listings, boiled down to the mistakes that cost sellers the most.
                </p>
              </div>
              <ol className="grid gap-4 sm:grid-cols-2">
                {SELLER_NEVER_LIST.map((item, i) => (
                  <li key={item} className="flex gap-4 rounded-xl border bg-card p-5">
                    <span className="font-headline text-3xl font-bold leading-none text-primary tabular-nums">{i + 1}</span>
                    <p className="text-sm leading-relaxed text-foreground/90">{item}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* How it works — 3 simple steps */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Simple Process</p>
              <h2 className="font-headline text-2xl font-bold sm:text-3xl">How It Works</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
              {[
                { step: "1", title: "Enter Your Address", desc: "Type in your Oakville home address and a few basic details about your property." },
                { step: "2", title: "Get Your Valuation", desc: "Our AI analyzes recent sales, market trends, and neighbourhood data to estimate your home's current value." },
                { step: "3", title: "Talk to Ken (Optional)", desc: "Want a more precise number? Ken will prepare a detailed Comparative Market Analysis — free, no strings attached." },
              ].map((item) => (
                <div key={item.step} className="text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-lg font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-headline text-lg font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Video — Ken's #1 seller mistake */}
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-8 max-w-2xl mx-auto">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">From Ken</p>
              <h2 className="font-headline text-2xl font-bold sm:text-3xl">
                The #1 Thing I&apos;d Never Do Selling My Own Home
              </h2>
              <p className="mt-3 text-muted-foreground">
                After 22 years selling real estate, the first week on the market is when you get the most interest. Don&apos;t waste it overpricing to test the market.
              </p>
            </div>
            <div className="max-w-3xl mx-auto overflow-hidden rounded-2xl shadow-xl bg-black">
              <video
                className="w-full h-auto aspect-video"
                controls
                playsInline
                preload="metadata"
                poster="/ken-intro-poster.jpg"
              >
                <source src="/ken-intro-720p.mp4" type="video/mp4" />
                <track kind="captions" src="/ken-intro-720p.vtt" srcLang="en" label="English" default />
              </video>
            </div>
            <div className="mt-10">
              <NeverListCapture
                asset="seller-never-list"
                secondary={
                  <>
                    Prefer WhatsApp?{' '}
                    <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                      Message Ken for the list
                    </a>
                  </>
                }
              />
            </div>
          </div>
        </section>

        {/* Why Ken — brief credibility section */}
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[300px_1fr] items-center max-w-5xl mx-auto">
              <div className="relative mx-auto lg:mx-0">
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-xl border-4 border-primary/20">
                  <Image
                    src="/ken_headshot_professional.jpg"
                    alt="Ken Finch — Oakville Real Estate Agent"
                    width={300}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">Your Local Expert</p>
                <h2 className="font-headline text-2xl font-bold sm:text-3xl">
                  Meet Ken Finch
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  With over 20 years of experience serving Oakville homeowners, Ken combines deep local knowledge with modern marketing to help sellers get top dollar. As a Broker with Royal LePage Signature Realty, Ken brings the resources of Canada&apos;s largest real estate network to every client.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  {[
                    "20+ years in Oakville",
                    "Oakville specialist",
                    "Royal LePage",
                    "5-star client reviews",
                  ].map((badge) => (
                    <span key={badge} className="inline-flex items-center gap-1.5 text-sm bg-primary/10 text-primary font-medium px-3 py-1 rounded-full">
                      <CheckCircle className="h-3.5 w-3.5" />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 md:py-16 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="font-headline text-2xl font-bold sm:text-3xl">
              Ready to See What Your Home Is Worth?
            </h2>
            <p className="text-primary-foreground/80 text-lg">
              Join hundreds of Oakville homeowners who have used our free AI valuation tool. Get your results in under 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#valuation-tool">
                <Button size="lg" variant="secondary" className="font-semibold shadow-lg text-base px-8">
                  Get My Free Valuation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href={CONTACT.phoneHref}>
                <Button size="lg" variant="secondary" className="font-semibold text-base px-8 shadow-lg">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Ken Directly
                </Button>
              </a>
            </div>
            <p className="text-xs text-primary-foreground/70">
              {CONTACT.name}, {REAL_ESTATE.title}, {REAL_ESTATE.brokerage}. {REAL_ESTATE.disclaimer}
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
