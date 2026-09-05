import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ContactForm } from '@/components/contact-form';
import { MortgageDisclosure } from '@/components/mortgage-disclosure';
import { CONTACT, SITE_URL } from '@/lib/site';
import { Phone, Mail, Clock, Landmark, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Ken Finch',
  description:
    'Talk to Ken Finch about buying a home in Oakville or the GTA, getting pre-approved for a mortgage, or selling your home. Call (416) 520-5544 or send a message.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Ken Finch | Oakville Real Estate & Mortgages',
    description: 'Reach Ken Finch, real estate broker and mortgage broker, for buying, selling, or financing in Oakville and the GTA.',
    url: `${SITE_URL}/contact`,
  },
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section id="contact" className="w-full py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 max-w-6xl mx-auto items-start">
              <div className="space-y-6">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">Contact</p>
                <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">Let&apos;s talk about your next move.</h1>
                <p className="text-lg text-muted-foreground">
                  Buying, getting pre-approved, selling, or just trying to figure out the order to do it in. Ken answers every
                  message personally.
                </p>
                <div className="space-y-3">
                  <a href={CONTACT.phoneHref} className="flex items-center gap-3 rounded-xl border bg-card p-4 hover:border-primary/50 transition-colors">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">{CONTACT.phoneDisplay}</p>
                      <p className="text-xs text-muted-foreground">Call or text, 7 days a week</p>
                    </div>
                  </a>
                  <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 rounded-xl border bg-card p-4 hover:border-primary/50 transition-colors">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">{CONTACT.email}</p>
                      <p className="text-xs text-muted-foreground">Replies within one business day</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">Serving Oakville &amp; the GTA</p>
                      <p className="text-xs text-muted-foreground">Mortgages available anywhere in Ontario</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-primary/10 p-5">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <Landmark className="h-5 w-5" />
                    Looking to get pre-approved?
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    The fastest route is the two-minute pre-approval check. Ken calls back with real numbers.
                  </p>
                  <Link href="/mortgage#apply" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary mt-3 hover:underline">
                    Start the pre-approval check <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <img
                  src="/ken_with_client.jpg"
                  width="600"
                  height="450"
                  alt="Ken Finch with clients in front of their new Oakville home"
                  className="rounded-2xl object-cover aspect-[4/3] w-full shadow-md"
                />
              </div>
              <div>
                <ContactForm />
                <MortgageDisclosure className="mt-6" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
