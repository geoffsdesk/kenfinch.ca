import { getPostData, getSortedPostsData, CATEGORY_LABELS } from '@/lib/posts';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { BuyerLeadForm } from '@/components/buyer-lead-form';
import { ContactForm } from '@/components/contact-form';
import { MortgageDisclosure } from '@/components/mortgage-disclosure';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import { SITE_URL } from '@/lib/site';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostData(slug);
  if (!post) return {};
  const canonicalPath = `/blog/${slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}${canonicalPath}`,
      images: post.image ? [post.image] : undefined,
      publishedTime: post.date,
    },
  };
}

export async function generateStaticParams() {
  return getSortedPostsData().map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostData(slug);
  if (!post) notFound();

  const canonicalUrl = `${SITE_URL}/blog/${slug}`;
  const imageUrl = post.image ? (post.image.startsWith('http') ? post.image : `${SITE_URL}${post.image}`) : undefined;
  const isBuyer = post.category === 'buying' || post.category === 'mortgage';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    url: canonicalUrl,
    image: imageUrl,
    articleSection: CATEGORY_LABELS[post.category],
    author: { '@type': 'Person', name: 'Ken Finch', url: SITE_URL, jobTitle: ['Real Estate Broker', 'Mortgage Broker'] },
    publisher: {
      '@type': 'Organization',
      name: 'Ken Finch Real Estate & Mortgages',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/kf_logo.png` },
    },
  };

  const related = getSortedPostsData().filter((p) => p.slug !== slug && p.category === post.category).slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col">
      <Script id="blog-jsonld" type="application/ld+json" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="flex-1">
        <article className="container max-w-4xl py-12 md:py-16 lg:py-20">
          {post.image && (
            <div className="mb-8 -mt-4 overflow-hidden rounded-2xl shadow-lg">
              <img src={post.image} alt={post.title} width="1200" height="630" className="w-full aspect-[16/9] object-cover" />
            </div>
          )}
          <header className="text-center space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">{CATEGORY_LABELS[post.category]}</p>
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">{post.title}</h1>
            <p className="text-muted-foreground">
              {post.formattedDate} &middot; By Ken Finch, Real Estate Broker &amp; Mortgage Broker
            </p>
          </header>
          <Separator className="my-8" />
          <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-headline prose-a:text-primary">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                input: ({ node, ...props }) => {
                  if (props.type === 'checkbox') {
                    return <CheckCircle2 className="h-5 w-5 text-green-600 absolute left-0 top-1.5" />;
                  }
                  return <input {...props} />;
                },
                li: ({ node, children, className, ...props }) => {
                  if (className?.includes('task-list-item')) {
                    return (
                      <li className={`${className} list-none relative pl-8 my-2`} {...props}>
                        {children}
                      </li>
                    );
                  }
                  return <li className={className} {...props}>{children}</li>;
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          <Separator className="my-12" />

          {isBuyer ? (
            <section id="pre-approval" className="scroll-mt-24">
              <div className="text-center mb-8">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">Next step</p>
                <h2 className="font-headline text-3xl font-bold mb-3">Find out what you actually qualify for</h2>
                <p className="text-muted-foreground text-lg">
                  Two minutes, no credit check. Ken reviews it personally and calls with a real budget.
                </p>
              </div>
              <BuyerLeadForm source={`blog:${slug}`} />
            </section>
          ) : (
            <section className="bg-muted/50 rounded-lg p-8">
              <div className="text-center mb-8">
                <h2 className="font-headline text-3xl font-bold mb-3">Selling, buying, or both?</h2>
                <p className="text-muted-foreground text-lg">
                  Ken handles the sale, the purchase, and the financing as one plan. Start the conversation.
                </p>
                <Link href="/sell#valuation-tool" className="inline-flex items-center gap-2 text-primary font-semibold mt-4 hover:underline">
                  Or get a free AI home valuation first <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="max-w-xl mx-auto">
                <ContactForm />
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section className="mt-16">
              <h2 className="font-headline text-2xl font-bold mb-6">More {CATEGORY_LABELS[post.category].toLowerCase()} guides</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {related.map((r) => (
                  <Link key={r.slug} href={`/blog/${r.slug}`} className="rounded-xl border bg-card p-4 hover:border-primary/50 transition-colors">
                    <p className="font-semibold leading-snug">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-2">{r.formattedDate}</p>
                  </Link>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/blog">
                  <Button variant="outline">All guides</Button>
                </Link>
              </div>
            </section>
          )}

          <MortgageDisclosure className="mt-12 text-center" />
        </article>
      </main>
      <Footer />
      <Script src="//www.instagram.com/embed.js" strategy="lazyOnload" />
    </div>
  );
}
