import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, FileImage, FileCheck2, Download } from 'lucide-react';

const documents = [
    {
        name: "Home Staging Guide",
        type: "Guide",
        date: "2024-07-01",
        category: "Preparation",
        icon: <FileText className="h-5 w-5 text-muted-foreground" />
    },
    {
        name: "Listing Agreement",
        type: "Legal",
        date: "2024-07-05",
        category: "Contracts",
        icon: <FileCheck2 className="h-5 w-5 text-muted-foreground" />
    },
    {
        name: "Property Disclosure Statement",
        type: "Legal",
        date: "2024-07-06",
        category: "Contracts",
        icon: <FileCheck2 className="h-5 w-5 text-muted-foreground" />
    },
    {
        name: "Professional Photos",
        type: "Media",
        date: "2024-07-10",
        category: "Marketing",
        icon: <FileImage className="h-5 w-5 text-muted-foreground" />
    },
    {
        name: "Offer to Purchase",
        type: "Offer",
        date: "2024-08-01",
        category: "Closing",
        icon: <FileText className="h-5 w-5 text-muted-foreground" />
    },
    {
        name: "Closing Documents",
        type: "Legal",
        date: "2024-08-15",
        category: "Closing",
        icon: <FileCheck2 className="h-5 w-5 text-muted-foreground" />
    },
];

const categoryColors: { [key: string]: string } = {
    Preparation: "bg-blue-100 text-blue-800",
    Contracts: "bg-yellow-100 text-yellow-800",
    Marketing: "bg-green-100 text-green-800",
    Closing: "bg-purple-100 text-purple-800",
}

export default function DocumentsPage() {
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
                        {documents.map((doc) => (
                            <TableRow key={doc.name}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        {doc.icon}
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
                                    <Button variant="ghost" size="icon">
                                        <Download className="h-4 w-4" />
                                        <span className="sr-only">Download</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
