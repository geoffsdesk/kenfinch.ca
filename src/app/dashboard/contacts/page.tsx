
"use client";

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Mail, Phone, User as UserIcon } from 'lucide-react';

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
      router.push('/login');
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
        <CardTitle>Contact Submissions</CardTitle>
        <CardDescription>Here are the users who requested an expert opinion.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Submitted At</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>{contact.submittedAt}</TableCell>
                  <TableCell className="font-medium">
                     <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
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
                     <div className="flex items-center gap-2">
                        {contact.phone && <Phone className="h-4 w-4 text-muted-foreground" />}
                        {contact.phone || 'N/A'}
                     </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No contact submissions yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
