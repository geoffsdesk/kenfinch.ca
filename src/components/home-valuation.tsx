"use client";

/**
 * AI home valuation on /sell.
 *
 *   1. Five core fields (address, type, bedrooms, bathrooms, size) -> estimate.
 *      Fires `valuation_tool_used` (not a lead).
 *   2. Range card (+/-10%, rounded to $5,000) + contact gate "See your exact
 *      estimate". Submitting stores a `valuation` lead with source
 *      `valuation-gated` and, when the server says it is real, fires the lead
 *      conversion with the Firestore id.
 *   3. Exact figure, confidence and reasoning. The expert-opinion block becomes
 *      a one-line "Ken has your request" note with an optional button for the
 *      full CMA (source `valuation-expert-opinion`).
 *   4. "Improve my estimate": optional details, recalculates in place.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useJsApiLoader } from '@react-google-maps/api';

import { getHomeValuation, type HomeValuationOutput } from '@/ai/flows/home-valuation';
import { submitLead } from '@/lib/leads/client';
import { trackValuationSubmission, trackExpertOpinionRequest } from '@/lib/analytics';
import { useFormGuard } from '@/lib/leads/form-guard';
import { HoneypotField } from '@/components/honeypot-field';
import { GATE_REASON } from '@/lib/never-lists';
import { CONTACT, REAL_ESTATE } from '@/lib/site';
import { cn } from '@/lib/utils';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, AlertCircle, Sparkles, TrendingUp, ShieldCheck, User, Mail, Phone, MapPin, ChevronDown, CheckCircle2, Lock } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  // Core (asked before the first estimate)
  address: z.string().trim().min(1, { message: 'Please enter a street address.' }),
  homeType: z.string({ required_error: 'Please select a home type.' }),
  bedroomsAboveGrade: z.coerce.number().int().min(0, { message: 'Cannot be negative.' }),
  bathrooms: z.coerce.number().min(1, { message: 'Must have at least 1 bathroom.' }),
  squareFootage: z.string({ required_error: 'Please select a square footage range.' }),
  // Optional ("Improve my estimate"); defaults below keep getHomeValuation's input complete.
  bedroomsBelowGrade: z.coerce.number().int().min(0, { message: 'Cannot be negative.' }),
  yearBuilt: z.string(),
  renovated: z.boolean(),
  finishedBasement: z.string(),
  garageSpaces: z.coerce.number().int().min(0, { message: 'Cannot be negative.' }),
  parkingSpaces: z.coerce.number().int().min(0, { message: 'Cannot be negative.' }),
  nearbySchools: z.string(),
}).refine(data => data.bedroomsAboveGrade + data.bedroomsBelowGrade > 0, {
    message: "Total number of bedrooms must be at least 1.",
    path: ["bedroomsAboveGrade"],
}).refine(data => data.garageSpaces <= data.parkingSpaces, {
    message: "Garage spaces cannot exceed total parking spaces.",
    path: ["garageSpaces"],
});

type FormValues = z.infer<typeof formSchema>;

const gateSchema = z.object({
    name: z.string().trim().min(2, { message: 'Please enter your name.' }),
    email: z.string().trim().email({ message: 'Please enter a valid email address.' }),
    phone: z.string().trim().optional(),
});
type GateValues = z.infer<typeof gateSchema>;

const homeTypeOptions = [
    { value: 'Detached', label: 'Detached' },
    { value: 'Semi-Detached', label: 'Semi-Detached' },
    { value: 'Townhouse', label: 'Townhouse' },
    { value: 'Condo Apartment', label: 'Condo Apartment' },
]

const squareFootageOptions = [
    { value: '600', label: '< 700' },
    { value: '900', label: '700 - 1,100' },
    { value: '1300', label: '1,100 - 1,500' },
    { value: '1750', label: '1,500 - 2,000' },
    { value: '2250', 'label': '2,000 - 2,500' },
    { value: '2750', label: '2,500 - 3,000' },
    { value: '3250', label: '3,000 - 3,500' },
    { value: '4250', label: '3,500 - 5,000' },
    { value: '5500', label: '5,000 +' },
]

const yearBuiltOptions = [
    { value: '2', label: '0-5 years' },
    { value: '10', label: '6-15 years' },
    { value: '23', label: '16-30 years' },
    { value: '40', label: '31-50 years' },
    { value: '75', label: '51-99 years' },
    { value: '100', label: '100+ years' },
]

const finishedBasementOptions = [
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' },
]

/** Defaults for the optional fields so the AI flow always receives a complete object. */
const OPTIONAL_DEFAULTS = {
  bedroomsBelowGrade: 0,
  yearBuilt: '23',
  renovated: false,
  finishedBasement: 'false',
  garageSpaces: 1,
  parkingSpaces: 2,
  nearbySchools: '',
} as const;

const googleMapsLibraries = ["places"] as ("places")[];

const money = (n: number) => `$${Math.round(n).toLocaleString('en-CA')}`;
const round5k = (n: number) => Math.round(n / 5000) * 5000;

interface GateLead extends GateValues {
  leadId: string;
}

function HomeValuationInternal() {
  const [result, setResult] = useState<HomeValuationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gate, setGate] = useState<GateLead | null>(null);
  const [expertRequested, setExpertRequested] = useState(false);
  const [expertBusy, setExpertBusy] = useState(false);
  const [improveOpen, setImproveOpen] = useState(false);
  const { toast } = useToast();
  const guard = useFormGuard('valuation');

  // New Places API autocomplete state
  const [addressInput, setAddressInput] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.PlacePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const { suggestions: results } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        includedRegionCodes: ['ca'],
        language: 'en',
      });
      const placePredictions = results
        .map(s => s.placePrediction)
        .filter((p): p is google.maps.places.PlacePrediction => p != null);
      setSuggestions(placePredictions);
      setShowSuggestions(placePredictions.length > 0);
    } catch (err) {
      console.error('Autocomplete error:', err);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: '',
      homeType: 'Detached',
      bedroomsAboveGrade: 3,
      bathrooms: 2,
      squareFootage: '2250',
      ...OPTIONAL_DEFAULTS,
    },
  });

  useEffect(() => {
    form.setValue('address', addressInput);
  }, [addressInput, form]);

  const gateForm = useForm<GateValues>({
    resolver: zodResolver(gateSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const currentYear = new Date().getFullYear();
      const submissionValues = {
        ...values,
        squareFootage: Number(values.squareFootage),
        yearBuilt: currentYear - Number(values.yearBuilt),
        finishedBasement: values.finishedBasement === 'true',
      };

      const valuationResult = await getHomeValuation(submissionValues);
      setResult(valuationResult);
      setImproveOpen(false);

      // Using the tool is not a lead: GA4 valuation_tool_used + the Secondary Ads action only.
      trackValuationSubmission({
        address: values.address,
        homeType: values.homeType,
      });

    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unexpected error occurred during valuation.');
    } finally {
      setIsLoading(false);
    }
  }

  /** Property details as stored on the lead and shown to Ken. */
  function propertyRecord() {
    const formValues = form.getValues();
    const squareFootageLabel = squareFootageOptions.find(opt => opt.value === formValues.squareFootage)?.label;
    const yearBuiltLabel = yearBuiltOptions.find(opt => opt.value === formValues.yearBuilt)?.label;
    const finishedBasementLabel = finishedBasementOptions.find(opt => opt.value === formValues.finishedBasement)?.label;
    return {
      address: formValues.address,
      property: {
        'Home type': formValues.homeType,
        'Bedrooms (above grade)': formValues.bedroomsAboveGrade,
        'Bedrooms (below grade)': formValues.bedroomsBelowGrade,
        'Bathrooms': formValues.bathrooms,
        'Square footage': squareFootageLabel ?? '',
        'Age of home': yearBuiltLabel ?? '',
        'Recently renovated': formValues.renovated ? 'Yes' : 'No',
        'Finished basement': finishedBasementLabel ?? '',
        'Garage spaces': formValues.garageSpaces,
        'Parking spaces': formValues.parkingSpaces,
        'Nearby schools': formValues.nearbySchools || '',
      },
    };
  }

  /** Gate: contact details unlock the exact figure. Stores a `valuation-gated` lead. */
  async function onGateSubmit(values: GateValues) {
    gateForm.clearErrors();
    try {
        const { address, property } = propertyRecord();
        const res = await submitLead({
            type: 'valuation',
            name: values.name,
            email: values.email,
            phone: values.phone || undefined,
            address,
            estimate: result?.valuation,
            confidence: result?.confidenceScore,
            property,
            source: 'valuation-gated',
            page: typeof window !== 'undefined' ? window.location.pathname : undefined,
            ...(await guard.guardPayload()),
        });
        if (!res.ok) throw new Error(res.error);

        // Held and test leads never count as conversions.
        if (res.track) {
            trackExpertOpinionRequest({ name: values.name, email: values.email, source: 'valuation-gated', leadId: res.leadId });
        }
        setGate({ ...values, leadId: res.leadId });
    } catch (e) {
        console.error("Error submitting valuation gate: ", e);
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: "There was a problem submitting your information. Please try again.",
        });
    }
  }

  /** Optional follow-on: a full written expert opinion (CMA), reusing the gate contact details. */
  async function requestExpertOpinion() {
    if (!gate) return;
    setExpertBusy(true);
    try {
        const { address, property } = propertyRecord();
        const res = await submitLead({
            type: 'valuation',
            name: gate.name,
            email: gate.email,
            phone: gate.phone || undefined,
            address,
            estimate: result?.valuation,
            confidence: result?.confidenceScore,
            property,
            message: 'Requested a full expert opinion (comparative market analysis) after the gated estimate.',
            source: 'valuation-expert-opinion',
            page: typeof window !== 'undefined' ? window.location.pathname : undefined,
            ...(await guard.guardPayload()),
        });
        if (!res.ok) throw new Error(res.error);
        if (res.track) {
            trackExpertOpinionRequest({ name: gate.name, email: gate.email, source: 'valuation-expert-opinion', leadId: res.leadId });
        }
        setExpertRequested(true);
        toast({
            title: "Request Sent!",
            description: "Thank you for your interest. Ken Finch will be in touch shortly.",
        });
    } catch (e) {
        console.error("Error requesting expert opinion: ", e);
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: "There was a problem submitting your request. Please try again.",
        });
    } finally {
        setExpertBusy(false);
    }
  }

  function reset() {
    setResult(null);
    setGate(null);
    setExpertRequested(false);
    setImproveOpen(false);
    setAddressInput('');
    form.reset();
    gateForm.reset();
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAddressInput(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSelect = (prediction: google.maps.places.PlacePrediction) => async () => {
    const description = prediction.text.text;
    setAddressInput(description);
    setSuggestions([]);
    setShowSuggestions(false);

    try {
      // Get place details (location) using new Places API
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ['location', 'formattedAddress'] });
      const location = place.location;

      if (location) {
        // Use new Nearby Search to find schools
        try {
          const { places: nearbyPlaces } = await google.maps.places.Place.searchNearby({
            fields: ['displayName'],
            locationRestriction: {
              center: { lat: location.lat(), lng: location.lng() },
              radius: 2000,
            },
            includedPrimaryTypes: ['school'],
            maxResultCount: 5,
            rankPreference: google.maps.places.SearchNearbyRankPreference.POPULARITY,
          });

          if (nearbyPlaces && nearbyPlaces.length > 0) {
            const schoolNames = nearbyPlaces
              .map(p => p.displayName)
              .filter(Boolean)
              .join(', ');
            form.setValue('nearbySchools', schoolNames);
          }
        } catch (schoolError) {
          console.error("Error fetching nearby schools:", schoolError);
        }
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  const renderSuggestions = () => (
    <div className="absolute z-10 w-full bg-white rounded-md shadow-lg mt-1">
      {suggestions.map((prediction, index) => {
        const mainText = prediction.mainText?.text || '';
        const secondaryText = prediction.secondaryText?.text || '';
        return (
          <div
            key={prediction.placeId || index}
            onClick={handleSelect(prediction)}
            className="p-2 hover:bg-gray-100 cursor-pointer"
          >
            <strong>{mainText}</strong> <small>{secondaryText}</small>
          </div>
        );
      })}
    </div>
  );

  /** Optional details, shown collapsed after the first estimate. */
  const improveSection = (
    <Collapsible open={improveOpen} onOpenChange={setImproveOpen} className="rounded-lg border">
      <CollapsibleTrigger asChild>
        <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold" data-testid="valuation-improve-toggle">
          <span>Improve my estimate <span className="font-normal text-muted-foreground">(optional details)</span></span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', improveOpen && 'rotate-180')} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4">
        <Form {...form}>
          <form {...guard.formEventHandlers} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="bedroomsBelowGrade"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Bedrooms (Below Grade)</FormLabel>
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
                      <FormLabel>Age of Home</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select the age range of the home" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {yearBuiltOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="finishedBasement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Finished Basement</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Is the basement finished?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {finishedBasementOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                control={form.control}
                name="garageSpaces"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Total Garage Parking Spaces</FormLabel>
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
            name="parkingSpaces"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Total Parking Spaces</FormLabel>
                <FormControl>
                    <Input type="number" {...field} />
                </FormControl>
                <FormDescription>
                    Including garage and driveway.
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
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
            <Button type="submit" variant="secondary" className="w-full" disabled={isLoading}>
              <Sparkles className="mr-2 h-4 w-4" />
              Recalculate my estimate
            </Button>
          </form>
        </Form>
      </CollapsibleContent>
    </Collapsible>
  );

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
        <Button variant="link" onClick={() => {
            setError(null);
            form.reset();
        }} className="p-0 mt-2 h-auto">Try Again</Button>
      </Alert>
    );
  }

  if (result) {
    const low = round5k(result.valuation * 0.9);
    const high = round5k(result.valuation * 1.1);
    const address = form.getValues('address');
    return (
      <Card className="w-full" data-testid="valuation-result">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Your AI-Powered Home Valuation</CardTitle>
          <CardDescription>Based on the details you provided and current market data.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {!gate ? (
            <>
              <div className="text-center bg-primary/10 p-6 rounded-lg" data-testid="valuation-range">
                <p className="text-sm font-medium text-primary uppercase tracking-wider">Estimated range</p>
                <p className="text-3xl sm:text-4xl font-bold text-primary">{money(low)} &ndash; {money(high)}</p>
                <p className="mt-2 text-xs text-muted-foreground">{address}. Enter your details below to see the exact figure, the confidence score and the reasoning.</p>
              </div>

              <div className="grid gap-4" id="valuation-gate">
                <div className="text-center">
                    <h3 className="font-headline text-2xl">See your exact estimate</h3>
                    <p className="text-muted-foreground text-sm mt-1">{GATE_REASON}</p>
                </div>
                <Form {...gateForm}>
                    <form {...guard.formEventHandlers} onSubmit={gateForm.handleSubmit(onGateSubmit)} className="space-y-4" data-testid="valuation-gate-form">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                            control={gateForm.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="John Doe" autoComplete="name" {...field} className="pl-10" data-testid="valuation-gate-name" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={gateForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} className="pl-10" data-testid="valuation-gate-email" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                         <FormField
                            control={gateForm.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Phone Number (Optional)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input type="tel" placeholder="(123) 456-7890" autoComplete="tel" {...field} className="pl-10" data-testid="valuation-gate-phone" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        <HoneypotField id="hv-referral" {...guard.honeypotProps} />
                        <Button type="submit" size="lg" className="w-full" disabled={gateForm.formState.isSubmitting} data-testid="valuation-gate-submit">
                            {gateForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                            Show my exact estimate
                        </Button>
                        <p className="text-[11px] leading-relaxed text-muted-foreground text-center">
                          No obligation. {CONTACT.name}, {REAL_ESTATE.title}, {REAL_ESTATE.brokerage}.
                        </p>
                    </form>
                </Form>
              </div>
            </>
          ) : (
            <>
              <div className="text-center bg-primary/10 p-6 rounded-lg" data-testid="valuation-exact">
                <p className="text-sm font-medium text-primary uppercase tracking-wider">Estimated Value</p>
                <p className="text-5xl font-bold text-primary">
                  {money(result.valuation)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{address}</p>
              </div>
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-sm">
                  <strong>Disclaimer:</strong> This is an AI-generated estimate for informational purposes only. It is not an appraisal, and should not be relied upon for financial or legal decisions. For an accurate market valuation, contact Ken Finch directly.
                </AlertDescription>
              </Alert>
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
                    <p className="text-sm text-muted-foreground mt-1">Score reflects how closely your home&apos;s features match recent sales data in Oakville.</p>
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

              <Separator />

              {/* Expert opinion, collapsed to a one-line note now that Ken has the request. */}
              <div id="expert" className="rounded-lg border bg-muted/30 p-4 text-sm" data-testid="valuation-expert">
                {expertRequested ? (
                  <p className="flex items-start gap-2 text-green-800">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>Expert opinion requested. Ken will prepare a full comparative market analysis for {address} and follow up personally.</span>
                  </p>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-muted-foreground">
                      <span className="font-semibold text-foreground">Ken has your request.</span> He will send the three most recent sales near you and tell you if this estimate is high or low.
                    </p>
                    <Button type="button" variant="outline" size="sm" onClick={requestExpertOpinion} disabled={expertBusy} className="shrink-0" data-testid="valuation-expert-submit">
                      {expertBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Also request a full expert opinion
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {improveSection}
        </CardContent>
        <CardFooter className="flex-col gap-4">
           <Button variant="outline" onClick={reset} className="w-full md:w-auto">Start a New Valuation</Button>
           <p className="text-xs text-muted-foreground">This is an estimate, not a formal appraisal. Consult with Ken Finch for an expert opinion.</p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Home Details</CardTitle>
        <CardDescription>Five quick details for an instant estimate. You can refine it afterwards.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form {...guard.formEventHandlers} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="valuation-form">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                      <div className="relative">
                           <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input
                              {...field}
                              value={addressInput}
                              onChange={handleInput}
                              onKeyDown={(e) => {
                                // Escape closes the suggestion list so it never blocks the fields below.
                                if (e.key === 'Escape') {
                                  setShowSuggestions(false);
                                  setSuggestions([]);
                                }
                              }}
                              onBlur={() => {
                                field.onBlur();
                                // Delay so a click on a suggestion registers before the list closes.
                                setTimeout(() => setShowSuggestions(false), 150);
                              }}
                              onFocus={() => {
                                if (suggestions.length > 0) setShowSuggestions(true);
                              }}
                              autoComplete="off"
                              placeholder="e.g., 123 Maple Street, Oakville, ON"
                              className="pl-10"
                          />
                           {showSuggestions && renderSuggestions()}
                      </div>
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="homeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a home type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {homeTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4 md:gap-6">
                <FormField
                control={form.control}
                name="bedroomsAboveGrade"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Bedrooms (Above Grade)</FormLabel>
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
            </div>

            <FormField
                control={form.control}
                name="squareFootage"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Square Footage</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a square footage range" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {squareFootageOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate My Home Valuation
            </Button>
            <p className="text-[11px] leading-relaxed text-muted-foreground text-center">
              Free, instant, no obligation. {CONTACT.name}, {REAL_ESTATE.title}, {REAL_ESTATE.brokerage}.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

const HomeValuation = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: googleMapsLibraries,
  });

  if (loadError) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Map Error</AlertTitle>
            <AlertDescription>Could not load Google Maps service. Please check your API key and configuration.</AlertDescription>
        </Alert>
    );
  }

  if (!isLoaded) {
     return (
      <Card className="flex flex-col items-center justify-center p-10 min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading valuation tool...</p>
      </Card>
    );
  }

  return <HomeValuationInternal />;
}

export { HomeValuation };
