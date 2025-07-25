"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { getHomeValuation, type HomeValuationOutput } from '@/ai/flows/home-valuation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  address: z.string().min(10, { message: 'Please enter a valid street address.' }),
  bedrooms: z.coerce.number().int().min(1, { message: 'Must have at least 1 bedroom.' }),
  bathrooms: z.coerce.number().min(1, { message: 'Must have at least 1 bathroom.' }),
  squareFootage: z.coerce.number().int().min(500, { message: 'Must be at least 500 sq ft.' }),
  lotSize: z.coerce.number().int().min(1000, { message: 'Must be at least 1000 sq ft.' }),
  yearBuilt: z.coerce.number().int().min(1900, { message: 'Year must be after 1900.' }).max(new Date().getFullYear()),
  renovated: z.boolean().default(false),
  nearbySchools: z.string().min(10, { message: 'Please describe nearby schools.' }),
  recentSales: z.string().min(10, { message: 'Please describe recent comparable sales.' }),
});

export function HomeValuation() {
  const [result, setResult] = useState<HomeValuationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: '',
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 2000,
      lotSize: 5000,
      yearBuilt: 2005,
      renovated: false,
      nearbySchools: '',
      recentSales: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const valuationResult = await getHomeValuation(values);
      setResult(valuationResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="flex flex-col items-center justify-center p-10 min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Generating your valuation...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button variant="link" onClick={() => setError(null)} className="p-0 mt-2 h-auto">Try Again</Button>
      </Alert>
    );
  }

  if (result) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Your AI-Powered Home Valuation</CardTitle>
          <CardDescription>Based on the details you provided and current market data.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="text-center bg-primary/10 p-6 rounded-lg">
            <p className="text-sm font-medium text-primary uppercase tracking-wider">Estimated Value</p>
            <p className="text-5xl font-bold text-primary">
              ${result.valuation.toLocaleString('en-US')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="text-accent-foreground h-5 w-5" />
                    <h3 className="font-semibold">Confidence Score</h3>
                  </div>
                  <p className="text-3xl font-bold">{Math.round(result.confidenceScore * 100)}%</p>
                  <Progress value={result.confidenceScore * 100} className="mt-2" />
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-accent-foreground h-5 w-5" />
                  <h3 className="font-semibold">Market Context</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Score reflects how closely your home's features match recent sales data in Oakville.</p>
              </Card>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Sparkles className="text-accent-foreground h-5 w-5" />
                  <span className="font-semibold">Valuation Reasoning</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                {result.reasoning}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
        <CardFooter className="flex-col gap-4">
           <Button onClick={() => { setResult(null); form.reset(); }} className="w-full md:w-auto">Start a New Valuation</Button>
           <p className="text-xs text-muted-foreground">This is an estimate, not a formal appraisal. Consult with Ken Finch for an expert opinion.</p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Home Details</CardTitle>
        <CardDescription>Provide the following information for an accurate valuation.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 123 Maple Street, Oakville, ON" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.5" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="squareFootage"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Square Footage</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                control={form.control}
                name="lotSize"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Lot Size (sq ft)</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="yearBuilt"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Year Built</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <FormField
              control={form.control}
              name="nearbySchools"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nearby Schools</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the names and ratings of nearby schools..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recentSales"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recent Comparable Sales</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe recent comparable sales in the neighborhood (address, price, date)..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="renovated"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Recently Renovated</FormLabel>
                    <FormDescription>
                      Check this box if the home has had significant renovations in the last 5 years.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate My Home Valuation
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
