
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';
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
        <Toaster />
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '3459484767600231');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=3459484767600231&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}
