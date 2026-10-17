import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AffordabilityCalculator } from '@/components/affordability-calculator';
import { MortgageDisclosure } from '@/components/mortgage-disclosure';
import { Button } from '@/components/ui/button';
import { CONTACT, MORTGAGE, SITE_URL } from '@/lib/site';
import { BUYER_NEVER_LIST } from '@/lib/never-lists';
import { ArrowRight, Phone, ShieldCheck, Clock, Landmark, Calculator } from 'lucide-react';

export const metadata: Metadata = {
  title: { absolute: 'How Much Home Can You Afford in Oakville? | Ken Finch' },
  description:
    'Free affordability calculator for Oakville and the west GTA: GDS and TDS ratios, the stress test, minimum down payment and insurance premium, with an editable qualifying-rate assumption. Then get the real number from Ken Finch, Mortgage Agent Level 1.',
  keywords: [
    'how much house can I afford Oakville',
    'mortgage affordability calculator Ontario',
    'how much mortgage can I afford',
    'stress test calculator',
    'first time home buyer Oakville',
    'Oakville mortgage agent',
  ],
  alternates: { canonical: '/afford' },
  openGraph: {
    title: 'How Much Home Can You Afford in Oakville?',
    description: 'Two-minute affordability check with real Canadian rules, then a personal report from Ken Finch, Mortgage Agent Level 1.',
    url: `${SITE_URL}/afford`,
  },
};

const FAQS = [
  {
    q: 'What are GDS and TDS, and why do they decide my budget?',
    a: 'Gross debt service (GDS) is the share of your gross income that goes to housing: mortgage payment, property tax, heat and half of any condo fees. Total debt service (TDS) adds your other monthly debts. Most lenders cap GDS at 39% and TDS at 44% on insured mortgages. Whichever cap you hit first is your ceiling, and the calculator shows you which one it is.',
  },
  {
    q: 'What is the mortgage stress test, in plain words?',
    a: 'Lenders do not qualify you at the rate you will actually pay. They qualify you at a higher one: your contract rate plus two percentage points, or a floor set by the regulators, whichever is greater. That is why the calculator asks for a qualifying-rate assumption rather than a mortgage rate. The number you type is only used to size the estimate; it is not a quote and not an offer.',
  },
  {
    q: 'How much do I need for a down payment in Ontario?',
    a: 'Five percent of the first $500,000 of the price, ten percent of the portion between $500,000 and $1.5 million, and twenty percent of the whole price above $1.5 million. Under twenty percent down the mortgage is default-insured and the premium is added to the loan; the calculator includes it.',
  },
  {
    q: 'What is the FHSA and how does it help?',
    a: 'The First Home Savings Account lets a first-time buyer contribute up to $8,000 a year, to a $40,000 lifetime limit. Contributions are tax-deductible like an RRSP and withdrawals for a qualifying first home are tax-free like a TFSA. It stacks with the RRSP Home Buyers\' Plan and the Ontario land transfer tax rebate.',
  },
  {
    q: 'Is this calculator a pre-approval?',
    a: 'No. It is an estimate from the numbers you type, using one set of ratios. A pre-approval means a lender has reviewed your credit, income and down payment and will hold a rate for you. Ken gets you from the estimate to a pre-approval letter in a few days, with no fee to you on standard residential mortgages.',
  },
];

export default function AffordPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FinancialService',
        '@id': `${SITE_URL}/afford#service`,
        name: 'Ken Finch Mortgage Affordability Check',
        url: `${SITE_URL}/afford`,
        telephone: '+1-416-520-5544',
        description: `Mortgage affordability estimates and pre-approvals arranged by ${CONTACT.name}, ${MORTGAGE.title} (Licence #${MORTGAGE.agentLicence}), through ${MORTGAGE.brokerage} (FSRA Brokerage Licence #${MORTGAGE.brokerageLicence}).`,
        areaServed: { '@type': 'AdministrativeArea', name: 'Ontario, Canada' },
        parentOrganization: { '@type': 'Organization', name: MORTGAGE.brokerage },
        provider: { '@id': `${SITE_URL}/#person` },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Mortgage Pre-Approval', item: `${SITE_URL}/mortgage` },
          { '@type': 'ListItem', position: 3, name: 'Affordability', item: `${SITE_URL}/afford` },
        ],
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="flex-1">
        {/* Hero + calculator */}
        <section className="relative w-full py-12 md:py-16 lg:py-20 hero-gradient overflow-hidden">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 items-start">
              <div className="space-y-6 animate-fade-in-up lg:sticky lg:top-24">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  <Calculator className="h-4 w-4" />
                  Real Canadian rules, no credit check
                </div>
                <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none">
                  How much home can you <span className="text-gradient">afford in Oakville?</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-[560px]">
                  Five inputs, an honest range, and the real number from Ken if you want it.
                </p>
                <p className="text-sm text-muted-foreground">
                  {CONTACT.name}, {MORTGAGE.title}, Licence #{MORTGAGE.agentLicence} &middot; {MORTGAGE.brokerage}
                </p>
                <div className="hidden lg:grid grid-cols-1 gap-4 pt-2">
                  {[
                    { icon: ShieldCheck, label: 'The same ratios lenders use', desc: 'GDS 39%, TDS 44%, stress test, minimum down payment and the insurance premium.' },
                    { icon: Clock, label: 'Two minutes, live', desc: 'The estimate updates as you type. Change the rate assumption and watch the ceiling move.' },
                    { icon: Landmark, label: 'Then a real answer', desc: 'Ken checks your numbers against what lenders are approving this month and sends a personal report.' },
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
              </div>

              {/* Calculator first on phones so the inputs sit inside the first screen. */}
              <div className="order-first lg:order-none">
                <AffordabilityCalculator />
                <MortgageDisclosure className="mt-4 px-1" />
              </div>
            </div>
          </div>
        </section>

        {/* Buyer Never List */}
        <section className="py-14 md:py-20 bg-muted/30" id="never-list">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Ken&apos;s Never List, buyers</p>
                <h2 className="font-headline text-2xl font-bold sm:text-3xl">Six things I would never do buying my own home</h2>
              </div>
              <ol className="grid gap-4 sm:grid-cols-2">
                {BUYER_NEVER_LIST.map((item, i) => (
                  <li key={item} className="flex gap-4 rounded-xl border bg-card p-5">
                    <span className="font-headline text-3xl font-bold leading-none text-primary tabular-nums">{i + 1}</span>
                    <p className="text-sm leading-relaxed text-foreground/90">{item}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 md:py-20">
          <div className="container px-4 md:px-6 max-w-3xl mx-auto">
            <div className="text-center space-y-4 mb-10">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Affordability FAQ</p>
              <h2 className="font-headline text-3xl font-bold sm:text-4xl">What actually sets your budget</h2>
            </div>
            <div className="divide-y rounded-2xl border bg-card">
              {FAQS.map((f) => (
                <details key={f.q} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-headline text-lg font-semibold">
                    {f.q}
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Want the long version? Read{' '}
              <Link href="/blog/mortgage-pre-approval-explained-ontario-2026" className="font-semibold text-primary hover:underline">how pre-approval works in Ontario</Link>
              {' '}and the{' '}
              <Link href="/blog/first-time-home-buyer-guide-oakville-gta-2026" className="font-semibold text-primary hover:underline">first-time buyer guide</Link>.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 md:py-16 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="font-headline text-3xl font-bold">Turn the estimate into a pre-approval</h2>
            <p className="text-primary-foreground/85 text-lg">No credit check to start, no obligation. Ken calls you with real numbers.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/mortgage#apply">
                <Button size="lg" variant="secondary" className="font-semibold shadow-lg text-base px-8">
                  Start the pre-approval check
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href={CONTACT.phoneHref}>
                <Button size="lg" variant="secondary" className="font-semibold text-base px-8 shadow-lg">
                  <Phone className="mr-2 h-4 w-4" />
                  Call {CONTACT.phoneDisplay}
                </Button>
              </a>
            </div>
          </div>
        </section>

        <div className="container px-4 md:px-6 py-8">
          <MortgageDisclosure className="max-w-4xl mx-auto text-center" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
