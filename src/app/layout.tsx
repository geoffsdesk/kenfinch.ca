
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
    template: '%s | Ken Finch, Oakville Real Estate & Mortgages',
    default: 'Buy a Home in Oakville & the GTA | Ken Finch, Real Estate Broker + Mortgage Broker',
  },
  description:
    'Ken Finch is a licensed real estate broker and licensed mortgage broker in Oakville, Ontario. Get pre-approved and buy your next home in Oakville or the GTA with one advisor.',
  keywords: ['Oakville real estate', 'buy home Oakville', 'mortgage broker Oakville', 'mortgage pre-approval GTA', 'Ken Finch realtor', 'first time home buyer Oakville'],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'Buy a Home in Oakville & the GTA | Ken Finch',
    description: 'One advisor for the home and the mortgage. Licensed real estate broker and mortgage broker serving Oakville and the GTA.',
    images: [`${siteUrl}/hero_family_moving.jpg`],
    siteName: 'KenFinch.ca',
    locale: 'en_CA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buy a Home in Oakville & the GTA | Ken Finch',
    description: 'One advisor for the home and the mortgage. Licensed real estate broker and mortgage broker serving Oakville and the GTA.',
    images: [`${siteUrl}/hero_family_moving.jpg`],
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
