"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { captureAttribution } from '@/lib/attribution';

/** Invisible: records UTM / click-id attribution on every navigation. */
export function AttributionCapture() {
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    captureAttribution();
  }, [pathname, search]);
  return null;
}
