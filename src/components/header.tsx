
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import React from 'react';

export function Header() {
  const [open, setOpen] = React.useState(false);

  const navLinks: { href: string; label: string; external?: boolean }[] = [
    {
        href: "/#valuation-tool",
        label: "Get Valuation",
    },
    {
        href: "/neighborhoods",
        label: "Neighborhoods",
    },
    {
        href: "/contact",
        label: "Contact Ken",
    },
    {
        href: "/seller/login",
        label: "Seller Login",
    },
    {
        href: "/blog",
        label: "Blog",
    },
  ]


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-auto flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold font-headline text-xl text-primary">KenFinch.ca</span>
          </Link>
           <div className="ml-4 hidden md:block">
            <img
                src="/royal_lepage_logo.png"
                alt="Royal LePage Logo"
                width="150"
                height="35"
                style={{ height: 'auto' }}
            />
          </div>
        </div>
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            {navLinks.map(link => (
            link.external ? (
                    <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground/60 transition-colors hover:text-foreground/80"
                    >
                    {link.label}
                </a>
            ) : (
                <Link
                    key={link.href}
                    href={link.href}
                    className="text-foreground/60 transition-colors hover:text-foreground/80"
                    >
                    {link.label}
                </Link>
            )
            ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2 md:hidden">
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
                           <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
                                <span className="font-bold font-headline text-xl text-primary">KenFinch.ca</span>
                            </Link>
                             <img
                                src="/royal_lepage_logo.png"
                                alt="Royal LePage Logo"
                                width="150"
                                height="35"
                            />
                        </div>
                         <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    </SheetHeader>
                    <nav className="grid gap-6 text-lg font-medium mt-8">
                         {navLinks.map(link => (
                            link.external ? (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-foreground/80 transition-colors hover:text-foreground"
                                    onClick={() => setOpen(false)}
                                    >
                                    {link.label}
                                </a>
                            ) : (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-foreground/80 transition-colors hover:text-foreground"
                                    onClick={() => setOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            )
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
