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
import { Check, X, Store } from "lucide-react";

interface StoreItem {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  approved: boolean;
  createdAt: string;
}

export default function AdminStoresPage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchStores() {
    try {
      const res = await fetch("/api/admin/stores");
      if (res.ok) setStores(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStores();
  }, []);

  async function handleApprove(storeId: string, approved: boolean) {
    try {
      const res = await fetch(`/api/admin/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });

      if (res.ok) {
        toast.success(approved ? "Store approved" : "Store rejected");
        fetchStores();
      } else {
        toast.error("Failed to update store");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  if (loading) {
    return <div className="h-64 bg-muted rounded-lg animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Stores</h1>
        <p className="text-muted-foreground">Approve or manage store registrations</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    <Store className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No stores registered yet
                  </TableCell>
                </TableRow>
              ) : (
                stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{store.ownerName}</p>
                        <p className="text-xs text-muted-foreground">{store.ownerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={store.approved ? "default" : "secondary"}>
                        {store.approved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(store.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!store.approved && (
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 text-green-600"
                            onClick={() => handleApprove(store.id, true)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {store.approved && (
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleApprove(store.id, false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
