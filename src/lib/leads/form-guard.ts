'use client';

/**
 * Client half of the lead spam defence. Fetches a signed form token when the
 * form mounts, counts real pointer/keyboard events inside the form, and owns
 * the honeypot value. Spread `formEventHandlers` on the <form>, render
 * <HoneypotField {...honeypotProps}/> inside it, and spread
 * `await guardPayload()` into the submitLead call.
 *
 * guardPayload is async on purpose. The form pages are static and served by
 * the CDN, so the token request is often the first hit on a scaled-to-zero
 * Cloud Run instance and can take several seconds. A visitor who autofills
 * and clicks Send inside that window must not be scored `token:missing`
 * (review: confirmation, check-in and conversion pixels withheld), so the
 * submit waits for the in-flight token, up to TOKEN_WAIT_MS. The submit itself
 * would be queued behind the same cold instance anyway, so this adds no wall
 * time in practice.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { issueFormTokenAction } from '@/app/actions/leads';

export type GuardFormId = 'contact' | 'renewal' | 'buyer' | 'valuation' | 'popup' | 'affordability';

/** Longest a submit waits for a token still in flight before going without one. */
export const TOKEN_WAIT_MS = 8000;

export interface GuardPayload {
  formToken: string | undefined;
  hp: string | undefined;
  client: { webdriver: boolean; interactions: number; msSinceMount: number };
}

function withTimeout(p: Promise<string>, ms: number): Promise<string> {
  return new Promise<string>((resolve) => {
    const timer = setTimeout(() => resolve(''), ms);
    p.then(
      (t) => {
        clearTimeout(timer);
        resolve(t);
      },
      () => {
        clearTimeout(timer);
        resolve('');
      },
    );
  });
}

export function useFormGuard(formId: GuardFormId, opts: { enabled?: boolean } = {}) {
  const enabled = opts.enabled ?? true;
  const [hp, setHp] = useState('');
  const mountedAt = useRef(Date.now());
  const interactions = useRef(0);

  // The token is never rendered, so it lives in refs: `token` is the one we hold,
  // `pending` the request for the next one (null when nothing is in flight).
  const token = useRef('');
  const pending = useRef<Promise<string> | null>(null);
  const cancelled = useRef(false);

  const fetchToken = useCallback(
    (attempt = 0): Promise<string> => {
      const p = (async (): Promise<string> => {
        try {
          const t = await issueFormTokenAction(formId);
          if (!cancelled.current) token.current = t;
          return t;
        } catch {
          if (cancelled.current || attempt >= 1) return '';
          await new Promise((r) => setTimeout(r, 2000));
          return fetchToken(attempt + 1);
        }
      })();
      pending.current = p;
      const clear = () => {
        if (pending.current === p) pending.current = null;
      };
      p.then(clear, clear);
      return p;
    },
    [formId],
  );

  useEffect(() => {
    if (!enabled) return;
    cancelled.current = false;
    void fetchToken(0);
    return () => {
      cancelled.current = true;
    };
  }, [fetchToken, enabled]);

  const bump = useCallback(() => {
    interactions.current += 1;
  }, []);

  const formEventHandlers = { onPointerDownCapture: bump, onKeyDownCapture: bump, onTouchStartCapture: bump };
  const honeypotProps = { value: hp, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setHp(e.target.value) };

  const guardPayload = async (): Promise<GuardPayload> => {
    let t = token.current;
    if (!t && pending.current) t = await withTimeout(pending.current, TOKEN_WAIT_MS);
    const payload: GuardPayload = {
      formToken: t || undefined,
      hp: hp || undefined,
      client: {
        webdriver: typeof navigator !== 'undefined' ? !!navigator.webdriver : false,
        interactions: interactions.current,
        msSinceMount: Date.now() - mountedAt.current,
      },
    };
    // Tokens are single-use on the server. A form that resets after success (contact,
    // valuation) can be submitted again by the same person, so fetch a fresh one now.
    if (t) {
      token.current = '';
      void fetchToken(0);
    }
    return payload;
  };

  return { formEventHandlers, honeypotProps, guardPayload };
}
