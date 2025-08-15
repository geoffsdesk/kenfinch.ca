
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export function Header() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold font-headline text-xl text-primary">KenFinch.ca</span>
          </Link>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            <a
              href="https://app.realmmlp.ca/shared/NkRorVzOjRH8EZq3l6e4/eP5L3rZYmMUg2VbgPj8qta3A24la7jtykEQ12JP5srj6l9WRW4HLRbVk7gy6HBY7QPl5R4TnYVZPzjyEfrVYykAknOSWYnewr8ZwI9LREjEgLEFRBO7k7pB7c6wb4WEkKgHDqgrEzOLnUoM1MZD8o"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Listings
            </a>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
        </div>
      </div>
    </header>
  );
}
