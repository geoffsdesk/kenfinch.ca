import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: {
    template: '%s | Oakville Home Seller Success',
    default: 'Oakville Home Seller Success | Ken Finch Real Estate',
  },
  description: 'Partner with Ken Finch, your trusted real estate agent, for a seamless and successful home selling experience in Oakville, Ontario. Get a free, AI-powered home valuation today.',
  keywords: ['Oakville real estate', 'sell home Oakville', 'Ken Finch realtor', 'home valuation Oakville', 'Westoak Trails real estate'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
