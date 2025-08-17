
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import ReactMarkdown from 'react-markdown';

import { auth, db } from '@/lib/firebase';
import { chat, type ChatInput, type ChatOutput } from '@/ai/flows/chatbot-flow';
import type { HomeValuationOutput, HomeValuationInput } from '@/ai/flows/home-valuation';
import { cn } from '@/lib/utils';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ClipboardCheck, Sparkles, Loader2, RefreshCw, Send, MessageSquare, Home } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from "@/components/ui/scroll-area";

interface Task {
    id: string;
    label: string;
    checked: boolean;
}

interface Valuation extends HomeValuationOutput {
    id: string;
    createdAt: string;
    inputs: HomeValuationInput & { yearBuilt: string, finishedBasement: string };
}

const ValuationDetailsDialog = ({ valuation }: { valuation: Valuation | null }) => {
    if (!valuation) {
        return null;
    }
    
    const squareFootageRanges: {[key: string]: string} = {
        '600': '< 700', '900': '700 - 1,100', '1300': '1,100 - 1,500', '1750': '1,500 - 2,000',
        '2250': '2,000 - 2,500', '2750': '2,500 - 3,000', '3250': '3,000 - 3,500', '4250': '3,500 - 5,000', '5500': '5,000 +',
    };
    const yearBuiltRanges: {[key: string]: string} = {
        '2': '0-5 years', '10': '6-15 years', '23': '16-30 years', '40': '31-50 years', '75': '51-99 years', '100': '100+ years',
    };
    const displaySquareFootage = squareFootageRanges[String(valuation.inputs.squareFootage)] || `${valuation.inputs.squareFootage} sq ft`;
    const displayYearBuilt = yearBuiltRanges[String(valuation.inputs.yearBuilt)] || `${valuation.inputs.yearBuilt}`;
    const displayFinishedBasement = valuation.inputs.finishedBasement === 'true' ? 'Yes' : 'No';


    return (
        <Dialog>
            <DialogTrigger asChild>
                 <Button variant="outline" size="sm">View & Update</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle className="font-headline">Your AI Valuation Details</DialogTitle>
                    <DialogDescription>
                        Generated on {valuation.createdAt}. Review the details that contributed to your estimate.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <p className="text-sm font-medium text-primary uppercase tracking-wider">Estimated Value</p>
                        <p className="text-4xl font-bold text-primary">${valuation.valuation.toLocaleString()}</p>
                        <Badge variant="outline" className="mt-1">Confidence: {Math.round(valuation.confidenceScore * 100)}%</Badge>
                    </div>
                     <Separator />
                    <div>
                        <h4 className="font-semibold text-lg">Valuation Reasoning</h4>
                        <p className="text-sm text-muted-foreground prose prose-sm">{valuation.reasoning}</p>
                    </div>
                     <Separator />
                    <div>
                        <h4 className="font-semibold text-lg">Your Provided Inputs</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-2">
                            <p><strong>Address:</strong> {valuation.inputs.address}</p>
                            <p><strong>Home Type:</strong> {valuation.inputs.homeType}</p>
                            <p><strong>Bedrooms (Above Grade):</strong> {valuation.inputs.bedroomsAboveGrade}</p>
                            <p><strong>Bedrooms (Below Grade):</strong> {valuation.inputs.bedroomsBelowGrade}</p>
                            <p><strong>Bathrooms:</strong> {valuation.inputs.bathrooms}</p>
                            <p><strong>Square Footage:</strong> {displaySquareFootage}</p>
                            <p><strong>Age of Home:</strong> {displayYearBuilt}</p>
                            <p><strong>Renovated:</strong> {valuation.inputs.renovated ? 'Yes' : 'No'}</p>
                            <p><strong>Finished Basement:</strong> {displayFinishedBasement}</p>
                            <p><strong>Garage Spaces:</strong> {valuation.inputs.garageSpaces}</p>
                            <p><strong>Total Parking:</strong> {valuation.inputs.parkingSpaces}</p>
                            <p className="col-span-2"><strong>Nearby Schools:</strong> {valuation.inputs.nearbySchools}</p>
                        </div>
                    </div>
                </div>
                 <Button asChild size="lg">
                    <Link href="/#valuation-tool">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Generate a New Valuation
                    </Link>
                </Button>
            </DialogContent>
        </Dialog>
    )
}

const TaskItem = ({ id, label, checked, onCheckedChange }: { id: string; label: string; checked: boolean, onCheckedChange: (checked: boolean) => void }) => (
    <div className="flex items-center space-x-3">
        <Checkbox 
            id={id} 
            checked={checked}
            onCheckedChange={onCheckedChange}
        />
        <label htmlFor={id} className={`text-sm ${checked ? 'text-muted-foreground line-through' : 'font-medium'}`}>
            {label}
        </label>
    </div>
);

const initialPrepTasks = [
    { id: "declutter", label: "Declutter living spaces", checked: false },
    { id: "repairs", label: "Complete minor repairs", checked: false },
    { id: "deepclean", label: "Deep clean entire house", checked: false },
    { id: "staging", label: "Stage home with professional guidance", checked: false },
    { id: "painting", label: "Touch-up painting", checked: false },
    { id: "landscaping", label: "Exterior landscaping & curb appeal", checked: false },
    { id: "furniture", label: "Remove excess furniture", checked: false },
    { id: "documents", label: "Provide Property Tax & Utility Bills", checked: false },
    { id: "maintenance", label: "Service HVAC, plumbing & electrical", checked: false },
];

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const chatFormSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
});

const Chatbot = () => {
    const [user] = useAuthState(auth);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const form = useForm<z.infer<typeof chatFormSchema>>({
        resolver: zodResolver(chatFormSchema),
        defaultValues: {
        message: '',
        },
    });

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollableView = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if(scrollableView) {
                scrollableView.scrollTop = scrollableView.scrollHeight;
            }
        }
    }, [messages, isLoading]);

    async function onSubmit(values: z.infer<typeof chatFormSchema>) {
        if (!user) return;
        setIsLoading(true);
        const userMessage: ChatMessage = { id: nanoid(), role: 'user', text: values.message };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        form.reset();

        try {
            const chatHistory = newMessages.map(msg => ({
                role: msg.role,
                content: [{ text: msg.text }]
            }));

            const chatInput: ChatInput = {
                userId: user.uid,
                message: values.message,
                history: chatHistory.slice(0, -1),
            };

            const result: ChatOutput = await chat(chatInput);

            const assistantMessage: ChatMessage = {
                id: nanoid(),
                role: 'model',
                text: result.message,
            };
            setMessages((prev) => [...prev, assistantMessage]);

        } catch (error) {
            console.error('Error fetching chat response:', error);
            const errorMessage: ChatMessage = {
                id: nanoid(),
                role: 'model',
                text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
         <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-primary" /> AI Seller Assistant
                </CardTitle>
                <CardDescription>Your guide to preparing your home for sale. Ask me anything!</CardDescription>
            </CardHeader>
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                {messages.map((message) => (
                    <div
                    key={message.id}
                    className={cn(
                        'flex items-start gap-3',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                    >
                    {message.role === 'model' && (
                        <Avatar className="h-8 w-8">
                        <AvatarImage src="/kf_logo.png" alt="Ken Finch Logo" />
                        <AvatarFallback>KF</AvatarFallback>
                        </Avatar>
                    )}
                    <div
                        className={cn(
                        'max-w-prose rounded-lg p-3 text-sm prose prose-sm',
                        message.role === 'user'
                            ? 'bg-primary text-primary-foreground prose-invert'
                            : 'bg-muted'
                        )}
                    >
                        {message.role === 'model' ? (
                        <ReactMarkdown
                                components={{
                                    ul: ({node, ...props}) => <ul className="list-disc pl-5" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal pl-5" {...props} />,
                                }}
                            >
                                {message.text}
                            </ReactMarkdown>
                        ) : (
                            message.text
                        )}
                    </div>
                    {message.role === 'user' && (
                        <Avatar className="h-8 w-8">
                        <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="/kf_logo.png" alt="Ken Finch Logo" />
                        <AvatarFallback>KF</AvatarFallback>
                    </Avatar>
                    <div className="max-w-md rounded-lg p-3 text-sm bg-muted">
                        <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                    </div>
                )}
                </div>
            </ScrollArea>
            <CardFooter className="pt-6">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full items-center gap-2">
                    <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                        <FormControl>
                            <Input placeholder="Ask a question..." {...field} disabled={isLoading} autoComplete="off" />
                        </FormControl>
                        </FormItem>
                    )}
                    />
                    <Button type="submit" disabled={isLoading} size="icon">
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                    </Button>
                </form>
                </Form>
            </CardFooter>
        </Card>
    )
}

export default function DashboardPage() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [valuation, setValuation] = useState<Valuation | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Setup tasks for new users
    useEffect(() => {
        if (!user) return;
    
        const syncTasks = async () => {
            const tasksCollection = collection(db, 'users', user.uid, 'tasks');
            const snapshot = await getDocs(tasksCollection);
            const existingTaskIds = new Set(snapshot.docs.map(doc => doc.id));
            
            const missingTasks = initialPrepTasks.filter(task => !existingTaskIds.has(task.id));
    
            if (missingTasks.length > 0) {
                const batch = writeBatch(db);
                missingTasks.forEach(task => {
                    const docRef = doc(tasksCollection, task.id);
                    batch.set(docRef, { label: task.label, checked: task.checked });
                });
                await batch.commit();
            }
        };
    
        syncTasks();
    }, [user]);

    // Listen for task changes
    useEffect(() => {
        if (!user) return;
        const tasksCollection = collection(db, 'users', user.uid, 'tasks');
        const unsubscribe = onSnapshot(tasksCollection, (snapshot) => {
            const userTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
            const orderedTasks = initialPrepTasks.map(initialTask => 
                userTasks.find(userTask => userTask.id === initialTask.id) || { ...initialTask, label: initialTask.label }
            ).filter(Boolean) as Task[];

            setTasks(orderedTasks);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    // Fetch latest valuation
    useEffect(() => {
        if (!user) return;
        const valuationsCollection = collection(db, 'users', user.uid, 'valuations');
        const q = query(valuationsCollection, orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
             if (!snapshot.empty) {
                const latestValuationDoc = snapshot.docs[0];
                const data = latestValuationDoc.data();
                const createdAt = data.createdAt as Timestamp;
                setValuation({ 
                    id: latestValuationDoc.id,
                    ...data,
                    createdAt: createdAt ? createdAt.toDate().toLocaleDateString() : 'N/A',
                } as Valuation);
            }
        });

        return () => unsubscribe();
    }, [user]);


    const handleTaskCheckedChange = async (taskId: string, checked: boolean) => {
        if (!user) return;
        const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
        await updateDoc(taskRef, { checked });
    };

    if (loading || isLoading) {
         return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const completedTasks = tasks.filter(task => task.checked).length;
    const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    return (
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:grid-cols-3">
            <div className="grid gap-4 lg:col-span-2">
                 <div className="grid gap-4 sm:grid-cols-2">
                    <Card className="sm:col-span-2">
                        <CardHeader className="pb-4">
                            <CardTitle className="font-headline">Welcome, {user?.email}!</CardTitle>
                            <CardDescription>Here's a snapshot of your home selling journey.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Home className="h-4 w-4" />
                                <span>Your Selling Dashboard</span>
                            </div>
                        </CardContent>
                    </Card>
                    {valuation && (
                        <Card className="sm:col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary"/> AI Home Valuation
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-semibold text-2xl">${valuation.valuation.toLocaleString()}</p>
                                <p className="text-sm text-muted-foreground">Generated on {valuation.createdAt}</p>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center">
                                <Badge variant="outline">Confidence: {Math.round(valuation.confidenceScore * 100)}%</Badge>
                                <ValuationDetailsDialog valuation={valuation} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardCheck className="h-6 w-6 text-primary" /> Pre-Listing Prep Tracker
                        </CardTitle>
                        <CardDescription>
                            Follow these steps to get your home market-ready.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-muted-foreground">Progress</span>
                                <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} aria-label={`${progress}% complete`} />
                        </div>
                        <Separator />
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {tasks.map(task => (
                                <TaskItem 
                                    key={task.id} 
                                    {...task} 
                                    onCheckedChange={(checked) => handleTaskCheckedChange(task.id, checked)}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
             <div className="lg:col-span-1">
                <Chatbot />
            </div>
        </div>
    )
}

    
