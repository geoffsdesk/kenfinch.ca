import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { HomeValuation } from '@/components/home-valuation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, BarChart, FileText } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section id="hero" className="w-full py-20 md:py-32 lg:py-40 bg-card">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Unlock Your Oakville Home's True Value
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Partner with Ken Finch for a seamless, successful home selling experience in Oakville. Get started with a free, AI-powered home valuation today.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                   <Link href="#valuation-tool" className="inline-block">
                    <Button size="lg">Get Free Valuation</Button>
                  </Link>
                </div>
              </div>
              <img
                src="https://placehold.co/600x400.png"
                width="600"
                height="400"
                alt="Hero"
                data-ai-hint="modern house exterior"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Our Services</div>
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">A Premium Selling Experience</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We provide a comprehensive suite of tools and services to ensure your property stands out and sells for its maximum value.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              <Card>
                <CardHeader>
                  <BarChart className="h-8 w-8 text-primary" />
                  <CardTitle className="font-headline pt-4">AI Home Value Tool</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Get a data-driven, real-time valuation of your home, complete with a confidence score based on the latest Oakville market trends.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CheckCircle className="h-8 w-8 text-primary" />
                  <CardTitle className="font-headline pt-4">Seller Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Stay informed with a personalized dashboard to track listing prep, photo shoots, open houses, and more.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <FileText className="h-8 w-8 text-primary" />
                  <CardTitle className="font-headline pt-4">Secure Document Hub</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Access all your important files, from staging guides to closing documents, in one secure, centralized location.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="valuation-tool" className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container px-4 md:px-6">
             <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                    <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">Discover Your Home's Potential</h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Fill in your property's details below to receive an instant, AI-powered valuation estimate.
                    </p>
                </div>
            </div>
            <div className="mx-auto max-w-4xl pt-12">
              <HomeValuation />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
