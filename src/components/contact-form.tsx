
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { submitLead } from '@/lib/leads/client';
import { trackContactFormSubmission } from '@/lib/analytics';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, User, Mail, Phone } from 'lucide-react';

const contactSchema = z.object({
    name: z.string().min(2, { message: 'Please enter your name.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    phone: z.string().optional(),
    intent: z.string().optional(),
    message: z.string().optional(),
});


export function ContactForm() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      intent: '',
      message: '',
    },
  });

  async function onContactSubmit(values: z.infer<typeof contactSchema>) {
    form.clearErrors();
    try {
        // Unified lead pipeline: Firestore + Ken email (BCC oversight) +
        // confirmation to the sender + 48h check-in scheduling.
        const res = await submitLead({
            type: 'contact',
            name: values.name,
            email: values.email,
            phone: values.phone || undefined,
            intent: values.intent || undefined,
            message: values.message || undefined,
            source: 'contact-form',
            page: typeof window !== 'undefined' ? window.location.pathname : undefined,
        });
        if (!res.ok) throw new Error(res.error);

        // 3. Fire conversion tracking across all pixels
        trackContactFormSubmission({
            name: values.name,
            email: values.email,
            phone: values.phone,
        });

        form.reset();
        toast({
            title: "Message Sent!",
            description: "Thank you for reaching out. Ken Finch will be in touch shortly.",
        });
    } catch (e) {
        console.error("Error submitting form: ", e);
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: "There was a problem submitting your information. Please try again.",
        });
    }
  }

  return (
    <Card>
        <CardContent className="pt-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onContactSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
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
                        control={form.control}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
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
                        <FormField
                        control={form.control}
                        name="intent"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>How can Ken help?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an option..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Buying my first home">Buying my first home</SelectItem>
                                    <SelectItem value="Buying (moving up or relocating)">Buying (moving up or relocating)</SelectItem>
                                    <SelectItem value="Mortgage pre-approval">Mortgage pre-approval</SelectItem>
                                    <SelectItem value="Refinance or renewal">Refinance or renewal</SelectItem>
                                    <SelectItem value="Buying and selling">Buying and selling</SelectItem>
                                    <SelectItem value="Selling my home">Selling my home</SelectItem>
                                    <SelectItem value="Investment property">Investment property</SelectItem>
                                    <SelectItem value="Other question">Other question</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                        <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Message (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Tell Ken a bit about your situation: your timeline, budget, areas you like, or anything else he should know."
                                    className="min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Send Message
                    </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
