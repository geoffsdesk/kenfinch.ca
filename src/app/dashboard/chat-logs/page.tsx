
"use client";

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Calendar, User, Bot, MessageSquare } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ChatLog {
  id: string;
  userId: string;
  userMessage: string;
  modelResponse: string;
  createdAt: string;
}

export default function ChatLogsPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchLogs = async () => {
      try {
        const logsCollection = collection(db, 'chatbot_logs');
        const q = query(logsCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const logsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt as Timestamp;
            return {
                id: doc.id,
                userId: data.userId,
                userMessage: data.userMessage,
                modelResponse: data.modelResponse,
                createdAt: createdAt ? createdAt.toDate().toLocaleString() : 'N/A',
            };
        });
        setLogs(logsData);
      } catch (error) {
        console.error("Error fetching chat logs: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chatbot Conversation Logs</CardTitle>
        <CardDescription>Review interactions between users and the AI assistant. Logs are kept for 30 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {logs.length > 0 ? (
            logs.map((log) => (
              <AccordionItem value={log.id} key={log.id}>
                <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4 text-sm">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-xs">{log.userId.substring(0, 8)}...</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{log.createdAt}</span>
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                   <div className="space-y-4 p-4 bg-muted/50 rounded-md">
                        <div className="flex gap-3">
                            <User className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                            <div className="flex-1">
                                <p className="font-semibold">User</p>
                                <p className="text-muted-foreground">{log.userMessage}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                             <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                             <div className="flex-1">
                                <p className="font-semibold">Assistant</p>
                                <p className="text-muted-foreground">{log.modelResponse}</p>
                            </div>
                        </div>
                   </div>
                </AccordionContent>
              </AccordionItem>
            ))
          ) : (
             <div className="text-center h-24 flex items-center justify-center">
                No chat logs found.
             </div>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}
