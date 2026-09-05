import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { BuyerLeadForm } from '@/components/buyer-lead-form';
import { MortgageDisclosure } from '@/components/mortgage-disclosure';
import { FinmoLink } from '@/components/finmo-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CONTACT, MORTGAGE, SITE_URL } from '@/lib/site';
import { ArrowRight, Phone, CheckCircle, Shield, Clock, Landmark, FileText, Percent, Calculator, Lock } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mortgage Pre-Approval in Oakville & the GTA',
  description:
    'Get a mortgage pre-approval from Ken Finch, licensed mortgage broker with Canadian Express-Mortgage Inc. (FSRA #13241). 30+ lenders, first-time buyer programs, purchases, refinances and renewals across Ontario.',
  keywords: [
    'mortgage pre-approval Oakville',
    'mortgage broker Oakville',
    'mortgage broker Burlington',
    'mortgage broker Mississauga',
    'first time home buyer mortgage Ontario',
    'mortgage stress test 2026',
    'Express Mortgage Ken Finch',
  ],
  alternates: { canonical: '/mortgage' },
  openGraph: {
    title: 'Mortgage Pre-Approval | Ken Finch, Mortgage Broker',
    description: 'Real numbers from 30+ lenders before you shop. Licensed mortgage broker serving Oakville and all of Ontario.',
    url: `${SITE_URL}/mortgage`,
  },
};

const FAQS = [
  {
    q: 'What is the difference between pre-qualification and pre-approval?',
    a: 'Pre-qualification is an estimate based on what you tell us; the form on this page is a pre-qualification and involves no credit check. Pre-approval means a lender has reviewed your credit, income and down payment and will hold a rate for you, usually for 90 to 120 days. Ken gets you from one to the other in a few days.',
  },
  {
    q: 'How much can I borrow?',
    a: 'Lenders look at your gross debt service (GDS) and total debt service (TDS) ratios, qualified at the stress-test rate rather than your contract rate. As a rule of thumb, most buyers qualify for roughly four to four-and-a-half times household income, adjusted for debts, down payment and property taxes. Ken runs the exact numbers for you.',
  },
  {
    q: 'What is the minimum down payment in Ontario?',
    a: 'Five percent of the first $500,000 and ten percent of the portion between $500,000 and $1.5 million. Homes over $1.5 million require at least twenty percent down. Anything under twenty percent is a default-insured mortgage and carries a CMHC, Sagen or Canada Guaranty premium.',
  },
  {
    q: 'What documents will I need?',
    a: 'Government ID, recent pay stubs and a letter of employment (or two years of tax returns and notices of assessment if self-employed), 90 days of statements showing your down payment, and details of any existing debts. The secure application walks you through uploading each item.',
  },
  {
    q: 'Is a mortgage broker more expensive than my bank?',
    a: 'For standard residential mortgages, brokers are paid by the lender, so there is no fee to you. Because Ken can place your file with over thirty banks, credit unions and monoline lenders, you typically end up with a better rate and terms than a single bank offers.',
  },
  {
    q: 'Can Ken help if I am self-employed, new to Canada, or have bruised credit?',
    a: 'Yes. Alternative and B-lenders exist for exactly these situations. Ken will tell you honestly what is possible now and what a six-month plan to a better rate looks like.',
  },
];

export default function MortgagePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FinancialService',
        '@id': `${SITE_URL}/#mortgage`,
        name: 'Ken Finch Mortgage Services',
        url: `${SITE_URL}/mortgage`,
        telephone: '+1-416-520-5544',
        description: `Residential mortgage pre-approvals, purchases, refinances and renewals arranged by Ken Finch, ${MORTGAGE.title}, through ${MORTGAGE.brokerage} (FSRA Brokerage Licence #${MORTGAGE.brokerageLicence}).`,
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
        ],
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="flex-1">
        {/* Hero + form */}
        <section className="relative w-full py-12 md:py-16 lg:py-20 hero-gradient overflow-hidden">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
              <div className="space-y-6 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  <Landmark className="h-4 w-4" />
                  Licensed mortgage broker &middot; 30+ lenders
                </div>
                <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none">
                  Get pre-approved <span className="text-gradient">before you shop.</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-[560px]">
                  Know your real budget, lock a rate hold, and make offers listing agents take seriously. Ken Finch arranges
                  mortgages through {MORTGAGE.brokerage} and personally reviews every file.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {[
                    { icon: Shield, label: 'No fee to you', desc: 'Lender-paid on standard mortgages' },
                    { icon: Percent, label: 'Rate hold', desc: 'Typically 90 to 120 days' },
                    { icon: Clock, label: 'Fast turnaround', desc: '1 to 3 business days with documents' },
                    { icon: Lock, label: 'Bank-grade security', desc: 'Encrypted application portal' },
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
                <div className="rounded-xl border bg-card p-4 text-sm">
                  <p className="font-semibold">Already know your numbers?</p>
                  <p className="text-muted-foreground mt-1">
                    Skip the quick check and go straight to the secure application. It opens Ken&apos;s Express Mortgage portal in a new tab.
                  </p>
                  <FinmoLink className="mt-3 inline-flex items-center gap-2 font-semibold text-primary hover:underline">
                    Open the secure application <ArrowRight className="h-4 w-4" />
                  </FinmoLink>
                </div>
              </div>

              <div id="apply" className="scroll-mt-24">
                <BuyerLeadForm source="mortgage-page" />
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">The process</p>
              <h2 className="font-headline text-3xl font-bold sm:text-4xl">Three steps to a pre-approval letter</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {[
                { icon: Calculator, step: '1', title: 'Quick check (2 minutes)', body: 'Tell Ken your plans, budget, and rough finances on this page. No credit check. Ken calls within one business day with an honest read.' },
                { icon: FileText, step: '2', title: 'Secure application (10 minutes)', body: 'Complete the encrypted online application and upload documents from your phone. One credit inquiry covers every lender Ken approaches.' },
                { icon: CheckCircle, step: '3', title: 'Pre-approval + rate hold', body: 'Ken shops your file, explains the options in plain English, and issues a pre-approval letter you can attach to offers.' },
              ].map((s) => (
                <div key={s.step} className="relative rounded-2xl border bg-card p-6">
                  <div className="absolute -top-4 left-6 h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow">{s.step}</div>
                  <s.icon className="h-7 w-7 text-primary mt-2" />
                  <h3 className="font-headline text-lg font-bold mt-3">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rules to know */}
        <section className="py-16 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[1fr_1fr] max-w-6xl mx-auto items-start">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">Rules to know in 2026</p>
                <h2 className="font-headline text-3xl font-bold sm:text-4xl">What actually determines your budget</h2>
                <p className="text-muted-foreground text-lg">
                  Canadian mortgage rules changed meaningfully in the last two years, mostly in buyers&apos; favour. Ken makes sure you use every one that applies to you.
                </p>
                <Link href="/blog/mortgage-pre-approval-explained-ontario-2026" className="inline-flex items-center gap-2 font-semibold text-primary hover:underline">
                  Read the full pre-approval guide <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-4">
                {[
                  { title: 'The stress test', body: 'You qualify at the greater of your contract rate plus 2% or 5.25%. It lowers what you can borrow, which is why an accurate pre-approval matters.' },
                  { title: 'Insured mortgages up to $1.5M', body: 'The insured price cap is $1.5 million, so homes across most of Oakville can be bought with less than 20% down.' },
                  { title: '30-year amortizations', body: 'First-time buyers and buyers of newly built homes can take a 30-year insured amortization, which lowers the monthly payment and raises what you qualify for.' },
                  { title: 'First-time buyer programs', body: 'FHSA (up to $40,000 tax-free), Home Buyers’ Plan RRSP withdrawals (up to $60,000 each), Ontario land transfer tax rebate (up to $4,000), plus Toronto’s rebate if you buy in the city.' },
                ].map((r) => (
                  <Card key={r.title} className="border-0 shadow-md">
                    <CardContent className="p-5 flex gap-4">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">{r.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{r.body}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Mortgage services</p>
              <h2 className="font-headline text-3xl font-bold sm:text-4xl">More than purchases</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
              {[
                ['Purchase', 'First homes, move-up buys, investment properties, and pre-construction.'],
                ['Refinance', 'Consolidate debt, fund renovations, or pull equity for an investment.'],
                ['Renewal', 'Do not sign the bank’s renewal letter until Ken has shopped it. Switching is often free.'],
                ['Alternative lending', 'Self-employed, new to Canada, or rebuilding credit. Honest options, clear exit plan.'],
              ].map(([t, b]) => (
                <div key={t} className="rounded-xl border bg-card p-5">
                  <p className="font-headline text-lg font-bold">{t}</p>
                  <p className="text-sm text-muted-foreground mt-2">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-20">
          <div className="container px-4 md:px-6 max-w-3xl mx-auto">
            <div className="text-center space-y-4 mb-10">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Mortgage FAQ</p>
              <h2 className="font-headline text-3xl font-bold sm:text-4xl">Common questions</h2>
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
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 md:py-16 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="font-headline text-3xl font-bold">Start with the two-minute check</h2>
            <p className="text-primary-foreground/85 text-lg">No credit check, no obligation. Ken calls you with real numbers.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#apply">
                <Button size="lg" variant="secondary" className="font-semibold shadow-lg text-base px-8">
                  Get pre-approved
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
