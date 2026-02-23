"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Megaphone, Plus, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useBranch } from "@/hooks/use-branch";

interface BranchProduct {
  id: string;
  productId: string;
  productName: string;
  price: string;
}

export default function VendorSponsoredPage() {
  const { vendor, branches, selectedBranchId, fetchVendorData, loading: branchLoading } = useBranch();

  const [products, setProducts] = useState<BranchProduct[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    productId: "",
    startDate: "",
    endDate: "",
    priorityLevel: "1",
  });

  // Fetch vendor data on mount
  useEffect(() => {
    fetchVendorData();
  }, [fetchVendorData]);

  // Fetch products for the selected branch
  useEffect(() => {
    async function fetchProducts() {
      if (!selectedBranchId) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const prodRes = await fetch(`/api/stores/${selectedBranchId}/products`);
        if (prodRes.ok) setProducts(await prodRes.json());
      } catch {} finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [selectedBranchId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vendor) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/sponsored", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendor.id,
          productId: form.productId,
          startDate: form.startDate,
          endDate: form.endDate,
          priorityLevel: parseInt(form.priorityLevel),
        }),
      });

      if (res.ok) {
        toast.success("Sponsored listing request submitted. Pending admin approval.");
        setDialogOpen(false);
        setForm({ productId: "", startDate: "", endDate: "", priorityLevel: "1" });
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create listing");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (branchLoading || loading) {
    return <div className="h-64 bg-muted rounded-lg animate-pulse" />;
  }

  if (!vendor) {
    return (
      <div className="text-center py-16">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-lg">Register as a vendor first to manage sponsored ads</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sponsored Ads</h1>
          <p className="text-muted-foreground text-sm">
            Promote your products to appear at the top of search results
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Sponsored Ad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Sponsored Listing</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!selectedBranchId && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-700">
                    Select a branch from the sidebar to see its products.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Product</Label>
                <Select
                  value={form.productId}
                  onValueChange={(v) => setForm({ ...form, productId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={products.length === 0 ? "No products available" : "Select product"} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.productId} value={p.productId}>
                        {p.productName} (${Number(p.price).toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Priority Level</Label>
                <Select
                  value={form.priorityLevel}
                  onValueChange={(v) => setForm({ ...form, priorityLevel: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1 (Basic)</SelectItem>
                    <SelectItem value="2">Level 2 (Premium)</SelectItem>
                    <SelectItem value="3">Level 3 (Featured)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={submitting || !form.productId}>
                {submitting ? "Submitting..." : "Submit for Approval"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How Sponsored Ads Work</CardTitle>
          <CardDescription>
            Sponsored products appear above organic search results. Admin reviews
            and approves all listings. Ads automatically deactivate after the end date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Badge variant="outline" className="justify-center py-1">Level 1 — Basic placement</Badge>
            <Badge variant="outline" className="justify-center py-1">Level 2 — Premium placement</Badge>
            <Badge variant="outline" className="justify-center py-1">Level 3 — Featured (top spot)</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
