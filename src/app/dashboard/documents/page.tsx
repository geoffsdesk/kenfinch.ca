
"use client";

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, query, where, orderBy, Timestamp, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useRouter } from 'next/navigation';
import { auth, db, storage } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, FileImage, FileCheck2, Download, Loader2, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

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
    Other: "bg-gray-100 text-gray-800",
}

const DocumentList = ({ documents }: { documents: Document[] }) => {
    return (
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
    )
}

const UploadDocument = ({ userId, onUploadComplete }: { userId: string, onUploadComplete: () => void }) => {
    const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState<string>('Other');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !category) {
            toast({
                variant: 'destructive',
                title: "Upload Failed",
                description: "Please select a file and a category.",
            });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        const storageRef = ref(storage, `users/${userId}/documents/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload error:", error);
                setIsUploading(false);
                toast({
                    variant: 'destructive',
                    title: "Upload Error",
                    description: "There was a problem uploading your file. Please try again."
                });
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                    // Save document metadata to Firestore
                    await addDoc(collection(db, 'users', userId, 'documents'), {
                        name: file.name,
                        url: downloadURL,
                        category: category,
                        type: 'user_upload', // Differentiate user uploads
                        date: serverTimestamp(),
                    });

                    setIsUploading(false);
                    setFile(null);
                    setCategory('Other');
                    toast({
                        title: "Upload Successful",
                        description: "Your document has been added to the hub.",
                    });
                    onUploadComplete();
                });
            }
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upload a New Document</CardTitle>
                <CardDescription>Add files like inspection reports, receipts, or other important papers.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="grid gap-2">
                        <label htmlFor="file-upload" className="text-sm font-medium">File</label>
                        <Input id="file-upload" type="file" onChange={handleFileChange} disabled={isUploading} />
                     </div>
                      <div className="grid gap-2">
                        <label htmlFor="category-select" className="text-sm font-medium">Category</label>
                         <Select onValueChange={setCategory} defaultValue={category} disabled={isUploading}>
                            <SelectTrigger id="category-select">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Preparation">Preparation</SelectItem>
                                <SelectItem value="Contracts">Contracts</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                                <SelectItem value="Closing">Closing</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
                </div>
                {isUploading && (
                    <div className="grid gap-2">
                        <Progress value={uploadProgress} className="w-full" />
                        <p className="text-sm text-muted-foreground">{Math.round(uploadProgress)}% uploaded</p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                 <Button onClick={handleUpload} disabled={isUploading || !file}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Upload Document
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function DocumentsPage() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDocuments = () => {
        if(!user) return;
        // Documents are stored in a subcollection under the user's UID
        const docsCollection = collection(db, 'users', user.uid, 'documents');
        const q = query(docsCollection, orderBy('date', 'desc'));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
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
            setIsLoading(false);
        }, (error) => {
             console.error("Error fetching documents: ", error);
             setIsLoading(false);
        });

        return unsubscribe;
    }

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.push('/seller-login');
            return;
        }

        const unsubscribe = fetchDocuments();
        return () => unsubscribe && unsubscribe();
    }, [user, loading, router]);


    if (loading || isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="grid gap-8">
            {user && <UploadDocument userId={user.uid} onUploadComplete={fetchDocuments} />}
            <Card>
                <CardHeader>
                    <CardTitle>Document Hub</CardTitle>
                    <CardDescription>Securely access all your important selling documents in one place.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DocumentList documents={documents} />
                </CardContent>
            </Card>
        </div>
    )
}
