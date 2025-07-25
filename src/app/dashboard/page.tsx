import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Camera, CalendarDays, Home } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const TaskItem = ({ id, label, checked }: { id: string; label: string; checked: boolean }) => (
    <div className="flex items-center space-x-3">
        <Checkbox id={id} checked={checked} />
        <label htmlFor={id} className={`text-sm ${checked ? 'text-muted-foreground line-through' : 'font-medium'}`}>
            {label}
        </label>
    </div>
);


export default function DashboardPage() {
    const prepTasks = [
        { id: "declutter", label: "Declutter living spaces", checked: true },
        { id: "deepclean", label: "Deep clean entire house", checked: true },
        { id: "painting", label: "Touch-up painting", checked: true },
        { id: "repairs", label: "Complete minor repairs", checked: false },
        { id: "staging", label: "Stage home with professional guidance", checked: false },
    ];

    const completedTasks = prepTasks.filter(task => task.checked).length;
    const progress = (completedTasks / prepTasks.length) * 100;

    return (
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:col-span-2 xl:col-span-3">
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="font-headline">Welcome, Seller!</CardTitle>
                        <CardDescription>Here's a snapshot of your home selling journey.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Home className="h-4 w-4" />
                            <span>123 Maple Street, Oakville, ON</span>
                        </div>
                    </CardContent>
                </Card>
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
                        {prepTasks.map(task => (
                            <TaskItem key={task.id} {...task} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
