
"use client";

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Mail, Phone, Calendar, User } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  submittedAt: string;
}

export default function ContactsPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/admin/login');
      return;
    }

    const fetchContacts = async () => {
      try {
        const contactsCollection = collection(db, 'contacts');
        const q = query(contactsCollection, orderBy('submittedAt', 'desc'));
        const querySnapshot = await getDocs(q);
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
      } catch (error) {
        console.error("Error fetching contacts: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
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
        <CardTitle>Contact Form Submissions</CardTitle>
        <CardDescription>Here are the messages submitted through your website's contact form.</CardDescription>
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
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {contact.submittedAt}
                     </div>
                  </TableCell>
                  <TableCell className="font-medium">
                     <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {contact.name}
                     </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a>
                     </div>
                  </TableCell>
                  <TableCell>
                    {contact.phone ? (
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a href={`tel:${contact.phone}`} className="hover:underline">{contact.phone}</a>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No one has contacted you yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
