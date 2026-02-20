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
import { Megaphone, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface StoreProduct {
  id: string;
  productId: string;
  productName: string;
  price: string;
}

export default function VendorSponsoredPage() {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    startDate: "",
    endDate: "",
    priorityLevel: "1",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const overviewRes = await fetch("/api/dashboard/overview");
        if (overviewRes.ok) {
          const overview = await overviewRes.json();
          if (overview.store) {
            setStoreId(overview.store.id);
            const prodRes = await fetch(`/api/stores/${overview.store.id}/products`);
            if (prodRes.ok) setProducts(await prodRes.json());
          }
        }
      } catch {}
    }
    fetchData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!storeId) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/sponsored", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sponsored Ads</h1>
          <p className="text-muted-foreground">
            Promote your products to appear at the top of search results
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Sponsored Ad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Sponsored Listing</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Product</Label>
                <Select
                  value={form.productId}
                  onValueChange={(v) => setForm({ ...form, productId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
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
              <Button type="submit" className="w-full" disabled={submitting}>
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
          <div className="flex gap-4">
            <Badge variant="outline">Level 1 — Basic placement</Badge>
            <Badge variant="outline">Level 2 — Premium placement</Badge>
            <Badge variant="outline">Level 3 — Featured (top spot)</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
