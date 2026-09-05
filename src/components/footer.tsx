import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { CONTACT, MORTGAGE, REAL_ESTATE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="w-full border-t bg-secondary/30">
      <div className="container px-4 md:px-6 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-1">
            <span className="font-bold font-headline text-xl text-primary">KenFinch.ca</span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ken Finch is a licensed real estate broker and licensed mortgage broker helping buyers and sellers across
              Oakville and the GTA since 2004. One advisor for the home and the mortgage.
            </p>
            <div className="flex items-center gap-4 pt-1">
              <img
                src="/logo_rlp.png"
                alt="Royal LePage Signature Realty, Brokerage"
                height="28"
                style={{ height: '28px', width: 'auto' }}
              />
            </div>
          </div>

          {/* Buyers */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-widest text-primary">For Buyers</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/buy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Buy a home in Oakville &amp; the GTA</Link>
              <Link href="/mortgage" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Mortgage pre-approval</Link>
              <Link href="/blog/first-time-home-buyer-guide-oakville-gta-2026" className="text-sm text-muted-foreground hover:text-foreground transition-colors">First-time buyer guide</Link>
              <Link href="/blog/closing-costs-buying-home-ontario-2026" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Closing costs in Ontario</Link>
              <Link href="/blog/new-to-canada-first-home-mortgage-guide" className="text-sm text-muted-foreground hover:text-foreground transition-colors">New to Canada? First home &amp; credit guide</Link>
              <Link href="/neighborhoods" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Oakville neighbourhood guides</Link>
            </nav>
          </div>

          {/* Sellers & resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-widest text-primary">Sellers &amp; Resources</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/sell" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Free AI home valuation</Link>
              <Link href="/sell-condo-oakville" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Selling a condo in Oakville</Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Guides &amp; market insights</Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Ken</Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-widest text-primary">Get in Touch</h3>
            <div className="flex flex-col gap-3">
              <a href={CONTACT.phoneHref} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
                <Phone className="h-4 w-4 shrink-0" />
                {CONTACT.phoneDisplay}
              </a>
              <a href={`mailto:${CONTACT.email}`} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
                <Mail className="h-4 w-4 shrink-0" />
                {CONTACT.email}
              </a>
              <div className="text-sm text-muted-foreground flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                {CONTACT.city}, Canada
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://www.facebook.com/KenFinchRealEstate/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/in/kenfinchrealtor/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
                <LinkedinIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container px-4 md:px-6 py-6 space-y-2">
          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            &copy; {new Date().getFullYear()} {CONTACT.name}, {REAL_ESTATE.title}, {REAL_ESTATE.brokerage}. {REAL_ESTATE.disclaimer} All rights reserved.
          </p>
          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            {CONTACT.name}, {MORTGAGE.title}. Mortgage services provided through {MORTGAGE.brokerage}, FSRA Brokerage Licence #{MORTGAGE.brokerageLicence}.
            Mortgage pre-approvals are not a commitment to lend; rates and terms are subject to lender approval.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
