
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { TrackingScripts } from '@/components/tracking-scripts';
import { StickyCTA } from '@/components/sticky-cta';
import { ExitIntentPopup } from '@/components/exit-intent-popup';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
});

const siteUrl = 'https://www.kenfinch.ca';

export const metadata: Metadata = {
  title: {
    template: '%s | Oakville Home Seller Success',
    default: 'Oakville Home Seller Success | Ken Finch Real Estate',
  },
  description: 'Partner with Ken Finch, your trusted real estate agent, for a seamless and successful home selling experience in Oakville, Ontario. Get an AI-powered home valuation today.',
  keywords: ['Oakville real estate', 'sell home Oakville', 'Ken Finch realtor', 'home valuation Oakville', 'Westoak Trails real estate'],
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'Oakville Home Seller Success | Ken Finch Real Estate',
    description: 'Partner with Ken Finch for a seamless home selling experience in Oakville. Get an AI-powered home valuation.',
    images: [`${siteUrl}/hero_house.png`],
    siteName: 'KenFinch.ca',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oakville Home Seller Success | Ken Finch Real Estate',
    description: 'Partner with Ken Finch for a seamless home selling experience in Oakville. Get an AI-powered home valuation.',
    images: [`${siteUrl}/hero_house.png`],
  },
  icons: { icon: '/kf_favicon.ico' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfairDisplay.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <StickyCTA />
        <ExitIntentPopup />
        <Toaster />
        <TrackingScripts />
      </body>
    </html>
  );
}
