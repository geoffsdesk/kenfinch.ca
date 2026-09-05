import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { BuyerLeadForm } from '@/components/buyer-lead-form';
import { MortgageDisclosure } from '@/components/mortgage-disclosure';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getBuyerPosts } from '@/lib/posts';
import { CONTACT, MORTGAGE, REAL_ESTATE, SITE_URL } from '@/lib/site';
import {
  ArrowRight,
  Phone,
  MapPin,
  Star,
  ShieldCheck,
  Landmark,
  Handshake,
  Search,
  FileCheck2,
  KeyRound,
  BadgeCheck,
  Home as HomeIcon,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Buy a Home in Oakville & the GTA | Ken Finch, Real Estate Broker + Mortgage Broker' },
  description:
    'Buy your next home in Oakville, Burlington, Mississauga or anywhere in the GTA with Ken Finch: a licensed real estate broker and licensed mortgage broker. Get pre-approved and find the right home with one advisor.',
  keywords: [
    'buy home Oakville',
    'Oakville real estate agent for buyers',
    'mortgage broker Oakville',
    'mortgage pre-approval Oakville',
    'first time home buyer Oakville',
    'GTA buyer agent',
    'Ken Finch realtor',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Buy a Home in Oakville & the GTA | Ken Finch',
    description:
      'One advisor for your home search and your mortgage. Ken Finch is a licensed real estate broker and licensed mortgage broker serving Oakville and the GTA.',
    url: `${SITE_URL}/`,
    images: [`${SITE_URL}/hero_family_moving.jpg`],
  },
};

const FAQS = [
  {
    q: 'Why work with a Realtor who is also a mortgage broker?',
    a: 'You get one plan instead of two conversations. Ken knows what lenders need before you write an offer, so your budget is realistic, your financing condition is safe, and there are no surprises between accepted offer and closing. He is licensed as a real estate broker (RECO) and as a mortgage broker (FSRA).',
  },
  {
    q: 'Does it cost me anything to use Ken as my buyer agent?',
    a: 'In most Ontario resale transactions the buyer brokerage commission is paid out of the sale proceeds, not by the buyer directly. Ken explains exactly how representation and compensation work in a Buyer Representation Agreement before you commit to anything, as required under TRESA.',
  },
  {
    q: 'How long does a mortgage pre-approval take?',
    a: 'The form on this page takes about two minutes. Once you complete the secure online application and upload documents, Ken can typically return a pre-approval with a rate hold within one to three business days, depending on the lender.',
  },
  {
    q: 'Does getting pre-approved hurt my credit?',
    a: 'Filling out the form on this site involves no credit check at all. A full pre-approval requires one credit inquiry, which has a minimal effect and lets Ken shop your file to multiple lenders without repeated pulls.',
  },
  {
    q: 'Which areas does Ken cover for buyers?',
    a: 'Oakville is home base, with active coverage of Burlington, Mississauga, Milton, and the wider GTA. Mortgage services are available anywhere in Ontario.',
  },
];

export default function Home() {
  const buyerPosts = getBuyerPosts(3);

  // Structured data: Ken as RealEstateAgent + FinancialService (mortgage
  // brokerage services) + Person + FAQPage. `sameAs` links collapse the
  // off-site profiles into one entity for search engines and LLMs.
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'RealEstateAgent',
        '@id': `${SITE_URL}/#agent`,
        name: 'Ken Finch, Broker',
        url: SITE_URL,
        logo: `${SITE_URL}/kf_logo.png`,
        image: `${SITE_URL}/ken_headshot_professional.jpg`,
        telephone: '+1-416-520-5544',
        email: CONTACT.email,
        address: { '@type': 'PostalAddress', addressLocality: 'Oakville', addressRegion: 'ON', addressCountry: 'CA' },
        description:
          'Ken Finch is a licensed real estate broker with Royal LePage Signature Realty and a licensed mortgage broker with Canadian Express-Mortgage Inc., helping buyers across Oakville and the GTA find and finance the right home.',
        areaServed: [
          { '@type': 'Place', name: 'Oakville, ON' },
          { '@type': 'Place', name: 'Burlington, ON' },
          { '@type': 'Place', name: 'Mississauga, ON' },
          { '@type': 'Place', name: 'Milton, ON' },
          { '@type': 'Place', name: 'Toronto, ON' },
          { '@type': 'Place', name: 'Greater Toronto Area' },
        ],
        memberOf: { '@type': 'Organization', name: REAL_ESTATE.brokerage, url: 'https://www.royallepage.ca/' },
        priceRange: '$$$',
        knowsAbout: [
          'Buying a home in Oakville',
          'Mortgage pre-approval',
          'First-time home buyer programs in Ontario',
          'GTA real estate',
          'Residential mortgages',
          'Home valuation',
          'Real estate negotiation',
        ],
        sameAs: [
          'https://www.royallepage.ca/en/agent/ontario/toronto/ken-finch/31668/',
          'https://www.linkedin.com/in/kenfinchrealtor/',
          'https://www.facebook.com/KenFinchRealEstate/',
        ],
      },
      {
        '@type': 'FinancialService',
        '@id': `${SITE_URL}/#mortgage`,
        name: 'Ken Finch Mortgage Services',
        url: `${SITE_URL}/mortgage`,
        description: `Residential mortgage pre-approvals, purchases, refinances and renewals through ${MORTGAGE.brokerage} (FSRA Brokerage Licence #${MORTGAGE.brokerageLicence}).`,
        telephone: '+1-416-520-5544',
        areaServed: { '@type': 'AdministrativeArea', name: 'Ontario, Canada' },
        provider: { '@id': `${SITE_URL}/#person` },
        parentOrganization: { '@type': 'Organization', name: MORTGAGE.brokerage },
        serviceType: ['Mortgage pre-approval', 'Purchase mortgage', 'Mortgage refinance', 'Mortgage renewal'],
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: 'Ken Finch',
        givenName: 'Ken',
        familyName: 'Finch',
        jobTitle: ['Real Estate Broker', 'Mortgage Broker'],
        image: `${SITE_URL}/ken_headshot_professional.jpg`,
        url: SITE_URL,
        worksFor: [{ '@id': `${SITE_URL}/#agent` }, { '@type': 'Organization', name: MORTGAGE.brokerage }],
        workLocation: { '@type': 'Place', name: 'Oakville, Ontario, Canada' },
        description:
          'Ken Finch is an Oakville, Ontario real estate broker (Royal LePage Signature Realty) and licensed mortgage broker (Canadian Express-Mortgage Inc.) who has helped GTA families buy and sell homes since 2004.',
        sameAs: [
          'https://www.royallepage.ca/en/agent/ontario/toronto/ken-finch/31668/',
          'https://www.linkedin.com/in/kenfinchrealtor/',
          'https://www.facebook.com/KenFinchRealEstate/',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'Ken Finch Real Estate & Mortgages',
        publisher: { '@id': `${SITE_URL}/#agent` },
        inLanguage: 'en-CA',
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Header />
      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section id="hero" className="relative w-full overflow-hidden bg-slate-950 text-white">
          <img
            src="/hero_family_moving.jpg"
            alt="A family celebrating the purchase of their new home in Oakville"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
            width="1600"
            height="900"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/30" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 to-transparent" />

          <div className="container relative px-4 md:px-6 py-20 md:py-28 lg:py-36">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
              <div className="space-y-7 animate-fade-in-up">
                <p className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                  <MapPin className="h-3.5 w-3.5" />
                  Oakville &middot; Burlington &middot; Mississauga &middot; GTA
                </p>
                <h1 className="font-headline text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl xl:text-7xl">
                  Buy your next home with the broker who also{' '}
                  <span className="text-primary">gets you the mortgage.</span>
                </h1>
                <p className="max-w-xl text-lg text-slate-300 md:text-xl">
                  Ken Finch is a licensed real estate broker <em>and</em> a licensed mortgage broker. One advisor, one
                  plan: know exactly what you can afford, then find and win the right home in Oakville or anywhere in the GTA.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-1">
                  <Link href="#pre-approval">
                    <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 shadow-lg shadow-primary/30">
                      Get pre-approved
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto text-base px-8 py-6 border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                    >
                      <Phone className="mr-2 h-5 w-5" />
                      Book a buyer consultation
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-primary" /> Licensed Real Estate Broker</span>
                  <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-primary" /> Licensed Mortgage Broker</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="flex text-primary">
                      {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                    </span>
                    20+ years in Oakville
                  </span>
                </div>
              </div>

              {/* Value card */}
              <div className="animate-fade-in-up animate-delay-200">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md shadow-2xl">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">One call. Two licences.</p>
                  <h2 className="font-headline text-2xl font-bold mt-2">What buyers get with Ken</h2>
                  <ul className="mt-5 space-y-4 text-slate-200">
                    {[
                      ['A real number, not a guess', 'Pre-approval with a rate hold before you start touring, so you shop with confidence.'],
                      ['Offers that win', 'Ken structures financing conditions the way listing agents like to see them, without exposing you to risk.'],
                      ['No hand-offs', 'Search, offer, financing, and closing coordinated by the same person who answers your texts.'],
                      ['Access to 30+ lenders', 'Banks, credit unions, and monoline lenders compete for your mortgage. You keep the best terms.'],
                    ].map(([title, body]) => (
                      <li key={title} className="flex gap-3">
                        <ShieldCheck className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                        <div>
                          <p className="font-semibold text-white">{title}</p>
                          <p className="text-sm text-slate-300">{body}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Link href="#pre-approval" className="block mt-6">
                    <Button variant="secondary" className="w-full font-semibold">
                      Start my 2-minute pre-approval check
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────────────────────── */}
        <section className="w-full border-b bg-background">
          <div className="container px-4 md:px-6 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                ['20+', 'Years serving Oakville buyers & sellers'],
                ['2', 'Licences: real estate (RECO) + mortgage (FSRA)'],
                ['30+', 'Lenders competing for your mortgage'],
                ['12', 'Oakville neighbourhood buyer guides'],
              ].map(([n, l]) => (
                <div key={l}>
                  <p className="font-headline text-3xl md:text-4xl font-bold text-primary">{n}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why buyers choose Ken ────────────────────────────────────── */}
        <section id="why-ken" className="w-full py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Why buyers choose Ken</p>
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Most agents find you a house. Ken makes sure you can close on it.
              </h2>
              <p className="text-lg text-muted-foreground">
                Buying in the GTA is a financing problem as much as a search problem. Ken solves both, in the right order.
              </p>
            </div>
            <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
              {[
                {
                  icon: Landmark,
                  title: 'Mortgage strategy first',
                  body: 'Ken runs your numbers across bank, credit union and monoline lenders, explains the stress test, and locks a rate hold before your first showing.',
                },
                {
                  icon: Search,
                  title: 'Local search, done properly',
                  body: 'Twenty years of Oakville sales, block by block. Ken knows which streets flood, which schools drive resale, and what a fair price is before the listing agent tells you.',
                },
                {
                  icon: Handshake,
                  title: 'Negotiation with financing insight',
                  body: 'Because Ken sees the lender side, he knows how firm your financing really is. That lets him write cleaner, more competitive offers without gambling your deposit.',
                },
              ].map((item) => (
                <Card key={item.title} className="card-hover border-0 shadow-md">
                  <CardContent className="p-7">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-headline text-xl font-bold">{item.title}</h3>
                    <p className="mt-3 text-muted-foreground leading-relaxed">{item.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <div className="gold-divider w-full" />

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section id="how-it-works" className="w-full py-16 md:py-24 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">How it works</p>
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">From first call to keys in hand</h2>
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-4">
              {[
                { icon: FileCheck2, step: '1', title: 'Get pre-approved', body: 'Two-minute check on this page, then a secure application. Ken returns a real budget and a rate hold.' },
                { icon: Search, step: '2', title: 'Search with a plan', body: 'Curated listings, private showings, and honest opinions on every home, including the ones to walk away from.' },
                { icon: Handshake, step: '3', title: 'Win the offer', body: 'Pricing strategy, inspection and financing conditions structured to protect you and still beat the competition.' },
                { icon: KeyRound, step: '4', title: 'Close with confidence', body: 'Ken coordinates lender, lawyer, and appraisal so funding is ready on closing day. Then he hands you the keys.' },
              ].map((s) => (
                <div key={s.step} className="relative rounded-2xl border bg-card p-6">
                  <div className="absolute -top-4 left-6 h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow">
                    {s.step}
                  </div>
                  <s.icon className="h-7 w-7 text-primary mt-2" />
                  <h3 className="font-headline text-lg font-bold mt-3">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pre-approval form ────────────────────────────────────────── */}
        <section id="pre-approval" className="w-full py-16 md:py-24 scroll-mt-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 items-start">
              <div className="space-y-6 lg:sticky lg:top-24">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">Free pre-approval check</p>
                <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                  Find out what you can afford before you fall in love with a house.
                </h2>
                <p className="text-lg text-muted-foreground">
                  Answer a few quick questions. Ken reviews every submission personally and calls you within one business day
                  with a realistic budget, the programs you qualify for, and a plan.
                </p>
                <ul className="space-y-3 text-sm">
                  {[
                    'No credit check to start, no obligation',
                    'First-time buyer programs: FHSA, Home Buyers’ Plan, land transfer tax rebates, 30-year insured amortizations',
                    'Self-employed, new to Canada, and bruised-credit files welcome',
                    'Optional: continue straight into a secure online application',
                  ].map((t) => (
                    <li key={t} className="flex gap-3">
                      <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-muted-foreground">{t}</span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-xl border bg-muted/40 p-4 flex items-center gap-4">
                  <img
                    src="/ken_headshot_professional.jpg"
                    alt="Ken Finch"
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/30"
                    width="56"
                    height="56"
                  />
                  <div className="text-sm">
                    <p className="font-semibold">Ken Finch</p>
                    <p className="text-muted-foreground">Real Estate Broker &middot; Mortgage Broker</p>
                    <a href={CONTACT.phoneHref} className="text-primary font-medium hover:underline">{CONTACT.phoneDisplay}</a>
                  </div>
                </div>
              </div>
              <BuyerLeadForm source="home-pre-approval" />
            </div>
          </div>
        </section>

        {/* ── Neighbourhoods ───────────────────────────────────────────── */}
        <section className="w-full py-16 md:py-20 bg-slate-950 text-white relative overflow-hidden">
          <img
            src="/hero_oakville_aerial.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-25"
            width="1600"
            height="900"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 to-slate-950/90" />
          <div className="container relative px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-5">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Where to buy</p>
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Twelve Oakville neighbourhoods, decoded for buyers
              </h2>
              <p className="text-lg text-slate-300">
                Price ranges, schools, commute times, and Ken&apos;s honest take on who each neighbourhood is right for.
              </p>
              <Link href="/neighborhoods">
                <Button size="lg" variant="secondary" className="mt-2 text-base px-8 py-6 font-semibold">
                  <MapPin className="mr-2 h-5 w-5" />
                  Explore the neighbourhood guides
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Buyer resources ──────────────────────────────────────────── */}
        {buyerPosts.length > 0 && (
          <section className="w-full py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-widest text-primary">Buyer resources</p>
                  <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Read before you buy</h2>
                </div>
                <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                  <BookOpen className="h-4 w-4" /> All guides
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {buyerPosts.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                    <Card className="h-full overflow-hidden border-0 shadow-md card-hover">
                      {post.image && (
                        <img src={post.image} alt={post.title} className="h-44 w-full object-cover" width="600" height="340" />
                      )}
                      <CardContent className="p-6">
                        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                          {post.category === 'mortgage' ? 'Mortgages' : 'Buying'}
                        </p>
                        <h3 className="font-headline text-xl font-bold mt-2 group-hover:text-primary transition-colors">{post.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Testimonials ─────────────────────────────────────────────── */}
        <section id="testimonials" className="w-full py-16 md:py-24 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Client stories</p>
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">What Oakville families say about Ken</h2>
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 grid gap-5 sm:grid-cols-[96px_1fr] items-start">
                  <img src="/trisha_ben.png" width="96" height="96" alt="Trisha and Ben" className="rounded-full aspect-square object-cover ring-4 ring-primary/20" />
                  <div className="space-y-3">
                    <div className="flex text-primary">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                    <blockquote className="text-muted-foreground leading-relaxed italic">
                      &ldquo;Ken expertly handled multiple offers and secured a price well above our expectations, all within a week.
                      We&apos;d confidently recommend Ken to anyone buying or selling.&rdquo;
                    </blockquote>
                    <p className="font-semibold">&mdash; Trisha &amp; Ben</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 grid gap-5 sm:grid-cols-[96px_1fr] items-start">
                  <img src="/wei_linda_sold.png" width="96" height="96" alt="Wei and Linda" className="rounded-full aspect-square object-cover ring-4 ring-primary/20" />
                  <div className="space-y-3">
                    <div className="flex text-primary">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                    <blockquote className="text-muted-foreground leading-relaxed italic">
                      &ldquo;Ken really knew the market and had a smart game plan from day one. He was professional, easy to work with,
                      and kept things moving fast.&rdquo;
                    </blockquote>
                    <p className="font-semibold">&mdash; Wei &amp; Linda</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section id="faq" className="w-full py-16 md:py-24">
          <div className="container px-4 md:px-6 max-w-3xl mx-auto">
            <div className="text-center space-y-4 mb-10">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Questions buyers ask</p>
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Straight answers</h2>
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

        {/* ── Selling too? ─────────────────────────────────────────────── */}
        <section className="w-full py-12 bg-muted/40 border-t">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-4xl flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl border bg-card p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <HomeIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold">Selling a home first?</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Ken coordinates the sale, the purchase, and bridge financing so the timelines actually line up.
                    Start with a free valuation.
                  </p>
                </div>
              </div>
              <Link href="/sell" className="shrink-0">
                <Button variant="outline" size="lg">
                  Free home valuation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <MortgageDisclosure className="mx-auto max-w-4xl mt-6 text-center" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
