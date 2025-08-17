
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ClipboardCheck, Camera, CalendarDays, Home, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { HomeValuationOutput, HomeValuationInput } from '@/ai/flows/home-valuation';

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
    { id: "deepclean", label: "Deep clean entire house", checked: false },
    { id: "painting", label: "Touch-up painting", checked: false },
    { id: "repairs", label: "Complete minor repairs", checked: false },
    { id: "staging", label: "Stage home with professional guidance", checked: false },
];


export default function DashboardPage() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [valuation, setValuation] = useState<Valuation | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Setup tasks for new users
    useEffect(() => {
        if (!user) return;

        const setupTasks = async () => {
            const tasksCollection = collection(db, 'users', user.uid, 'tasks');
            const snapshot = await getDocs(tasksCollection);
            if (snapshot.empty) {
                const batch = writeBatch(db);
                initialPrepTasks.forEach(task => {
                    const docRef = doc(tasksCollection, task.id);
                    batch.set(docRef, { label: task.label, checked: task.checked });
                });
                await batch.commit();
            }
        };

        setupTasks();
    }, [user]);

    // Listen for task changes
    useEffect(() => {
        if (!user) return;
        const tasksCollection = collection(db, 'users', user.uid, 'tasks');
        const unsubscribe = onSnapshot(tasksCollection, (snapshot) => {
            const userTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
            // Keep a stable order
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
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:col-span-2 xl:col-span-3">
                <Card className="sm:col-span-1 md:col-span-3">
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
                    <Card className="lg:col-span-1 xl:col-span-1">
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
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl flex items-center gap-2">
                           <Camera className="h-5 w-5 text-primary"/> Photo & Video Shoot
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold text-lg">July 25, 2024 - 10:00 AM</p>
                        <p className="text-sm text-muted-foreground">Photographer: Jane Doe</p>
                    </CardContent>
                     <CardFooter>
                        <Badge variant="outline">Confirmed</Badge>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl flex items-center gap-2">
                           <CalendarDays className="h-5 w-5 text-primary"/> Open House Schedule
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p className="font-semibold text-lg">July 27-28, 2024</p>
                       <p className="text-sm text-muted-foreground">1:00 PM - 4:00 PM</p>
                    </CardContent>
                    <CardFooter>
                        <Badge>Upcoming</Badge>
                    </CardFooter>
                </Card>
            </div>
            <Card className="lg:col-span-2 xl:col-span-3">
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
    )
}

    