
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { HomeValuation } from '@/components/home-valuation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, BarChart, FileText, Star } from 'lucide-react';
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
                src="/hero_house.png"
                width="600"
                height="400"
                alt="Hero"
                data-ai-hint="large house suburb"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <section id="about" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 md:grid-cols-2 md:gap-16">
              <div>
                <img
                  src="/brick.jpg"
                  width="600"
                  height="700"
                  alt="Ken Finch"
                  data-ai-hint="realtor portrait"
                  className="mx-auto aspect-[3/4] overflow-hidden rounded-xl object-cover"
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="space-y-4">
                  <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">Why Sellers Choose Ken Finch</h2>
                  <p className="text-lg font-semibold text-primary">Your Westoak Trails Expert for Fast, Confident Home Sales</p>
                  <p className="text-muted-foreground">
                    Sell Smarter. Sell Faster. Sell with Ken Finch. As a local Oakville real estate expert focused on Westoak Trails, I know what it takes to get your home sold quickly—and for top value. With strong ties in the community and a deep understanding of what buyers want in this high-demand neighbourhood, I do more than list homes—I generate interest and create demand.
                  </p>
                  <p className="text-muted-foreground">
                    Every listing is positioned with care: from professional photography and cinematic drone videos to targeted digital marketing campaigns that put your home in front of serious buyers. With over 95% of buyers starting online, my digital-first approach ensures maximum exposure from day one.
                  </p>
                  <p className="text-muted-foreground">
                    Why list with me? Because I bring more than experience—I bring results. My clients benefit from tailored pricing strategies, strategic negotiations, and personal service every step of the way. Backed by the trusted team at Royal LePage Signature Realty, I combine classic marketing with cutting-edge tools to deliver fast, high-impact sales. Whether you're upsizing, downsizing, or ready for your next chapter, I’ll help you move forward with confidence—and without delay.
                  </p>
                </div>
              </div>
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

        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">What Our Clients Say</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Hear from satisfied sellers who have partnered with Ken Finch.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-1 md:gap-12 lg:grid-cols-2 lg:max-w-none mt-12">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 text-primary mb-2">
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                  </div>
                  <blockquote className="text-lg text-muted-foreground">
                    "Mr. Finch demonstrated proactive involvement in conducting thorough research to provide us with a comprehensive understanding of the current market conditions in our neighbourhood. His instrumental role in orchestrating all stages of our marketing plan...was crucial in achieving our success. His meticulous planning and execution...resulted in the receipt of offers within a few days...His prudent advice against accepting the initial offer proved highly insightful, helping us secure the maximum sales price for our home. This outcome left us with a profound sense of satisfaction...Throughout the transaction, he consistently maintained a professional demeanour and collaborated effectively with us to expedite the sale within record time."
                  </blockquote>
                </CardContent>
                <CardFooter>
                    <p className="font-semibold text-right w-full">- Peter & Elizabeth</p>
                </CardFooter>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 text-primary mb-2">
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                  </div>
                  <blockquote className="text-lg text-muted-foreground">
                    "Ken had professional photos and drone videos that really made our home stand out and get a lot of interest. We had several buyers interested, and Ken worked several offers to get a sale price much more than we expected. This was done within a week, which was essential because we had already bought our next home with his help. The new place is perfect for us and my home business. We couldn’t be happier in our forever home and would absolutely recommend Ken to anyone looking to buy and sell."
                  </blockquote>
                </CardContent>
                <CardFooter>
                    <p className="font-semibold text-right w-full">- Trisha & Ben</p>
                </CardFooter>
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
