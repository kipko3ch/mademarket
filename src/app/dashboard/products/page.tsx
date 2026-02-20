"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit2, Package } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StoreProduct {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  unit: string | null;
  price: string;
  bundleInfo: string | null;
  inStock: boolean;
}

interface Category {
  id: string;
  name: string;
}

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    categoryId: "",
    unit: "",
    bundleInfo: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get store ID from overview
        const overviewRes = await fetch("/api/dashboard/overview");
        if (overviewRes.ok) {
          const overview = await overviewRes.json();
          if (overview.store) {
            setStoreId(overview.store.id);
            // Fetch store products
            const prodRes = await fetch(`/api/stores/${overview.store.id}/products`);
            if (prodRes.ok) setProducts(await prodRes.json());
          }
        }

        const catRes = await fetch("/api/categories");
        if (catRes.ok) setCategories(await catRes.json());
      } catch {} finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!storeId) return;
    setSubmitting(true);

    try {
      // First, create the product
      const productRes = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          categoryId: form.categoryId || undefined,
          unit: form.unit || undefined,
        }),
      });

      if (!productRes.ok) {
        const err = await productRes.json();
        toast.error(err.error || "Failed to create product");
        return;
      }

      const product = await productRes.json();

      // Then, set the price for this store
      const priceRes = await fetch(`/api/stores/${storeId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          price: parseFloat(form.price),
          bundleInfo: form.bundleInfo || undefined,
        }),
      });

      if (!priceRes.ok) {
        const err = await priceRes.json();
        toast.error(err.error || "Failed to set price");
        return;
      }

      toast.success("Product added successfully");
      setDialogOpen(false);
      setForm({ name: "", price: "", categoryId: "", unit: "", bundleInfo: "" });

      // Refresh products
      const prodRes = await fetch(`/api/stores/${storeId}/products`);
      if (prodRes.ok) setProducts(await prodRes.json());
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="h-64 bg-muted rounded-lg animate-pulse" />;
  }

  if (!storeId) {
    return (
      <div className="text-center py-16">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-lg">Register a store first to manage products</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">{products.length} products listed</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input
                  placeholder="e.g., Whole Milk 1L"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm({ ...form, categoryId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input
                    placeholder="kg, litre, pack"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bundle Info</Label>
                  <Input
                    placeholder="e.g., Pack of 6"
                    value={form.bundleInfo}
                    onChange={(e) => setForm({ ...form, bundleInfo: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Adding..." : "Add Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Bundle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No products yet. Add your first product.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.productName}</TableCell>
                    <TableCell className="text-muted-foreground">{p.unit || "—"}</TableCell>
                    <TableCell className="font-semibold">${Number(p.price).toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {p.bundleInfo || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.inStock ? "default" : "secondary"}>
                        {p.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit2 className="h-4 w-4" />
                      </Button>
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
