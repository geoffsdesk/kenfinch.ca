import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getSortedPostsData, CATEGORY_LABELS, type PostCategory } from '@/lib/posts';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Landmark } from 'lucide-react';
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Oakville & GTA Home Buyer Guides',
  description:
    'Practical guides for buying a home in Oakville and the GTA: mortgage pre-approval, first-time buyer programs, closing costs, neighbourhood comparisons, plus market reports and selling advice from Ken Finch.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Oakville & GTA Home Buyer Guides | Ken Finch',
    description: 'Mortgage, first-time buyer, closing cost and neighbourhood guides for GTA buyers.',
    url: `${SITE_URL}/blog`,
  },
};

const ORDER: PostCategory[] = ['buying', 'mortgage', 'market', 'selling'];

export default function BlogIndexPage() {
  const allPosts = getSortedPostsData();
  const featured = allPosts.find((p) => p.category === 'buying' || p.category === 'mortgage') ?? allPosts[0];
  const rest = allPosts.filter((p) => p.slug !== featured?.slug);
  const grouped = ORDER.map((cat) => ({ cat, posts: rest.filter((p) => p.category === cat) })).filter((g) => g.posts.length > 0);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-16 lg:py-20 bg-primary/10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Guides</p>
              <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">Oakville &amp; GTA Home Buyer Guides</h1>
              <p className="max-w-[820px] text-muted-foreground md:text-xl/relaxed">
                Straight talk on mortgages, first-time buyer programs, closing costs, and where to buy, from a broker licensed on
                both sides of the deal. Selling advice and market reports live here too.
              </p>
            </div>
          </div>
        </section>

        {featured && (
          <section className="w-full py-12 md:py-16">
            <div className="container px-4 md:px-6">
              <Link href={`/blog/${featured.slug}`} className="group block">
                <Card className="overflow-hidden border-0 shadow-lg">
                  <div className="grid md:grid-cols-2">
                    {featured.image && (
                      <img src={featured.image} alt={featured.title} className="h-64 md:h-full w-full object-cover" width="800" height="500" />
                    )}
                    <CardContent className="p-8 md:p-10 flex flex-col justify-center">
                      <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                        Featured &middot; {CATEGORY_LABELS[featured.category]}
                      </p>
                      <h2 className="font-headline text-2xl md:text-3xl font-bold mt-3 group-hover:text-primary transition-colors">{featured.title}</h2>
                      <p className="text-muted-foreground mt-3">{featured.excerpt}</p>
                      <p className="text-sm text-muted-foreground mt-4">{featured.formattedDate}</p>
                      <span className="inline-flex items-center gap-2 font-semibold text-primary mt-5">
                        Read the guide <ArrowRight className="h-4 w-4" />
                      </span>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            </div>
          </section>
        )}

        {grouped.map(({ cat, posts }) => (
          <section key={cat} className="w-full py-10 md:py-12">
            <div className="container px-4 md:px-6">
              <div className="flex items-end justify-between mb-6">
                <h2 className="font-headline text-2xl md:text-3xl font-bold">{CATEGORY_LABELS[cat]}</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map(({ slug, title, formattedDate, excerpt, image }) => (
                  <Link key={slug} href={`/blog/${slug}`} className="group">
                    <Card className="flex h-full flex-col overflow-hidden border-0 shadow-md card-hover">
                      {image && <img src={image} alt={title} className="h-44 w-full object-cover" width="600" height="340" />}
                      <CardContent className="p-6 flex-1 flex flex-col">
                        <p className="text-xs text-muted-foreground">{formattedDate}</p>
                        <h3 className="font-headline text-xl font-bold mt-2 group-hover:text-primary transition-colors">{title}</h3>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-3 flex-1">{excerpt}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ))}

        <section className="w-full py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-4xl rounded-2xl bg-slate-950 text-white p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <Landmark className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <h2 className="font-headline text-2xl font-bold">Reading is good. A real number is better.</h2>
                  <p className="text-slate-300 mt-2">Two-minute pre-approval check, no credit pull. Ken calls with your budget.</p>
                </div>
              </div>
              <Link href="/mortgage#apply" className="shrink-0">
                <Button size="lg" variant="secondary" className="font-semibold">
                  Get pre-approved <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
