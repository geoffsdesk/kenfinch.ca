
"use client";

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, query, orderBy, Timestamp, limit, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Mail, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { HomeValuationOutput, HomeValuationInput } from '@/ai/flows/home-valuation';

interface Seller {
  id: string;
  email: string;
  createdAt: string;
}

interface Valuation extends HomeValuationOutput {
    id: string;
    inputs: HomeValuationInput & { yearBuilt: string, finishedBasement: string };
    createdAt: Timestamp;
}


const ValuationDetails = ({ valuation }: { valuation: Valuation | null }) => {
    if (!valuation) {
        return <p>No valuation data available for this seller.</p>;
    }

    const squareFootageRanges: {[key: string]: string} = {
        '600': '< 700',
        '900': '700 - 1,100',
        '1300': '1,100 - 1,500',
        '1750': '1,500 - 2,000',
        '2250': '2,000 - 2,500',
        '2750': '2,500 - 3,000',
        '3250': '3,000 - 3,500',
        '4250': '3,500 - 5,000',
        '5500': '5,000 +',
    };

    const yearBuiltRanges: {[key: string]: string} = {
        '2': '0-5 years',
        '10': '6-15 years',
        '23': '16-30 years',
        '40': '31-50 years',
        '75': '51-99 years',
        '100': '100+ years',
    };

    const displaySquareFootage = squareFootageRanges[String(valuation.inputs.squareFootage)] || `${valuation.inputs.squareFootage} sq ft`;
    const displayYearBuilt = yearBuiltRanges[String(valuation.inputs.yearBuilt)] || `${valuation.inputs.yearBuilt}`;
    const displayFinishedBasement = valuation.inputs.finishedBasement === 'true' ? 'Yes' : 'No';

    return (
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold">Valuation Result</h4>
                <p className="text-2xl font-bold text-primary">${valuation.valuation.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Confidence: {Math.round(valuation.confidenceScore * 100)}%</p>
                 <p className="text-xs text-muted-foreground">Generated on: {valuation.createdAt.toDate().toLocaleDateString()}</p>
            </div>
            <div>
                <h4 className="font-semibold">Reasoning</h4>
                <p className="text-sm text-muted-foreground">{valuation.reasoning}</p>
            </div>
            <div>
                <h4 className="font-semibold">User-Provided Inputs</h4>
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
                setValuation({ 
                    id: latestValuationDoc.id,
                    ...latestValuationDoc.data()
                } as Valuation);
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
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Latest Home Valuation</DialogTitle>
                    <DialogDescription>
                        Here is the most recent AI valuation generated by this seller.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <ValuationDetails valuation={valuation} />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function SellersPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/admin/login');
      return;
    }

    const fetchSellers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
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
      } catch (error) {
        console.error("Error fetching sellers: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellers();
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
        <CardTitle>Registered Sellers</CardTitle>
        <CardDescription>This is a list of all users who have created a full seller account to access the personalized dashboard.</CardDescription>
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
                  <TableCell className="font-medium">
                     <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {seller.email}
                     </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {seller.createdAt}
                     </div>
                  </TableCell>
                  <TableCell className="text-right">
                     <SellerValuationDialog sellerId={seller.id} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">
                  No sellers have registered yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
