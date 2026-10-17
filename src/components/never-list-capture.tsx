"use client";

/**
 * Email capture for one of Ken's Never Lists (lead magnet). Stores a `popup`
 * lead with the asset name, source `never-list`, and fires the lead-magnet
 * conversion only when the server says the lead is real (`track: true`).
 * Wired exactly like the exit-intent popup: useFormGuard('popup') + honeypot.
 */

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { submitLead } from '@/lib/leads/client';
import { useFormGuard } from '@/lib/leads/form-guard';
import { HoneypotField } from '@/components/honeypot-field';
import { trackNeverListRequest } from '@/lib/analytics';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function NeverListCapture({
  asset,
  title = "Get Ken's complete list",
  description = 'Seven things Ken would never do selling his own house, in your inbox in a minute. No follow-up unless you ask.',
  buttonLabel = 'Send me the list',
  successTitle = 'Check your inbox.',
  successBody = 'The list is on its way from Ken. Reply to that email any time with a question about your own house.',
  secondary,
  className,
}: {
  /** Stored on the lead and used by the confirmation email to pick the list. */
  asset: string;
  title?: string;
  description?: string;
  buttonLabel?: string;
  successTitle?: string;
  successBody?: string;
  /** Secondary link slot, e.g. the WhatsApp link. Rendered under the form and under the success copy. */
  secondary?: ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const guard = useFormGuard('popup');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!EMAIL_RE.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await submitLead({
        type: 'popup',
        name: name.trim() || undefined,
        email: email.trim(),
        asset,
        source: 'never-list',
        page: pathname || undefined,
        ...(await guard.guardPayload()),
      });
      if (!res.ok) throw new Error(res.error);
      if (res.track) trackNeverListRequest(asset, res.leadId);
      setDone(true);
    } catch (err) {
      console.error('Never list capture failed:', err);
      setError('Something went wrong. Please try again, or message Ken directly.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className={cn('mx-auto max-w-md text-center space-y-3', className)} data-testid="never-list-success">
        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="font-headline text-xl font-bold">{successTitle}</h3>
        <p className="text-sm text-muted-foreground">{successBody}</p>
        {secondary && <div className="pt-1 text-sm">{secondary}</div>}
      </div>
    );
  }

  return (
    <div className={cn('mx-auto max-w-md space-y-3', className)}>
      <div className="text-center space-y-1">
        <h3 className="font-headline text-xl font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <form {...guard.formEventHandlers} onSubmit={handleSubmit} className="space-y-3" data-testid="never-list-form" noValidate>
        <Input type="text" placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" data-testid="never-list-name" />
        <Input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          data-testid="never-list-email"
        />
        <HoneypotField id="nl-referral" {...guard.honeypotProps} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="w-full font-semibold" disabled={loading} data-testid="never-list-submit">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {buttonLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
      {secondary && <p className="text-center text-sm text-muted-foreground">{secondary}</p>}
    </div>
  );
}
