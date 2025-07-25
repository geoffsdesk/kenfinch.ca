
"use client";

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Camera, CalendarDays, Home, Sparkles, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { HomeValuationOutput } from '@/ai/flows/home-valuation';

interface Task {
    id: string;
    label: string;
    checked: boolean;
}

interface Valuation extends HomeValuationOutput {
    id: string;
    createdAt: string;
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
                         <CardFooter>
                            <Badge variant="outline">Confidence: {Math.round(valuation.confidenceScore * 100)}%</Badge>
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
