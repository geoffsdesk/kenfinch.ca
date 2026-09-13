import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { RenewalForm } from '@/components/renewal-form';
import { MortgageDisclosure } from '@/components/mortgage-disclosure';
import { CONTACT, SITE_URL } from '@/lib/site';
import { CalendarClock, Landmark, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Mortgage Renewal Check | Ken Finch, Oakville',
  description:
    'Tell Ken Finch when your mortgage renews and he will shop the market for you 120 days out. Oakville mortgage broker, no obligation.',
  alternates: { canonical: '/renewal' },
  openGraph: {
    title: 'When does your mortgage renew?',
    description: 'Put your renewal on Ken Finch\'s calendar and get real numbers from dozens of lenders at the right time.',
    url: `${SITE_URL}/renewal`,
  },
};

export default function RenewalPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 max-w-6xl mx-auto items-start">
              <div className="space-y-6">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">Mortgage renewal</p>
                <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">When does your mortgage renew?</h1>
                <p className="text-lg text-muted-foreground">
                  Most people sign the letter their bank mails them. Shopping it 120 days out is usually worth a call. Tell Ken the
                  month and he will check the market for you at the right time.
                </p>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <CalendarClock className="h-6 w-6 text-primary shrink-0" />
                    <div>
                      <p className="font-semibold">The 120-day window</p>
                      <p className="text-sm text-muted-foreground">Lenders hold rates for up to 120 days. That is when a broker can shop your renewal properly, with no penalty.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <Landmark className="h-6 w-6 text-primary shrink-0" />
                    <div>
                      <p className="font-semibold">Dozens of lenders, one call</p>
                      <p className="text-sm text-muted-foreground">Banks, monolines and credit unions, including your current lender. Switching usually costs nothing.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
                    <div>
                      <p className="font-semibold">No obligation</p>
                      <p className="text-sm text-muted-foreground">If your bank&apos;s offer is the best one, Ken will tell you to take it.</p>
                    </div>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Prefer to talk? Call or text Ken at <a href={CONTACT.phoneHref} className="font-semibold text-foreground">{CONTACT.phoneDisplay}</a>.
                </p>
              </div>
              <Suspense fallback={null}>
                <RenewalForm />
              </Suspense>
            </div>
            <div className="max-w-6xl mx-auto mt-12">
              <MortgageDisclosure />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
