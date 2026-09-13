"use client";

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submitLead } from '@/lib/leads/client';
import { trackContactFormSubmission } from '@/lib/analytics';
import { CONTACT } from '@/lib/site';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CalendarCheck, Phone } from 'lucide-react';
import Link from 'next/link';

const BALANCES = ['Under $250K', '$250K-$500K', '$500K-$750K', '$750K-$1M', 'Over $1M', 'Prefer not to say'] as const;

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.'),
  phone: z.string().trim().min(7, 'Please enter a number Ken can reach you at.').max(30),
  renewalMonth: z.string().min(1, 'Pick a month, or "Not sure".'),
  lender: z.string().trim().max(80).optional(),
  balance: z.string().optional(),
  note: z.string().trim().max(1000).optional(),
});
type Values = z.infer<typeof schema>;

function monthOptions() {
  const out: { value: string; label: string }[] = [{ value: 'not-sure', label: 'Not sure / need to check' }];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < 30; i += 1) {
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    out.push({ value, label: d.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' }) });
    d.setMonth(d.getMonth() + 1);
  }
  out.push({ value: 'later', label: 'More than 2 years away' });
  return out;
}

function monthsAway(value: string) {
  const m = /^(\d{4})-(\d{2})$/.exec(value);
  if (!m) return null;
  const now = new Date();
  return (parseInt(m[1], 10) - now.getFullYear()) * 12 + (parseInt(m[2], 10) - 1 - now.getMonth());
}

export function RenewalForm() {
  const params = useSearchParams();
  const contactToken = params.get('c') ?? undefined;
  const months = useMemo(monthOptions, []);
  const [done, setDone] = useState<{ month: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', renewalMonth: '', lender: '', balance: '', note: '' },
  });

  async function onSubmit(values: Values) {
    setError(null);
    const away = monthsAway(values.renewalMonth);
    const monthLabel = months.find((m) => m.value === values.renewalMonth)?.label ?? values.renewalMonth;
    const intent = away !== null && away <= 6 ? 'Mortgage renewal within 6 months' : 'Mortgage renewal';
    const message = [
      `Renewal: ${monthLabel}`,
      values.lender ? `Lender: ${values.lender}` : null,
      values.balance ? `Balance: ${values.balance}` : null,
      values.note ? `Note: ${values.note}` : null,
    ]
      .filter(Boolean)
      .join(' · ');
    try {
      const res = await submitLead({
        type: 'contact',
        name: values.name,
        email: values.email,
        phone: values.phone,
        intent,
        message,
        source: 'renewal-form',
        page: typeof window !== 'undefined' ? window.location.pathname : undefined,
        contactToken: contactToken && /^[a-f0-9]{32}$/i.test(contactToken) ? contactToken : undefined,
      });
      if (!res.ok) throw new Error(res.error);
      trackContactFormSubmission({ name: values.name, email: values.email, phone: values.phone });
      setDone({ month: monthLabel });
    } catch (e) {
      console.error(e);
      setError('Something went wrong. Please try again, or text Ken directly.');
    }
  }

  if (done) {
    return (
      <Card data-testid="renewal-success">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <CalendarCheck className="h-8 w-8 text-primary" />
            <h2 className="font-headline text-2xl font-bold">Got it. Ken will check the market for you.</h2>
          </div>
          <p className="text-muted-foreground">
            Renewal noted for <strong>{done.month}</strong>. Ken will reach out about 120 days before with real numbers from the lenders he works
            with, and sooner if rates move in your favour. A confirmation is on its way to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild>
              <a href={CONTACT.phoneHref}>
                <Phone className="mr-2 h-4 w-4" /> Call or text Ken now
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/mortgage">See how the mortgage side works</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="renewal-form">
            <FormField
              control={form.control}
              name="renewalMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>When does your mortgage renew?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="renewal-month">
                        <SelectValue placeholder="Pick a month" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current lender (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="TD, RBC, Scotiabank, a credit union..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approximate balance (optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BALANCES.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(416) 555-0123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anything Ken should know? (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Thinking about pulling equity, moving, a rental property, self-employed..." className="min-h-[80px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Put me on Ken&apos;s renewal calendar
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              No obligation. Ken only reaches out when it is time, or if something changes in your favour.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
