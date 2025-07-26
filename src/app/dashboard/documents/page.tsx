
"use client";

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, FileImage, FileCheck2, Download, Loader2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Document Hub',
};

interface Document {
    id: string;
    name: string;
    type: string;
    date: string;
    category: string;
    url: string;
}

const getIconForType = (type: string) => {
    switch(type.toLowerCase()) {
        case 'legal':
            return <FileCheck2 className="h-5 w-5 text-muted-foreground" />;
        case 'media':
            return <FileImage className="h-5 w-5 text-muted-foreground" />;
        case 'guide':
        case 'offer':
        default:
            return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
}

const categoryColors: { [key: string]: string } = {
    Preparation: "bg-blue-100 text-blue-800",
    Contracts: "bg-yellow-100 text-yellow-800",
    Marketing: "bg-green-100 text-green-800",
    Closing: "bg-purple-100 text-purple-800",
}

export default function DocumentsPage() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.push('/seller-login');
            return;
        }

        const fetchDocuments = async () => {
            try {
                // Documents are stored in a subcollection under the user's UID
                const docsCollection = collection(db, 'users', user.uid, 'documents');
                const q = query(docsCollection, orderBy('date', 'desc'));
                const querySnapshot = await getDocs(q);
                const docsData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    const date = data.date as Timestamp;
                    return {
                        id: doc.id,
                        name: data.name,
                        type: data.type,
                        category: data.category,
                        url: data.url,
                        date: date ? date.toDate().toLocaleDateString() : 'N/A',
                    };
                });
                setDocuments(docsData);
            } catch (error) {
                console.error("Error fetching documents: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocuments();
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
                <CardTitle>Document Hub</CardTitle>
                <CardDescription>Securely access all your important selling documents in one place.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Document Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Date Uploaded</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.length > 0 ? (
                            documents.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            {getIconForType(doc.type)}
                                            <span>{doc.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={categoryColors[doc.category]}>
                                            {doc.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{doc.date}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" asChild>
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4" />
                                                <span className="sr-only">Download</span>
                                            </a>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                No documents have been uploaded yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
