'use client';

/**
 * Honeypot: a text input real visitors never see or tab into, but naive form
 * fillers do. Off-screen rather than display:none because DOM fillers skip
 * display:none; no placeholder because every E2E selector uses placeholders.
 * Any value in it is a hard spam signal (src/lib/leads/spam.ts).
 */

export const HONEYPOT_NAME = 'referral_code';

export function HoneypotField({ id, value, onChange }: { id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>
      <label htmlFor={id}>Referral code</label>
      <input id={id} name={HONEYPOT_NAME} type="text" tabIndex={-1} autoComplete="off" value={value} onChange={onChange} />
    </div>
  );
}
