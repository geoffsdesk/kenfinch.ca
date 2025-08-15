
"use client";

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, serverTimestamp, doc, writeBatch } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useToast } from '@/hooks/use-toast';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

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
import { Loader2, AlertCircle, Sparkles, TrendingUp, ShieldCheck, User, Mail, Phone, MapPin } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from './ui/separator';

const formSchema = z.object({
  address: z.string().min(10, { message: 'Please enter a valid street address.' }),
  homeType: z.string({ required_error: 'Please select a home type.' }),
  bedroomsAboveGrade: z.coerce.number().int().min(0, { message: 'Cannot be negative.' }),
  bedroomsBelowGrade: z.coerce.number().int().min(0, { message: 'Cannot be negative.' }),
  bathrooms: z.coerce.number().min(1, { message: 'Must have at least 1 bathroom.' }),
  squareFootage: z.string({ required_error: 'Please select a square footage range.' }),
  yearBuilt: z.string({ required_error: 'Please select the age of the home.' }),
  renovated: z.boolean().default(false),
  finishedBasement: z.string({ required_error: 'Please select an option.' }),
  garageSpaces: z.coerce.number().int().min(0, { message: 'Cannot be negative.' }),
  parkingSpaces: z.coerce.number().int().min(0, { message: 'Cannot be negative.' }),
  nearbySchools: z.string().min(10, { message: 'Please describe nearby schools.' }),
}).refine(data => data.bedroomsAboveGrade + data.bedroomsBelowGrade > 0, {
    message: "Total number of bedrooms must be at least 1.",
    path: ["bedroomsAboveGrade"],
}).refine(data => data.garageSpaces <= data.parkingSpaces, {
    message: "Garage spaces cannot exceed total parking spaces.",
    path: ["garageSpaces"],
});

const contactSchema = z.object({
    name: z.string().min(2, { message: 'Please enter your name.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    phone: z.string().optional(),
});

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

export function HomeValuation() {
  const [result, setResult] = useState<HomeValuationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const { toast } = useToast();
  const [user] = useAuthState(auth);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: '',
      homeType: 'Detached',
      bedroomsAboveGrade: 3,
      bedroomsBelowGrade: 1,
      bathrooms: 2,
      squareFootage: '2250',
      yearBuilt: '23',
      renovated: false,
      finishedBasement: 'true',
      garageSpaces: 2,
      parkingSpaces: 2,
      nearbySchools: '',
    },
  });

  const contactForm = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
       const rawInputs = {
        ...values,
        squareFootage: Number(values.squareFootage),
        yearBuilt: values.yearBuilt, // Keep the original string value for storing
      };
      
      const valuationResult = await getHomeValuation(submissionValues);
      setResult(valuationResult);

      if (user) {
        const valuationRef = doc(collection(db, 'users', user.uid, 'valuations'));
        await writeBatch(db).set(valuationRef, {
            ...valuationResult,
            inputs: rawInputs,
            createdAt: serverTimestamp(),
        }).commit();

        toast({
            title: "Valuation Saved",
            description: "Your home valuation has been saved to your dashboard.",
        });
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unexpected error occurred during valuation.');
    } finally {
      setIsLoading(false);
    }
  }

  async function onContactSubmit(values: z.infer<typeof contactSchema>) {
    contactForm.clearErrors();
    try {
        await addDoc(collection(db, "contacts"), {
            ...values,
            submittedAt: serverTimestamp(),
        });
        setContactSubmitted(true);
    } catch (e) {
        console.error("Error adding document: ", e);
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: "There was a problem submitting your information. Please try again.",
        });
    }
  }

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address) {
        form.setValue('address', place.formatted_address);
      }
    }
  };


  if (isLoading) {
    return (
      <Card className="flex flex-col items-center justify-center p-10 min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Generating your valuation...</p>
      </Card>
    );
  }

  if (loadError) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Map Error</AlertTitle>
            <AlertDescription>Could not load Google Maps service. Please check your API key and configuration.</AlertDescription>
        </Alert>
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

            <Separator />

            {contactSubmitted ? (
                 <div className="text-center p-6 bg-green-50 rounded-lg">
                    <h3 className="text-xl font-semibold text-green-800">Thank You!</h3>
                    <p className="text-green-700 mt-2">Ken Finch will be in touch shortly to discuss your expert valuation.</p>
                 </div>
            ) : (
                <div className="grid gap-4">
                    <div className="text-center">
                        <h3 className="font-headline text-2xl">Ready for an Expert Opinion?</h3>
                        <p className="text-muted-foreground">This is an estimate. For a precise valuation, contact Ken Finch directly.</p>
                    </div>
                    <Form {...contactForm}>
                        <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                control={contactForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="John Doe" {...field} className="pl-10" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={contactForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input type="email" placeholder="you@example.com" {...field} className="pl-10" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>
                             <FormField
                                control={contactForm.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Phone Number (Optional)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="(123) 456-7890" {...field} className="pl-10" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <Button type="submit" size="lg" className="w-full" disabled={contactForm.formState.isSubmitting}>
                                {contactForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Contact Ken Finch for an Expert Opinion
                            </Button>
                        </form>
                    </Form>
                </div>
            )}


        </CardContent>
        <CardFooter className="flex-col gap-4">
           <Button variant="outline" onClick={() => { setResult(null); form.reset(); setContactSubmitted(false); }} className="w-full md:w-auto">Start a New Valuation</Button>
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
            {isLoaded && (
                 <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                            <Autocomplete
                                onLoad={(autocomplete) => {
                                    autocompleteRef.current = autocomplete;
                                }}
                                onPlaceChanged={handlePlaceChanged}
                                options={{
                                    componentRestrictions: { country: "ca" },
                                    fields: ["formatted_address"],
                                }}
                            >
                                <div className="relative">
                                     <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                     <Input 
                                        placeholder="e.g., 123 Maple Street, Oakville, ON" 
                                        {...field} 
                                        className="pl-10"
                                    />
                                </div>
                            </Autocomplete>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

            <Button type="submit" size="lg" className="w-full" disabled={isLoading || !isLoaded}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate My Home Valuation
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
