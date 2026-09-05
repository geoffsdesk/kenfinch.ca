"use client";

import { finmoApplicationUrl } from '@/lib/site';
import { trackFinmoHandoff } from '@/lib/analytics';

/**
 * Direct link to the Express Mortgage (Finmo) application for visitors who
 * want to skip the on-site pre-qualification. Always opens in a new tab and
 * fires the hand-off tracking event.
 */
export function FinmoLink({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <a
      href={finmoApplicationUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackFinmoHandoff()}
    >
      {children}
    </a>
  );
}
