"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Check, X, Megaphone } from "lucide-react";

interface SponsoredItem {
  id: string;
  storeName: string;
  productName: string;
  startDate: string;
  endDate: string;
  priorityLevel: number;
  approved: boolean;
  active: boolean;
}

export default function AdminSponsoredPage() {
  const [listings, setListings] = useState<SponsoredItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchListings() {
    try {
      const res = await fetch("/api/admin/sponsored");
      if (res.ok) setListings(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchListings();
  }, []);

  async function handleApprove(id: string, approved: boolean) {
    try {
      const res = await fetch(`/api/admin/sponsored/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });

      if (res.ok) {
        toast.success(approved ? "Listing approved" : "Listing rejected");
        fetchListings();
      }
    } catch {
      toast.error("Failed to update listing");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sponsored Listings</h1>
        <p className="text-muted-foreground">Manage sponsored product placements</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : listings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No sponsored listings
                  </TableCell>
                </TableRow>
              ) : (
                listings.map((listing) => {
                  const isExpired = new Date(listing.endDate) < new Date();
                  return (
                    <TableRow key={listing.id}>
                      <TableCell className="font-medium">{listing.productName}</TableCell>
                      <TableCell>{listing.storeName}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(listing.startDate).toLocaleDateString()} —{" "}
                        {new Date(listing.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Level {listing.priorityLevel}</Badge>
                      </TableCell>
                      <TableCell>
                        {isExpired ? (
                          <Badge variant="secondary">Expired</Badge>
                        ) : listing.approved ? (
                          <Badge>Active</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {!listing.approved && (
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 text-green-600"
                              onClick={() => handleApprove(listing.id, true)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {listing.approved && (
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleApprove(listing.id, false)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
