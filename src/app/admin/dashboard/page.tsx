
"use client";

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, query, orderBy, Timestamp, limit, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Mail, Phone, Calendar, User, Bot, Eye, MessageSquare, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { HomeValuationOutput, HomeValuationInput } from '@/ai/flows/home-valuation';

// Contacts Component
interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  submittedAt: string;
}

const ContactsTab = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const contactsCollection = collection(db, 'contacts');
    // Removed orderBy to prevent query failure without a composite index
    const q = query(contactsCollection);
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const contactsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const submittedAt = data.submittedAt as Timestamp;
            return {
                id: doc.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                submittedAt: submittedAt ? submittedAt.toDate().toLocaleString() : 'N/A',
            };
        });
        setContacts(contactsData);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching contacts: ", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Leads</CardTitle>
        <CardDescription>
          These are potential clients who have submitted their information through the contact or valuation forms on your website. They represent new leads that may require follow-up.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell><div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" />{contact.submittedAt}</div></TableCell>
                  <TableCell className="font-medium"><div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />{contact.name}</div></TableCell>
                  <TableCell><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a></div></TableCell>
                  <TableCell>
                    {contact.phone ? (<div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><a href={`tel:${contact.phone}`} className="hover:underline">{contact.phone}</a></div>) : (<span className="text-muted-foreground">N/A</span>)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4} className="text-center h-24">No one has contacted you yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// Sellers Component
interface Seller {
  id: string;
  email: string;
  createdAt: string;
}

interface Valuation extends HomeValuationOutput {
    id: string;
    inputs: Omit<HomeValuationInput, 'yearBuilt' | 'finishedBasement'> & { yearBuilt: string; finishedBasement: string };
    createdAt: Timestamp;
}

const ValuationDetails = ({ valuation }: { valuation: Valuation | null }) => {
    if (!valuation) {
        return <p>No valuation data available for this seller.</p>;
    }
    const squareFootageRanges: {[key: string]: string} = {
        '600': '< 700', '900': '700 - 1,100', '1300': '1,100 - 1,500', '1750': '1,500 - 2,000', '2250': '2,000 - 2,500', '2750': '2,500 - 3,000', '3250': '3,000 - 3,500', '4250': '3,500 - 5,000', '5500': '5,000 +',
    };
    const yearBuiltRanges: {[key: string]: string} = {
        '2': '0-5 years', '10': '6-15 years', '23': '16-30 years', '40': '31-50 years', '75': '51-99 years', '100': '100+ years',
    };
    const displaySquareFootage = squareFootageRanges[String(valuation.inputs.squareFootage)] || `${valuation.inputs.squareFootage} sq ft`;
    const displayYearBuilt = yearBuiltRanges[String(valuation.inputs.yearBuilt)] || `${valuation.inputs.yearBuilt}`;
    const displayFinishedBasement = valuation.inputs.finishedBasement === 'true' ? 'Yes' : 'No';

    return (
        <div className="space-y-4">
            <div><h4 className="font-semibold">Valuation Result</h4><p className="text-2xl font-bold text-primary">${valuation.valuation.toLocaleString()}</p><p className="text-sm text-muted-foreground">Confidence: {Math.round(valuation.confidenceScore * 100)}%</p><p className="text-xs text-muted-foreground">Generated on: {valuation.createdAt.toDate().toLocaleDateString()}</p></div>
            <div><h4 className="font-semibold">Reasoning</h4><p className="text-sm text-muted-foreground">{valuation.reasoning}</p></div>
            <div><h4 className="font-semibold">User-Provided Inputs</h4><div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-2"><p><strong>Address:</strong> {valuation.inputs.address}</p><p><strong>Home Type:</strong> {valuation.inputs.homeType}</p><p><strong>Bedrooms (Above Grade):</strong> {valuation.inputs.bedroomsAboveGrade}</p><p><strong>Bedrooms (Below Grade):</strong> {valuation.inputs.bedroomsBelowGrade}</p><p><strong>Bathrooms:</strong> {valuation.inputs.bathrooms}</p><p><strong>Square Footage:</strong> {displaySquareFootage}</p><p><strong>Age of Home:</strong> {displayYearBuilt}</p><p><strong>Renovated:</strong> {valuation.inputs.renovated ? 'Yes' : 'No'}</p><p><strong>Finished Basement:</strong> {displayFinishedBasement}</p><p><strong>Garage Spaces:</strong> {valuation.inputs.garageSpaces}</p><p><strong>Total Parking:</strong> {valuation.inputs.parkingSpaces}</p><p className="col-span-2"><strong>Nearby Schools:</strong> {valuation.inputs.nearbySchools}</p></div></div>
        </div>
    );
};

const SellerValuationDialog = ({ sellerId }: { sellerId: string }) => {
    const [valuation, setValuation] = useState<Valuation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fetchLatestValuation = () => {
        setIsLoading(true);
        const valuationsCollection = collection(db, 'users', sellerId, 'valuations');
        const q = query(valuationsCollection, orderBy('createdAt', 'desc'), limit(1));
        const unsubscribe = onSnapshot(q, (snapshot) => {
             if (!snapshot.empty) {
                const latestValuationDoc = snapshot.docs[0];
                setValuation({ id: latestValuationDoc.id, ...latestValuationDoc.data() } as Valuation);
            } else {
                setValuation(null);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching valuation:", error);
            setIsLoading(false);
        });
        return unsubscribe;
    };
    return (
        <Dialog onOpenChange={(open) => { if(open) fetchLatestValuation() }}>
            <DialogTrigger asChild><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader><DialogTitle>Latest Home Valuation</DialogTitle><DialogDescription>Here is the most recent AI valuation generated by this seller.</DialogDescription></DialogHeader>
                <div className="py-4">{isLoading ? (<div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>) : (<ValuationDetails valuation={valuation} />)}</div>
            </DialogContent>
        </Dialog>
    );
}

const SellersTab = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const usersCollection = collection(db, 'users');
    // Removed orderBy to prevent query failure without a composite index
    const q = query(usersCollection);
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const sellersData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt as Timestamp;
            return {
                id: doc.id,
                email: data.email,
                createdAt: createdAt ? createdAt.toDate().toLocaleString() : 'N/A',
            };
        });
        setSellers(sellersData);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching sellers: ", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registered Sellers</CardTitle>
        <CardDescription>
          This is a list of all users who have created a full seller account to access the personalized dashboard. They are active or prospective clients.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sellers.length > 0 ? (
              sellers.map((seller) => (
                <TableRow key={seller.id}>
                  <TableCell className="font-medium"><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{seller.email}</div></TableCell>
                  <TableCell><div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" />{seller.createdAt}</div></TableCell>
                  <TableCell className="text-right"><SellerValuationDialog sellerId={seller.id} /></TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={3} className="text-center h-24">No sellers have registered yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// Chat Logs Component
interface ChatLog {
  id: string;
  userId: string;
  userMessage: string;
  modelResponse: string;
  createdAt: string;
}

const ChatLogsTab = () => {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const logsCollection = collection(db, 'chatbot_logs');
    // Removed orderBy to prevent query failure without a composite index
    const q = query(logsCollection);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
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
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching chat logs: ", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
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
                        <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span className="font-mono text-xs">{log.userId.substring(0, 8)}...</span></div>
                        <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{log.createdAt}</span></div>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                   <div className="space-y-4 p-4 bg-muted/50 rounded-md">
                        <div className="flex gap-3"><User className="h-5 w-5 text-primary flex-shrink-0 mt-1" /><div className="flex-1"><p className="font-semibold">User</p><p className="text-muted-foreground">{log.userMessage}</p></div></div>
                        <div className="flex gap-3"><Bot className="h-5 w-5 text-primary flex-shrink-0 mt-1" /><div className="flex-1"><p className="font-semibold">Assistant</p><p className="text-muted-foreground">{log.modelResponse}</p></div></div>
                   </div>
                </AccordionContent>
              </AccordionItem>
            ))
          ) : (
             <div className="text-center h-24 flex items-center justify-center">No chat logs found.</div>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
};


export default function AdminDashboardPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/admin/login');
      return;
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="contacts" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="contacts"><Mail className="mr-2 h-4 w-4"/>Contacts</TabsTrigger>
        <TabsTrigger value="sellers"><Users className="mr-2 h-4 w-4"/>Sellers</TabsTrigger>
        <TabsTrigger value="chat-logs"><MessageSquare className="mr-2 h-4 w-4"/>Chat Logs</TabsTrigger>
      </TabsList>
      <TabsContent value="contacts" className="mt-4">
        <ContactsTab />
      </TabsContent>
      <TabsContent value="sellers" className="mt-4">
        <SellersTab />
      </TabsContent>
      <TabsContent value="chat-logs" className="mt-4">
        <ChatLogsTab />
      </TabsContent>
    </Tabs>
  );
}
