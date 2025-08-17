
import type {Metadata} from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Oakville Home Seller Success',
    default: 'Oakville Home Seller Success | Ken Finch Real Estate',
  },
  icons: { icon: 'https://placehold.co/16x16.png' },
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
      <body className={`${inter.variable} ${playfairDisplay.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
