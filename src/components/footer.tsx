import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Ken Finch Real Estate. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="#" className="text-muted-foreground hover:text-foreground">
            <TwitterIcon className="h-5 w-5" />
          </Link>
          <Link href="https://www.facebook.com/KenFinchRealEstate/" className="text-muted-foreground hover:text-foreground">
            <FacebookIcon className="h-5 w-5" />
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground">
            <LinkedinIcon className="h-5 w-5" />
          </Link>
           <Link href="https://www.realtor.ca/agent/1520965/kenneth-finch-8-sampson-mews-suite-201-the-shops-at-don-mills-toronto-ontario-m3c0h5" className="text-muted-foreground hover:text-foreground">
            <RealtorIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}

function RealtorIcon(props: React.SVGProps<SVGSVGElement>) {
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
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 3.3 4.9 3 7.1 0 .8-1.7 1.5-3.3 1.5-1.3 0-2.8-.5-4.2-1.3-1.4-.8-2.8-1.9-4.2-3.1-1.4-1.2-2.8-2.5-4.2-4C2 6.5 4 4 4 4s2.2 1.3 3.5 2.2c1.3.9 2.8 1.9 4.2 2.8 1.4.9 2.8 1.6 4.2 2.1 1.4.5 2.8.8 4.2 1 .7 0 1.2-.2 1.5-.5.3-.3.5-.7.5-1.2 0-.5-.2-1-.5-1.5s-.7-1-1.2-1.5c-.5-.5-1-1-1.5-1.5s-1-1-1.5-1.5c-.5-.5-1-1-1.5-1.5s-1-1-1.5-1.5z" />
    </svg>
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
