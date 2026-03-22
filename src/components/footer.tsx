import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t bg-secondary/30">
      <div className="container px-4 md:px-6 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <span className="font-bold font-headline text-xl text-primary">KenFinch.ca</span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted Oakville real estate expert. Helping families sell their homes with confidence for over 20 years.
            </p>
            <img
              src="/royal_lepage_logo.png"
              alt="Royal LePage Signature Realty"
              width="130"
              height="30"
              style={{ height: 'auto' }}
            />
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-widest text-primary">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/#valuation-tool" className="text-sm text-muted-foreground hover:text-foreground transition-colors">AI Home Valuation</Link>
              <Link href="/neighborhoods" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Oakville Neighborhoods</Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Market Insights Blog</Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact Ken</Link>
              <a href="/oakville-sellers-guide.pdf" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Free Seller&apos;s Guide (PDF)</a>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-widest text-primary">Get in Touch</h3>
            <div className="flex flex-col gap-3">
              <a href="tel:+19055103642" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
                <Phone className="h-4 w-4 shrink-0" />
                (905) 510-3642
              </a>
              <a href="mailto:ken@kenfinch.ca" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
                <Mail className="h-4 w-4 shrink-0" />
                ken@kenfinch.ca
              </a>
              <div className="text-sm text-muted-foreground flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                Oakville, Ontario, Canada
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://www.facebook.com/KenFinchRealEstate/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/in/kenfinchrealtor/?originalSubdomain=ca" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <LinkedinIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container px-4 md:px-6 flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <p className="text-center text-xs text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Ken Finch Real Estate. All rights reserved. Royal LePage Signature Realty, Brokerage.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
