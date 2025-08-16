
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, FileText, Users, LogOut, ChevronLeft, Building, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

  const handleLogout = async () => {
    await signOut(auth);
    // Redirect to seller login for sellers, and home for admin after logout.
    if (pathname.includes('/sellers') || pathname.includes('/contacts')) {
      router.push('/');
    } else {
      router.push('/seller-login');
    }
  };
  
  const isAdminRoute = pathname.includes('/sellers') || pathname.includes('/contacts');
  const isSellerRoute = !isAdminRoute;

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard', admin: false },
    { href: '/dashboard/documents', icon: FileText, label: 'Documents', admin: false },
    { href: '/dashboard/contacts', icon: Mail, label: 'Contacts', admin: true },
    { href: '/dashboard/sellers', icon: Building, label: 'Sellers', admin: true },
  ];

  useEffect(() => {
     if (!loading && !user) {
        if (isSellerRoute) {
            router.push('/seller-login');
        }
        if (isAdminRoute) {
            router.push('/login');
        }
    }
  },[user, loading, router, isSellerRoute, isAdminRoute]);


  if(loading || (!user && (isSellerRoute || isAdminRoute))) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }
  
  const currentNavItem = navItems.find(item => pathname.startsWith(item.href));
  const pageTitle = currentNavItem ? currentNavItem.label : 'Dashboard';

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <span className="font-headline text-lg">K</span>
            <span className="sr-only">KenFinch.ca</span>
          </Link>
          <TooltipProvider>
            {navItems.filter(item => user ? (isAdminRoute ? item.admin : !item.admin) : true).map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                      { 'bg-accent text-accent-foreground': pathname.startsWith(item.href) }
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Button variant="outline" size="icon" className="sm:hidden" onClick={() => router.back()}>
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
            </Button>
            <h1 className="font-headline text-2xl font-semibold flex-1">
                {pageTitle}
            </h1>
            <Button variant="outline" onClick={handleLogout} className="hidden sm:flex">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
        </main>
      </div>
    </div>
  );
}
