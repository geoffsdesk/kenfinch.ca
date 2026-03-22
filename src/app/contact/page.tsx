
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ContactForm } from '@/components/contact-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Ken Finch',
    description: 'Have questions or ready to get started with selling your Oakville home? Contact Ken Finch today for expert real estate advice.',
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section id="contact" className="w-full py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-8 text-center">
                <div className="mx-auto max-w-3xl">
                    <img
                        src="/sold_by_ken1.png"
                        width="1200"
                        height="400"
                        alt="A sign showing a house sold by Ken Finch"
                        className="mx-auto aspect-auto overflow-hidden rounded-xl object-cover"
                    />
                </div>
              <div className="space-y-2 pt-8">
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">Contact Ken</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Have questions or ready to get started? Reach out today.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-4xl pt-12">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
