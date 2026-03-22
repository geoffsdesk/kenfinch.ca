
import { getPostData, getSortedPostsData } from '@/lib/posts';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import ReactMarkdown from 'react-markdown';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { CheckCircle2 } from 'lucide-react';
import { ContactForm } from '@/components/contact-form';
import Script from 'next/script';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostData(slug);
  if (!post) {
    return {};
  }
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostData(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <article className="container max-w-4xl py-12 md:py-16 lg:py-20">
          {post.image && (
            <div className="mb-8 -mt-4 overflow-hidden rounded-2xl shadow-lg">
              <img
                src={post.image}
                alt={post.title}
                width="1200"
                height="630"
                className="w-full aspect-[16/9] object-cover"
              />
            </div>
          )}
          <header className="text-center space-y-4">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">{post.title}</h1>
            <p className="text-muted-foreground">{post.formattedDate}</p>
          </header>
          <Separator className="my-8" />
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                input: ({ node, ...props }) => {
                  if (props.type === 'checkbox') {
                    return (
                      <CheckCircle2 className="h-5 w-5 text-green-600 absolute left-0 top-1.5" />
                    );
                  }
                  return <input {...props} />;
                },
                li: ({ node, children, className, ...props }) => {
                  if (className?.includes('task-list-item')) {
                    // Use absolute positioning for the checkmark to avoid messing up nested block flow
                    return (
                      <li className={`${className} list-none relative pl-8 my-2`} {...props}>
                        {children}
                      </li>
                    );
                  }
                  return <li className={className} {...props}>{children}</li>;
                }
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          <Separator className="my-12" />

          <section className="bg-muted/50 rounded-lg p-8">
            <div className="text-center mb-8">
              <h2 className="font-headline text-3xl font-bold mb-4">Ready to Sell Your Oakville Home?</h2>
              <p className="text-muted-foreground text-lg">
                Contact Ken Finch today for a personalized evaluation and strategic plan.
              </p>
            </div>
            <div className="max-w-xl mx-auto">
              <ContactForm />
            </div>
          </section>
        </article>
      </main>
      <Footer />
      <Script src="//www.instagram.com/embed.js" strategy="lazyOnload" />
    </div>
  );
}

