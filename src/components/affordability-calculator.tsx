"use client";

/**
 * Affordability calculator for /afford.
 *
 * Five inputs (household income, down payment, monthly debts, property tax /
 * condo fee assumption, qualifying-rate assumption) -> live estimate as a
 * rounded range, three Oakville examples under the same assumptions, then a
 * report request. The report is stored as a `buyer` lead when the buyer schema
 * can be satisfied (full name, phone, first-home answer) and otherwise as a
 * `contact` lead with intent "Affordability estimate". Both carry source
 * `affordability-form` and a compact structured summary as the message.
 *
 * Nothing on this page is a rate quote: the qualifying rate is an editable
 * assumption with that caption, and the page copy carries no rate at all.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { submitLead } from '@/lib/leads/client';
import { useFormGuard } from '@/lib/leads/form-guard';
import { HoneypotField } from '@/components/honeypot-field';
import { ChoiceGroup } from '@/components/buyer-lead-form';
import { trackAffordabilityResult, trackAffordabilityLead, trackFinmoHandoff } from '@/lib/analytics';
import { finmoApplicationUrl, CONTACT, MORTGAGE } from '@/lib/site';
import {
  maxPurchasePrice,
  roundTo,
  priceBucket,
  downPaymentBucket,
  incomeBucket,
  QUALIFYING_RATE_ASSUMPTION,
  type AffordabilityInputs,
  type AffordabilityResult,
} from '@/lib/affordability';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowRight, Loader2, CheckCircle2, Lock, ExternalLink, Phone, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

const SOURCE = 'affordability-form';

const TIMELINES = [
  { value: '0-3', label: 'Within 3 months' },
  { value: '3-6', label: '3 to 6 months' },
  { value: '6-12', label: '6 to 12 months' },
  { value: 'exploring', label: 'Just exploring' },
] as const;

const FIRST_HOME = [
  { value: 'yes', label: 'Yes, first home' },
  { value: 'no', label: 'No, I have owned before' },
] as const;

/** Three illustrative Oakville buyers, recomputed under whatever assumptions the visitor sets. */
const EXAMPLES = [
  { label: 'First condo, Uptown Core', who: 'Couple, $130,000 combined income, $60,000 saved, $450 condo fees, one car payment', income: 130_000, down: 60_000, debts: 450, condo: 450 },
  { label: 'Townhouse, West Oak Trails', who: 'Growing family, $190,000 income, $150,000 down, one car loan', income: 190_000, down: 150_000, debts: 600, condo: 0 },
  { label: 'Detached, Glen Abbey', who: 'Move-up buyers, $280,000 income, $400,000 from the sale of their first home, no debts', income: 280_000, down: 400_000, debts: 0, condo: 0 },
] as const;

const reportSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.'),
  phone: z.string().trim().max(30).optional(),
  timeline: z.enum(['0-3', '3-6', '6-12', 'exploring'], { required_error: 'When are you hoping to buy?' }),
  firstTimeBuyer: z.enum(['yes', 'no']).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please confirm Ken may contact you.' }) }),
});
type ReportValues = z.infer<typeof reportSchema>;

const num = (s: string) => {
  const n = Number(String(s).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};
const money = (n: number) => `$${Math.round(n).toLocaleString('en-CA')}`;

function Field({ id, label, hint, prefix, suffix, children }: { id: string; label: string; hint?: string; prefix?: string; suffix?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-semibold">{label}</Label>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{prefix}</span>}
        <div className={cn(prefix && '[&_input]:pl-7', suffix && '[&_input]:pr-12')}>{children}</div>
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span>}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function AffordabilityCalculator({ className }: { className?: string }) {
  // Step inputs (kept as strings so the fields can be cleared while typing).
  const [income, setIncome] = useState('');
  const [down, setDown] = useState('');
  const [debts, setDebts] = useState('0');
  const [tax, setTax] = useState('450');
  const [heat, setHeat] = useState('150');
  const [condo, setCondo] = useState('0');
  const [rate, setRate] = useState(String(QUALIFYING_RATE_ASSUMPTION));
  const [amort, setAmort] = useState<25 | 30>(25);

  const inputs: AffordabilityInputs = useMemo(
    () => ({
      annualIncome: num(income),
      monthlyDebts: num(debts),
      downPayment: num(down),
      qualifyingRate: Math.min(25, Math.max(0, num(rate))),
      amortizationYears: amort,
      monthlyPropertyTax: num(tax),
      monthlyHeat: num(heat),
      monthlyCondoFees: num(condo),
    }),
    [income, debts, down, rate, amort, tax, heat, condo],
  );

  const ready = inputs.annualIncome > 0 && inputs.downPayment > 0;
  const result: AffordabilityResult | null = useMemo(() => (ready ? maxPurchasePrice(inputs) : null), [ready, inputs]);

  // One GA4 calculator_result per distinct result, debounced while the visitor types.
  const lastTracked = useRef<number | null>(null);
  useEffect(() => {
    if (!result || result.maxPrice <= 0) return;
    const t = setTimeout(() => {
      const rounded = roundTo(result.maxPrice);
      if (lastTracked.current === rounded) return;
      lastTracked.current = rounded;
      trackAffordabilityResult({ maxPrice: rounded, monthlyPayment: Math.round(result.monthlyPayment), bucket: priceBucket(rounded) });
    }, 900);
    return () => clearTimeout(t);
  }, [result]);

  const examples = useMemo(
    () =>
      EXAMPLES.map((e) => ({
        ...e,
        price: maxPurchasePrice({ ...inputs, annualIncome: e.income, downPayment: e.down, monthlyDebts: e.debts, monthlyCondoFees: e.condo, monthlyPropertyTax: num(tax), monthlyHeat: num(heat) }).maxPrice,
      })),
    [inputs, tax, heat],
  );

  // Report request
  const [done, setDone] = useState<{ leadId: string; firstName: string } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const guard = useFormGuard('affordability');
  const form = useForm<ReportValues>({
    resolver: zodResolver(reportSchema),
    mode: 'onTouched',
    defaultValues: { name: '', email: '', phone: '', consent: undefined as unknown as true },
  });

  function summary(values: ReportValues): string {
    const timeline = TIMELINES.find((t) => t.value === values.timeline)?.label ?? values.timeline;
    const parts = [
      `Income ${money(inputs.annualIncome)}/yr`,
      `Debts ${money(inputs.monthlyDebts)}/mo`,
      `Down ${money(inputs.downPayment)}`,
      `Tax ${money(inputs.monthlyPropertyTax)}/mo`,
      `Heat ${money(inputs.monthlyHeat)}/mo`,
      inputs.monthlyCondoFees ? `Condo ${money(inputs.monthlyCondoFees)}/mo` : null,
      `Qualifying rate ${inputs.qualifyingRate}%`,
      `${amort} yr`,
      result && result.maxPrice > 0
        ? `Max ~${money(roundTo(result.maxPrice))} (mortgage ${money(result.mortgageAmount)}, ${money(result.monthlyPayment)}/mo at qualifying rate, ${result.bindingRatio} binding)`
        : 'No estimate yet',
      `Timeline: ${timeline}`,
      values.firstTimeBuyer ? `First home: ${values.firstTimeBuyer}` : null,
    ];
    return parts.filter(Boolean).join(' · ');
  }

  async function onSubmit(values: ReportValues) {
    setServerError(null);
    const page = typeof window !== 'undefined' ? window.location.pathname : undefined;
    const nameParts = values.name.split(/\s+/).filter(Boolean);
    const phoneDigits = (values.phone ?? '').replace(/\D/g, '');
    const fitsBuyer = nameParts.length >= 2 && phoneDigits.length >= 7 && !!values.firstTimeBuyer;
    const message = summary(values);
    const payload = fitsBuyer
      ? {
          type: 'buyer',
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' '),
          email: values.email,
          phone: values.phone,
          goal: values.firstTimeBuyer === 'yes' ? 'first-home' : 'not-sure',
          timeline: values.timeline,
          priceRange: result && result.maxPrice > 0 ? priceBucket(result.maxPrice) : 'not-sure',
          areas: ['Oakville'],
          firstTimeBuyer: values.firstTimeBuyer,
          downPayment: result && result.maxPrice > 0 ? downPaymentBucket(inputs.downPayment, result.maxPrice) : 'not-sure',
          income: inputs.annualIncome > 0 ? incomeBucket(inputs.annualIncome) : undefined,
          consent: true,
          message,
          source: SOURCE,
          page,
        }
      : {
          type: 'contact',
          name: values.name,
          email: values.email,
          phone: values.phone || undefined,
          intent: 'Affordability estimate',
          message,
          source: SOURCE,
          page,
        };
    try {
      const res = await submitLead({ ...payload, ...(await guard.guardPayload()) });
      if (!res.ok) {
        setServerError(res.error);
        return;
      }
      if (res.track) trackAffordabilityLead({ name: values.name, email: values.email, leadId: res.leadId });
      setDone({ leadId: res.leadId, firstName: nameParts[0] ?? values.name });
    } catch (e) {
      console.error(e);
      setServerError('Something went wrong. Please try again or call Ken directly.');
    }
  }

  const steps: { n: number; title: string; body: React.ReactNode }[] = [
    {
      n: 1,
      title: 'Household income',
      body: (
        <Field id="afford-income" label="Gross annual income, everyone on the mortgage" prefix="$" hint="Before tax. Salary, confirmed bonus, pension; for self-employed income use the two-year average on your tax returns.">
          <Input id="afford-income" type="number" inputMode="numeric" min={0} step={1000} placeholder="150000" value={income} onChange={(e) => setIncome(e.target.value)} data-testid="afford-income" />
        </Field>
      ),
    },
    {
      n: 2,
      title: 'Down payment',
      body: (
        <Field id="afford-down" label="Cash you can put down" prefix="$" hint="Savings, FHSA, RRSP Home Buyers' Plan, a gift from family, or proceeds from a sale.">
          <Input id="afford-down" type="number" inputMode="numeric" min={0} step={5000} placeholder="100000" value={down} onChange={(e) => setDown(e.target.value)} data-testid="afford-down" />
        </Field>
      ),
    },
    {
      n: 3,
      title: 'Monthly debts',
      body: (
        <Field id="afford-debts" label="Other monthly payments" prefix="$" suffix="/ mo" hint="Car loans or leases, student loans, lines of credit, and about 3% of any credit card balance you carry.">
          <Input id="afford-debts" type="number" inputMode="numeric" min={0} step={50} placeholder="0" value={debts} onChange={(e) => setDebts(e.target.value)} data-testid="afford-debts" />
        </Field>
      ),
    },
    {
      n: 4,
      title: 'Property tax, heat and condo fees',
      body: (
        <div className="grid gap-3 sm:grid-cols-3">
          <Field id="afford-tax" label="Property tax" prefix="$" suffix="/ mo" hint="Oakville detached homes often run $400 to $900 a month.">
            <Input id="afford-tax" type="number" inputMode="numeric" min={0} step={25} value={tax} onChange={(e) => setTax(e.target.value)} data-testid="afford-tax" />
          </Field>
          <Field id="afford-heat" label="Heating" prefix="$" suffix="/ mo">
            <Input id="afford-heat" type="number" inputMode="numeric" min={0} step={25} value={heat} onChange={(e) => setHeat(e.target.value)} data-testid="afford-heat" />
          </Field>
          <Field id="afford-condo" label="Condo fees" prefix="$" suffix="/ mo" hint="Lenders count half of condo fees.">
            <Input id="afford-condo" type="number" inputMode="numeric" min={0} step={25} value={condo} onChange={(e) => setCondo(e.target.value)} data-testid="afford-condo" />
          </Field>
        </div>
      ),
    },
    {
      n: 5,
      title: 'Qualifying rate and amortization',
      body: (
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field id="afford-rate" label="Stress-test (qualifying) rate" suffix="%" hint="Assumption for this estimate only. Not an offer, not a rate quote. Lenders qualify you at the greater of your contract rate plus two points or a regulator-set floor.">
            <Input id="afford-rate" type="number" inputMode="decimal" min={0} max={25} step={0.05} value={rate} onChange={(e) => setRate(e.target.value)} data-testid="afford-rate" />
          </Field>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Amortization</Label>
            <div className="flex rounded-md border overflow-hidden" role="radiogroup" aria-label="Amortization">
              {([25, 30] as const).map((y) => (
                <button
                  key={y}
                  type="button"
                  role="radio"
                  aria-checked={amort === y}
                  onClick={() => setAmort(y)}
                  className={cn('px-4 py-2 text-sm font-medium', amort === y ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted')}
                  data-testid={`afford-amort-${y}`}
                >
                  {y} yrs
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">30 years: first-time buyers and new builds on insured mortgages.</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div id="calculator" className={cn('scroll-mt-24 space-y-6', className)} data-testid="afford-calculator">
      <Card className="border-0 shadow-xl">
        <CardContent className="p-5 sm:p-8 space-y-7">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Calculator className="h-4 w-4" /> Five quick inputs, instant estimate
          </div>
          {steps.map((s) => (
            <div key={s.n} className="grid gap-3 sm:grid-cols-[36px_1fr]">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-headline font-bold flex items-center justify-center text-sm">{s.n}</div>
              <div className="space-y-3">
                <p className="font-headline text-base font-bold">{s.title}</p>
                {s.body}
              </div>
            </div>
          ))}

          {/* Result */}
          <div className="rounded-xl border bg-primary/5 p-5 sm:p-6" data-testid="afford-result" aria-live="polite">
            {!result ? (
              <p className="text-sm text-muted-foreground">Enter your income and down payment to see what you could qualify for.</p>
            ) : result.maxPrice <= 0 ? (
              <p className="text-sm text-muted-foreground">
                With these numbers the ratios do not leave room for a mortgage. Try a smaller debt figure or a larger down payment, or ask Ken: there are often options the calculator cannot see.
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">You could qualify for roughly</p>
                  <p className="font-headline text-3xl sm:text-4xl font-bold mt-1" data-testid="afford-price">
                    {money(roundTo(result.maxPrice * 0.95, 10_000))} to {money(roundTo(result.maxPrice, 10_000))}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.bindingRatio === 'down-payment'
                      ? 'Your down payment is what sets this ceiling: the minimum down payment rises with the price.'
                      : `Set by the ${result.bindingRatio} ratio (${result.bindingRatio === 'GDS' ? '39% of income on housing costs' : '44% of income on housing costs plus other debts'}).`}
                  </p>
                </div>
                <dl className="grid gap-2 sm:grid-cols-2 text-sm">
                  <div className="flex justify-between gap-3 border-b py-1.5"><dt className="text-muted-foreground">Mortgage amount</dt><dd className="font-semibold">{money(result.mortgageAmount)}</dd></div>
                  <div className="flex justify-between gap-3 border-b py-1.5"><dt className="text-muted-foreground">Minimum down at that price</dt><dd className="font-semibold">{money(result.minDownPayment)}</dd></div>
                  <div className="flex justify-between gap-3 border-b py-1.5"><dt className="text-muted-foreground">Default insurance premium</dt><dd className="font-semibold">{result.insurancePremium > 0 ? `${money(result.insurancePremium)} (added to the mortgage)` : 'None (20% or more down)'}</dd></div>
                  <div className="flex justify-between gap-3 border-b py-1.5"><dt className="text-muted-foreground">Payment at the assumed qualifying rate</dt><dd className="font-semibold">{money(result.monthlyPayment)} / mo</dd></div>
                </dl>
                <p className="text-xs text-muted-foreground">
                  An estimate from the numbers you typed, at the assumed rate above. It is not a pre-approval and not a rate quote; your actual payment depends on the rate a lender offers.
                </p>
              </div>
            )}
          </div>

          {/* Examples */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Three Oakville examples, same assumptions</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {examples.map((e) => (
                <div key={e.label} className="rounded-lg border bg-card p-4">
                  <p className="font-semibold text-sm">{e.label}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{e.who}</p>
                  <p className="font-headline text-xl font-bold mt-2">about {money(roundTo(e.price, 10_000))}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report request */}
      {done ? (
        <Card className="border-0 shadow-xl" data-testid="afford-success" data-lead-id={done.leadId}>
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="font-headline text-2xl font-bold">Thanks, {done.firstName}. Ken has your numbers.</h3>
              <p className="text-muted-foreground">
                He will check them against what lenders are actually approving right now and call or email you within one business day with a real budget. Want a head start?
              </p>
            </div>
            <div className="rounded-xl border bg-muted/40 p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Optional: secure online application</p>
                  <p>Opens Ken&apos;s Express Mortgage portal in a new tab. Encrypted, about 10 minutes, linked to this request so Ken sees everything in one place.</p>
                </div>
              </div>
              <a href={finmoApplicationUrl(done.leadId)} target="_blank" rel="noopener noreferrer" onClick={() => trackFinmoHandoff(done.leadId)} className="block">
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
              {CONTACT.name}, {MORTGAGE.title}, Licence #{MORTGAGE.agentLicence}. Mortgage services provided through {MORTGAGE.brokerage}, FSRA Brokerage Licence #{MORTGAGE.brokerageLicence}.
              An estimate is not a pre-approval or a commitment to lend.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-xl" id="report">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-5">
              <h3 className="font-headline text-2xl font-bold">Get the real number from Ken</h3>
              <p className="text-sm text-muted-foreground mt-1">
                The calculator uses one set of ratios. Lenders differ, programs differ, and your situation has details a form cannot see. Ken will send you a personal affordability report and the programs you may qualify for. No credit check.
              </p>
            </div>
            <Form {...form}>
              <form {...guard.formEventHandlers} onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" data-testid="afford-form">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl><Input placeholder="Jordan Lee" autoComplete="name" {...field} data-testid="afford-name" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="you@example.com" autoComplete="email" {...field} data-testid="afford-email" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone <span className="text-muted-foreground font-normal">(optional, fastest)</span></FormLabel>
                      <FormControl><Input type="tel" placeholder="(416) 555-0123" autoComplete="tel" {...field} data-testid="afford-phone" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="firstTimeBuyer" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Is this your first home? <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                      <FormControl><ChoiceGroup value={field.value} onChange={field.onChange} options={FIRST_HOME} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="timeline" render={({ field }) => (
                  <FormItem>
                    <FormLabel>When are you hoping to buy?</FormLabel>
                    <FormControl><ChoiceGroup value={field.value} onChange={field.onChange} options={TIMELINES} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="consent" render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-lg border bg-muted/30 p-4">
                    <FormControl>
                      <Checkbox checked={field.value === true} onCheckedChange={(v) => field.onChange(v === true ? true : undefined)} className="mt-0.5" data-testid="afford-consent" />
                    </FormControl>
                    <div className="space-y-1 leading-snug">
                      <FormLabel className="text-sm font-normal">
                        Yes, Ken Finch may contact me by phone, text, or email about my home purchase and mortgage options. No credit check is performed at this stage.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )} />
                <HoneypotField id="af-referral" {...guard.honeypotProps} />
                {serverError && <p className="text-sm text-destructive font-medium" role="alert">{serverError}</p>}
                <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting} data-testid="afford-submit">
                  {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send me my affordability report
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Already know your numbers? <Link href="/mortgage#apply" className="font-medium text-primary hover:underline">Start the pre-approval check</Link>.
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
