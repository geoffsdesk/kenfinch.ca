"use client";

/**
 * Multi-step buyer / mortgage pre-approval form.
 *
 * Step 1  Your plans        (goal, timeline, budget, areas, first-time)
 * Step 2  Your finances     (down payment, income band, employment, credit)
 * Step 3  Contact + consent
 * Done    Lead saved + Ken emailed -> "Continue your secure application"
 *         button that opens Express Mortgage (Finmo) with our lead ID.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submitBuyerLead } from '@/app/actions/buyer-lead';
import { finmoApplicationUrl, CONTACT, MORTGAGE, SERVICE_AREAS } from '@/lib/site';
import { trackMortgageLead, trackFinmoHandoff } from '@/lib/analytics';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowRight, ArrowLeft, Loader2, ShieldCheck, Phone, CheckCircle2, Lock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

// Client-side schema mirrors the server one (kept local so the form can
// validate per-step without a round-trip).
const schema = z.object({
  goal: z.enum(['first-home', 'move-up', 'investment', 'refinance', 'not-sure'], { required_error: 'Pick the option closest to your plans.' }),
  timeline: z.enum(['0-3', '3-6', '6-12', 'exploring'], { required_error: 'When are you hoping to move?' }),
  priceRange: z.enum(['under-750k', '750k-1m', '1m-1.5m', '1.5m-2.5m', 'over-2.5m', 'not-sure'], { required_error: 'Pick a price range (a guess is fine).' }),
  areas: z.array(z.enum(SERVICE_AREAS)).min(1, 'Pick at least one area.'),
  firstTimeBuyer: z.enum(['yes', 'no'], { required_error: 'Let Ken know if this is your first home.' }),
  downPayment: z.enum(['under-5', '5-10', '10-20', '20-plus', 'not-sure'], { required_error: 'Pick the closest option.' }),
  income: z.enum(['under-100k', '100k-150k', '150k-250k', 'over-250k', 'prefer-not']).optional(),
  employment: z.enum(['salaried', 'self-employed', 'contract', 'retired', 'other']).optional(),
  credit: z.enum(['excellent', 'good', 'fair', 'not-sure']).optional(),
  preApproved: z.enum(['yes', 'no']).optional(),
  firstName: z.string().trim().min(1, 'Please enter your first name.'),
  lastName: z.string().trim().min(1, 'Please enter your last name.'),
  email: z.string().trim().email('Please enter a valid email address.'),
  phone: z.string().trim().min(7, 'Please enter a phone number Ken can reach you at.'),
  message: z.string().trim().max(2000).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please confirm you would like Ken to contact you.' }) }),
});

type Values = z.infer<typeof schema>;

const STEP_FIELDS: (keyof Values)[][] = [
  ['goal', 'timeline', 'priceRange', 'areas', 'firstTimeBuyer'],
  ['downPayment', 'income', 'employment', 'credit', 'preApproved'],
  ['firstName', 'lastName', 'email', 'phone', 'message', 'consent'],
];

const STEP_TITLES = ['Your plans', 'Your finances', 'Your details'];

const OPTIONS = {
  goal: [
    { value: 'first-home', label: 'Buying my first home' },
    { value: 'move-up', label: 'Moving up or relocating' },
    { value: 'investment', label: 'Investment property' },
    { value: 'refinance', label: 'Refinance or renewal' },
    { value: 'not-sure', label: 'Not sure yet' },
  ],
  timeline: [
    { value: '0-3', label: 'Within 3 months' },
    { value: '3-6', label: '3 to 6 months' },
    { value: '6-12', label: '6 to 12 months' },
    { value: 'exploring', label: 'Just exploring' },
  ],
  priceRange: [
    { value: 'under-750k', label: 'Under $750K' },
    { value: '750k-1m', label: '$750K to $1M' },
    { value: '1m-1.5m', label: '$1M to $1.5M' },
    { value: '1.5m-2.5m', label: '$1.5M to $2.5M' },
    { value: 'over-2.5m', label: 'Over $2.5M' },
    { value: 'not-sure', label: 'Not sure' },
  ],
  firstTimeBuyer: [
    { value: 'yes', label: 'Yes, first home' },
    { value: 'no', label: 'No, I have owned before' },
  ],
  downPayment: [
    { value: 'under-5', label: 'Less than 5%' },
    { value: '5-10', label: '5% to 10%' },
    { value: '10-20', label: '10% to 20%' },
    { value: '20-plus', label: '20% or more' },
    { value: 'not-sure', label: 'Not sure' },
  ],
  income: [
    { value: 'under-100k', label: 'Under $100K' },
    { value: '100k-150k', label: '$100K to $150K' },
    { value: '150k-250k', label: '$150K to $250K' },
    { value: 'over-250k', label: 'Over $250K' },
    { value: 'prefer-not', label: 'Prefer not to say' },
  ],
  employment: [
    { value: 'salaried', label: 'Salaried / hourly' },
    { value: 'self-employed', label: 'Self-employed' },
    { value: 'contract', label: 'Contract' },
    { value: 'retired', label: 'Retired' },
    { value: 'other', label: 'Other' },
  ],
  credit: [
    { value: 'excellent', label: 'Excellent (760+)' },
    { value: 'good', label: 'Good (680 to 759)' },
    { value: 'fair', label: 'Fair (below 680)' },
    { value: 'not-sure', label: 'Not sure' },
  ],
  preApproved: [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'Not yet' },
  ],
} as const;

/** Pill-style single choice. */
function ChoiceGroup({
  value,
  onChange,
  options,
  columns = 2,
}: {
  value?: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
  columns?: 2 | 3;
}) {
  return (
    <div className={cn('grid gap-2', columns === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2')} role="radiogroup">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all',
              active
                ? 'border-primary bg-primary/10 text-foreground ring-2 ring-primary/30'
                : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Pill-style multi choice. */
function MultiChoice({
  value,
  onChange,
  options,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: readonly string[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? value.filter((v) => v !== opt) : [...value, opt])}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-all',
              active
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5',
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function BuyerLeadForm({
  source = 'buyer-lead-form',
  compact = false,
  className,
}: {
  source?: string;
  /** Slightly tighter padding for sidebars / landing heroes. */
  compact?: boolean;
  className?: string;
}) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState<{ leadId: string; firstName: string } | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      areas: ['Oakville'],
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      message: '',
      consent: undefined as unknown as true,
    },
  });

  const totalSteps = STEP_FIELDS.length;

  async function next() {
    const valid = await form.trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (valid) setStep((s) => Math.min(s + 1, totalSteps - 1));
  }

  async function onSubmit(values: Values) {
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await submitBuyerLead({
        ...values,
        source,
        page: typeof window !== 'undefined' ? window.location.pathname : undefined,
      });
      if (!res.ok) {
        setServerError(res.error);
        return;
      }
      trackMortgageLead({ leadId: res.leadId, goal: values.goal, timeline: values.timeline, source });
      setDone({ leadId: res.leadId, firstName: values.firstName });
    } catch (e) {
      console.error(e);
      setServerError('Something went wrong. Please try again or call Ken directly.');
    } finally {
      setSubmitting(false);
    }
  }

  const pad = compact ? 'p-5 sm:p-6' : 'p-6 sm:p-8';

  if (done) {
    const finmoUrl = finmoApplicationUrl(done.leadId);
    return (
      <Card className={cn('border-0 shadow-xl', className)} data-testid="buyer-lead-success">
        <CardContent className={cn(pad, 'space-y-6')}>
          <div className="text-center space-y-3">
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="font-headline text-2xl font-bold">Thanks, {done.firstName}. You&apos;re on Ken&apos;s list.</h3>
            <p className="text-muted-foreground">
              Ken will call you within one business day to walk through your options. Want a head start?
              Complete the secure mortgage application now and Ken can have numbers ready when he calls.
            </p>
          </div>

          <div className="rounded-xl border bg-muted/40 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Step 2 (optional): Secure online application</p>
                <p>
                  Opens Ken&apos;s Express Mortgage portal in a new tab. It is bank-grade encrypted, takes about 10 minutes,
                  and is linked to your request so Ken sees everything in one place.
                </p>
              </div>
            </div>
            <a
              href={finmoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackFinmoHandoff(done.leadId)}
              className="block"
            >
              <Button size="lg" className="w-full text-base">
                Continue to secure application
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
            <span className="text-muted-foreground">Prefer to talk first?</span>
            <a href={CONTACT.phoneHref} className="inline-flex items-center gap-2 font-semibold text-primary hover:underline">
              <Phone className="h-4 w-4" />
              Call Ken at {CONTACT.phoneDisplay}
            </a>
          </div>

          <p className="text-[11px] leading-relaxed text-muted-foreground text-center">
            Mortgage services provided through {MORTGAGE.brokerage}, FSRA Brokerage Licence #{MORTGAGE.brokerageLicence}.
            A pre-approval is not a commitment to lend; final approval is subject to lender review.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-0 shadow-xl', className)} data-testid="buyer-lead-form">
      <CardContent className={cn(pad)}>
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-2">
            <span>Step {step + 1} of {totalSteps}</span>
            <span>{STEP_TITLES[step]}</span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors', i <= step ? 'bg-primary' : 'bg-muted')} />
            ))}
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              // Enter should advance steps, not submit prematurely.
              if (e.key === 'Enter' && step < totalSteps - 1 && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
                e.preventDefault();
                void next();
              }
            }}
            className="space-y-6"
          >
            {step === 0 && (
              <div className="space-y-6 animate-fade-in-up">
                <FormField control={form.control} name="goal" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">What are you planning?</FormLabel>
                    <FormControl><ChoiceGroup value={field.value} onChange={field.onChange} options={OPTIONS.goal} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="timeline" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">When would you like to move?</FormLabel>
                    <FormControl><ChoiceGroup value={field.value} onChange={field.onChange} options={OPTIONS.timeline} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="priceRange" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Rough price range</FormLabel>
                    <FormControl><ChoiceGroup value={field.value} onChange={field.onChange} options={OPTIONS.priceRange} columns={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="areas" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Where are you looking?</FormLabel>
                    <FormControl><MultiChoice value={field.value} onChange={field.onChange} options={SERVICE_AREAS} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="firstTimeBuyer" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Is this your first home?</FormLabel>
                    <FormControl><ChoiceGroup value={field.value} onChange={field.onChange} options={OPTIONS.firstTimeBuyer} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6 animate-fade-in-up">
                <p className="text-sm text-muted-foreground -mt-2">
                  Approximate answers are fine. This helps Ken estimate what you qualify for before you ever fill out a full application.
                </p>
                <FormField control={form.control} name="downPayment" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Down payment you have available</FormLabel>
                    <FormControl><ChoiceGroup value={field.value} onChange={field.onChange} options={OPTIONS.downPayment} columns={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="income" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Household income <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                    <FormControl><ChoiceGroup value={field.value} onChange={field.onChange} options={OPTIONS.income} columns={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="employment" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Employment <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                    <FormControl><ChoiceGroup value={field.value} onChange={field.onChange} options={OPTIONS.employment} columns={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField control={form.control} name="credit" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Credit <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                      <FormControl><ChoiceGroup value={field.value} onChange={field.onChange} options={OPTIONS.credit} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="preApproved" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Already pre-approved?</FormLabel>
                      <FormControl><ChoiceGroup value={field.value} onChange={field.onChange} options={OPTIONS.preApproved} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-fade-in-up">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl><Input placeholder="Jordan" autoComplete="given-name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl><Input placeholder="Lee" autoComplete="family-name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="you@example.com" autoComplete="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl><Input type="tel" placeholder="(416) 555-0123" autoComplete="tel" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="message" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anything else Ken should know? <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                    <FormControl>
                      <Textarea placeholder="Selling a home first, buying with a partner, specific streets or schools in mind..." className="min-h-[90px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="consent" render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-lg border bg-muted/30 p-4">
                    <FormControl>
                      <Checkbox checked={field.value === true} onCheckedChange={(v) => field.onChange(v === true ? true : undefined)} className="mt-0.5" />
                    </FormControl>
                    <div className="space-y-1 leading-snug">
                      <FormLabel className="text-sm font-normal">
                        Yes, Ken Finch may contact me by phone, text, or email about my home purchase and mortgage options.
                        I understand this is not a credit application and no credit check is performed at this stage.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )} />
              </div>
            )}

            {serverError && (
              <p className="text-sm text-destructive font-medium" role="alert">{serverError}</p>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              {step > 0 ? (
                <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={submitting}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              ) : <span />}

              {step < totalSteps - 1 ? (
                <Button type="button" size="lg" onClick={next} className="px-8">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" size="lg" className="px-8" disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                  Get my pre-approval plan
                </Button>
              )}
            </div>
          </form>
        </Form>

        <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground text-center">
          <Lock className="inline h-3 w-3 mr-1 -mt-0.5" />
          No credit check. No obligation. Your information is never sold.
          Mortgage services through {MORTGAGE.brokerage}, FSRA Lic. #{MORTGAGE.brokerageLicence}.
        </p>
      </CardContent>
    </Card>
  );
}
