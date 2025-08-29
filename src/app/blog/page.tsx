
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getSortedPostsData } from '@/lib/posts';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Oakville Real Estate Blog',
    description: 'Expert insights, tips, and market updates for home sellers in Oakville, Ontario. Stay informed with Ken Finch Real Estate.',
};

export default function BlogIndexPage() {
    const allPosts = getSortedPostsData();

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <section id="blog-header" className="w-full py-12 md:py-16 lg:py-20 bg-primary/10">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">Oakville Seller's Guide</h1>
                            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Your trusted resource for market insights, selling tips, and neighborhood highlights in Oakville.
                            </p>
                        </div>
                    </div>
                </section>

                <section id="blog-posts" className="w-full py-12 md:py-16 lg:py-20">
                    <div className="container px-4 md:px-6">
                         <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {allPosts.map(({ slug, title, formattedDate, excerpt }) => (
                                <Card key={slug} className="flex flex-col">
                                    <CardHeader>
                                        <p className="text-sm text-muted-foreground">{formattedDate}</p>
                                        <CardTitle className="font-headline text-2xl pt-2">{title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <p className="text-muted-foreground">{excerpt}</p>
                                    </CardContent>
                                    <CardFooter>
                                         <Link href={`/blog/${slug}`} className="w-full">
                                            <Button variant="outline" className="w-full">
                                                Read More <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
