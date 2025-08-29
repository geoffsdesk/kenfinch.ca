
import { getPostData, getSortedPostsData } from '@/lib/posts';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import ReactMarkdown from 'react-markdown';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostData(params.slug);
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

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = await getPostData(params.slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <article className="container max-w-4xl py-12 md:py-16 lg:py-20">
                    <header className="text-center space-y-4">
                        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">{post.title}</h1>
                        <p className="text-muted-foreground">{post.formattedDate}</p>
                    </header>
                    <Separator className="my-8" />
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                    </div>
                </article>
            </main>
            <Footer />
        </div>
    );
}
