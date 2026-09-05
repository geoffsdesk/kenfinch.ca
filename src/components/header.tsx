"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, Phone, ArrowRight } from 'lucide-react';
import React from 'react';
import { CONTACT } from '@/lib/site';

const NAV_LINKS: { href: string; label: string }[] = [
  { href: '/buy', label: 'Buy' },
  { href: '/mortgage', label: 'Mortgages' },
  { href: '/neighborhoods', label: 'Neighbourhoods' },
  { href: '/blog', label: 'Guides' },
  { href: '/about', label: 'About Ken' },
  { href: '/sell', label: 'Sell' },
];

export function Header() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center gap-6">
        <div className="mr-auto flex items-center">
          <Link href="/" className="flex items-center gap-3">
            <span className="font-bold font-headline text-xl text-primary">KenFinch.ca</span>
          </Link>
          <div className="ml-4 hidden lg:flex items-center">
            <img
              src="/logo_rlp.png"
              alt="Royal LePage Signature Realty, Brokerage"
              height="28"
              style={{ height: '28px', width: 'auto' }}
            />
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-foreground/70 transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <a href={CONTACT.phoneHref} className="hidden xl:inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-foreground px-2">
            <Phone className="h-4 w-4" />
            {CONTACT.phoneDisplay}
          </a>
          <Link href="/mortgage#apply">
            <Button size="sm" className="font-semibold shadow-sm">
              Get pre-approved
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <a href={CONTACT.phoneHref} aria-label={`Call Ken at ${CONTACT.phoneDisplay}`}>
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
          </a>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <div className="flex flex-col items-start gap-4">
                  <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
                    <span className="font-bold font-headline text-xl text-primary">KenFinch.ca</span>
                  </Link>
                  <img
                    src="/logo_rlp.png"
                    alt="Royal LePage Signature Realty, Brokerage"
                    height="28"
                    style={{ height: '28px', width: 'auto' }}
                  />
                </div>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-5 text-lg font-medium mt-8">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-foreground/80 transition-colors hover:text-foreground"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/contact" className="text-foreground/80 hover:text-foreground" onClick={() => setOpen(false)}>
                  Contact
                </Link>
              </nav>
              <div className="mt-8 grid gap-3">
                <Link href="/mortgage#apply" onClick={() => setOpen(false)}>
                  <Button className="w-full font-semibold" size="lg">
                    Get pre-approved
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href={CONTACT.phoneHref}>
                  <Button variant="outline" className="w-full" size="lg">
                    <Phone className="mr-2 h-4 w-4" />
                    Call {CONTACT.phoneDisplay}
                  </Button>
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
