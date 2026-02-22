/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit2, Package, PlusCircle, ImageIcon, Link2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ImageUpload } from "@/components/ui/image-upload";

interface StoreProduct {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  unit: string | null;
  price: string;
  bundleInfo: string | null;
  inStock: boolean;
  matchStatus: "linked" | "auto_matched" | "not_linked";
}

interface Category {
  id: string;
  name: string;
}

interface ExistingProduct {
  id: string;
  name: string;
  imageUrl: string | null;
  unit: string | null;
  categoryName: string | null;
  minPrice: number | null;
  storeCount: number;
}

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Add product state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    categoryId: "",
    unit: "",
    bundleInfo: "",
    imageUrl: "",
    brand: "",
    size: "",
    barcode: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);
  const [catPopoverOpen, setCatPopoverOpen] = useState(false);

  // Product search state (for linking to existing products)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ExistingProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedExisting, setSelectedExisting] = useState<ExistingProduct | null>(null);
  const [showCreateNew, setShowCreateNew] = useState(false);

  // Edit product state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<StoreProduct | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    unit: "",
    bundleInfo: "",
    imageUrl: "",
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Link search state (for changing/linking product in edit dialog)
  const [linkSearchOpen, setLinkSearchOpen] = useState(false);
  const [linkSearchQuery, setLinkSearchQuery] = useState("");
  const [linkSearchResults, setLinkSearchResults] = useState<ExistingProduct[]>([]);
  const [linkSearching, setLinkSearching] = useState(false);

  // Search existing products in the platform
  async function handleSearch(query: string) {
    setSearchQuery(query);
    setSelectedExisting(null);
    setShowCreateNew(false);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(query.trim())}&pageSize=8`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.data || []);
      }
    } catch {} finally {
      setSearching(false);
    }
  }

  function selectExistingProduct(p: ExistingProduct) {
    setSelectedExisting(p);
    setSearchQuery(p.name);
    setSearchResults([]);
    setShowCreateNew(false);
    setForm((prev) => ({
      ...prev,
      name: p.name,
      imageUrl: p.imageUrl || "",
      unit: p.unit || "",
    }));
  }

  function handleCreateNewProduct() {
    setSelectedExisting(null);
    setShowCreateNew(true);
    setSearchResults([]);
    setForm((prev) => ({
      ...prev,
      name: searchQuery.trim(),
    }));
  }

  function resetAddDialog() {
    setForm({ name: "", price: "", categoryId: "", unit: "", bundleInfo: "", imageUrl: "", brand: "", size: "", barcode: "" });
    setSearchQuery("");
    setSearchResults([]);
    setSelectedExisting(null);
    setShowCreateNew(false);
  }

  async function handleCreateCategory() {
    if (!newCatName.trim()) return;
    setCreatingCat(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      if (res.ok) {
        const cat = await res.json();
        setCategories((prev) => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)));
        setForm((prev) => ({ ...prev, categoryId: cat.id }));
        setNewCatName("");
        setCatPopoverOpen(false);
        toast.success(`Category "${cat.name}" created`);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create category");
      }
    } catch {
      toast.error("Failed to create category");
    } finally {
      setCreatingCat(false);
    }
  }

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

        const catRes = await fetch("/api/categories");
        if (catRes.ok) setCategories(await catRes.json());
      } catch {} finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function refreshProducts() {
    if (!storeId) return;
    const prodRes = await fetch(`/api/stores/${storeId}/products`);
    if (prodRes.ok) setProducts(await prodRes.json());
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!storeId) return;
    setSubmitting(true);

    try {
      let productId: string;

      if (selectedExisting) {
        // Linking to an existing product — no need to create
        productId = selectedExisting.id;
      } else {
        // Find-or-create via API (handles dedup by enhanced normalization)
        const productRes = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            categoryId: form.categoryId || undefined,
            imageUrl: form.imageUrl || undefined,
            unit: form.unit || undefined,
            brand: form.brand || undefined,
            size: form.size || undefined,
            barcode: form.barcode || undefined,
          }),
        });

        if (!productRes.ok) {
          const err = await productRes.json();
          toast.error(err.error || "Failed to create product");
          return;
        }

        const product = await productRes.json();
        productId = product.id;
      }

      // Set the price for this store
      const priceRes = await fetch(`/api/stores/${storeId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          price: parseFloat(form.price),
          bundleInfo: form.bundleInfo || undefined,
        }),
      });

      if (!priceRes.ok) {
        const err = await priceRes.json();
        toast.error(err.error || "Failed to set price");
        return;
      }

      toast.success(selectedExisting ? "Product linked to your store" : "Product added successfully");
      setDialogOpen(false);
      resetAddDialog();
      await refreshProducts();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function openEditDialog(p: StoreProduct) {
    setEditProduct(p);
    setEditForm({
      name: p.productName,
      price: String(Number(p.price)),
      unit: p.unit || "",
      bundleInfo: p.bundleInfo || "",
      imageUrl: p.productImage || "",
    });
    setEditDialogOpen(true);
  }

  async function handleEditProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!editProduct || !storeId) return;
    setEditSubmitting(true);

    try {
      // Update product details (name, image, unit)
      const productRes = await fetch(`/api/products/${editProduct.productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          imageUrl: editForm.imageUrl || null,
          unit: editForm.unit || null,
        }),
      });

      if (!productRes.ok) {
        const err = await productRes.json();
        toast.error(err.error || "Failed to update product");
        return;
      }

      // Update price for this store
      const priceRes = await fetch(`/api/stores/${storeId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: editProduct.productId,
          price: parseFloat(editForm.price),
          bundleInfo: editForm.bundleInfo || undefined,
        }),
      });

      if (!priceRes.ok) {
        const err = await priceRes.json();
        toast.error(err.error || "Failed to update price");
        return;
      }

      toast.success("Product updated");
      setEditDialogOpen(false);
      setEditProduct(null);
      await refreshProducts();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleLinkSearch(query: string) {
    setLinkSearchQuery(query);
    if (query.trim().length < 2) {
      setLinkSearchResults([]);
      return;
    }
    setLinkSearching(true);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(query.trim())}&pageSize=8`);
      if (res.ok) {
        const data = await res.json();
        setLinkSearchResults(data.data || []);
      }
    } catch {} finally {
      setLinkSearching(false);
    }
  }

  async function handleLinkProduct(targetProductId: string) {
    if (!editProduct || !storeId) return;
    try {
      const res = await fetch(`/api/stores/${storeId}/products/${editProduct.id}/link`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: targetProductId }),
      });
      if (res.ok) {
        toast.success("Product linked successfully");
        setLinkSearchOpen(false);
        setEditDialogOpen(false);
        await refreshProducts();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to link product");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleUnlinkProduct() {
    if (!editProduct || !storeId) return;
    try {
      const res = await fetch(`/api/stores/${storeId}/products/${editProduct.id}/link`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Product unlinked");
        setEditDialogOpen(false);
        await refreshProducts();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to unlink product");
      }
    } catch {
      toast.error("Something went wrong");
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

        {/* Add Product Dialog */}
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetAddDialog(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Product</DialogTitle>
              <DialogDescription>Search for an existing product or create a new one. Linking to existing products enables price comparison across stores.</DialogDescription>
            </DialogHeader>

            {/* Step 1: Search for existing products */}
            {!selectedExisting && !showCreateNew && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Search Products</Label>
                  <Input
                    placeholder="Type product name... e.g., Whole Milk 1L"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    autoFocus
                  />
                </div>

                {/* Search results */}
                {searching && (
                  <p className="text-xs text-slate-400 py-2">Searching...</p>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Existing products — click to link</p>
                    {searchResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectExistingProduct(p)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-colors text-left"
                      >
                        <div className="h-10 w-10 rounded-lg bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {p.storeCount} {p.storeCount === 1 ? "store" : "stores"}
                            {p.minPrice ? ` · from N$ ${Number(p.minPrice).toFixed(2)}` : ""}
                            {p.categoryName ? ` · ${p.categoryName}` : ""}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Create new option */}
                {searchQuery.trim().length >= 2 && !searching && (
                  <button
                    type="button"
                    onClick={handleCreateNewProduct}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-colors text-left"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <PlusCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Create &quot;{searchQuery.trim()}&quot;</p>
                      <p className="text-[10px] text-slate-400">Add as a new product to the platform</p>
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Step 2: Selected existing product — just set your price */}
            {selectedExisting && (
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                  <div className="h-12 w-12 rounded-lg bg-white overflow-hidden shrink-0 flex items-center justify-center border">
                    {selectedExisting.imageUrl ? (
                      <img src={selectedExisting.imageUrl} alt={selectedExisting.name} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{selectedExisting.name}</p>
                    <p className="text-[10px] text-green-700">
                      Linking to existing product · {selectedExisting.storeCount} other {selectedExisting.storeCount === 1 ? "store" : "stores"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs shrink-0"
                    onClick={resetAddDialog}
                  >
                    Change
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Your Price (N$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    autoFocus
                  />
                  {selectedExisting.minPrice && (
                    <p className="text-[10px] text-slate-400">
                      Current lowest: N$ {Number(selectedExisting.minPrice).toFixed(2)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Bundle Info</Label>
                  <Input
                    placeholder="e.g., Pack of 6"
                    value={form.bundleInfo}
                    onChange={(e) => setForm({ ...form, bundleInfo: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Adding..." : "Add to My Store"}
                </Button>
              </form>
            )}

            {/* Step 2b: Create new product — full form */}
            {showCreateNew && (
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">Creating new product</p>
                  <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={resetAddDialog}>
                    Back to search
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Product Image</Label>
                  <ImageUpload
                    value={form.imageUrl}
                    onChange={(url) => setForm({ ...form, imageUrl: url })}
                    onRemove={() => setForm({ ...form, imageUrl: "" })}
                    folder="products"
                    aspectRatio="square"
                    label="Product Image"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Product Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (N$) *</Label>
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
                  <div className="flex gap-2">
                    <Select
                      value={form.categoryId}
                      onValueChange={(v) => setForm({ ...form, categoryId: v })}
                    >
                      <SelectTrigger className="flex-1">
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
                    <Popover open={catPopoverOpen} onOpenChange={setCatPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" size="icon" title="Create new category">
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3" align="end">
                        <p className="text-sm font-medium mb-2">New Category</p>
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g., Organic"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateCategory(); } }}
                            className="text-sm"
                          />
                          <Button
                            type="button"
                            size="sm"
                            disabled={creatingCat || !newCatName.trim()}
                            onClick={handleCreateCategory}
                          >
                            {creatingCat ? "..." : "Add"}
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Input
                      placeholder="e.g., Topscore, Omo"
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Size / Weight</Label>
                    <Input
                      placeholder="e.g., 10kg, 500ml"
                      value={form.size}
                      onChange={(e) => setForm({ ...form, size: e.target.value })}
                    />
                  </div>
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
                <div className="space-y-2">
                  <Label>Barcode (optional)</Label>
                  <Input
                    placeholder="e.g., 6001240100011"
                    value={form.barcode}
                    onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  />
                  <p className="text-[10px] text-slate-400">
                    If available, barcode helps match products exactly across stores
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Adding..." : "Create & Add Product"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0">
          {/* Sticky header */}
          <div className="sticky top-0 z-10 bg-background border-b px-6 pt-6 pb-4">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update product details, image, and price.</DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable content */}
          <form onSubmit={handleEditProduct} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Product Linking Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">Product Linking</h3>
                  {editProduct && (
                    <Badge
                      variant={editProduct.matchStatus === "linked" ? "default" : editProduct.matchStatus === "auto_matched" ? "outline" : "secondary"}
                      className={
                        editProduct.matchStatus === "linked"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : editProduct.matchStatus === "auto_matched"
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }
                    >
                      {editProduct.matchStatus === "linked" ? "Linked" : editProduct.matchStatus === "auto_matched" ? "Auto Matched" : "Not Linked"}
                    </Badge>
                  )}
                </div>
                {editProduct?.matchStatus === "auto_matched" && (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                    This product was auto-matched during Excel upload. Please verify the link is correct or search for a different product.
                  </p>
                )}
                {editProduct?.matchStatus === "not_linked" && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                    This product is not linked to any core product. Link it to enable price comparison across stores.
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setLinkSearchOpen(true);
                    setLinkSearchQuery("");
                    setLinkSearchResults([]);
                  }}
                >
                  {editProduct?.matchStatus === "not_linked" ? "Link to Existing Product" : "Change Linked Product"}
                </Button>
              </div>

              <hr className="border-slate-100" />

              {/* Image Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-700">Product Image</h3>
                <ImageUpload
                  value={editForm.imageUrl}
                  onChange={(url) => setEditForm({ ...editForm, imageUrl: url })}
                  onRemove={() => setEditForm({ ...editForm, imageUrl: "" })}
                  folder="products"
                  aspectRatio="square"
                  label="Product Image"
                />
              </div>

              <hr className="border-slate-100" />

              {/* Details Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700">Product Details</h3>
                <div className="space-y-2">
                  <Label>Product Name *</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (N$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input
                      placeholder="kg, litre, pack"
                      value={editForm.unit}
                      onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bundle Info</Label>
                    <Input
                      placeholder="e.g., Pack of 6"
                      value={editForm.bundleInfo}
                      onChange={(e) => setEditForm({ ...editForm, bundleInfo: e.target.value })}
                      />
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky footer */}
            <div className="sticky bottom-0 bg-background border-t px-6 py-4 flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={editSubmitting}>
                {editSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Link Product Search Dialog */}
      <Dialog open={linkSearchOpen} onOpenChange={setLinkSearchOpen}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col p-0">
          <div className="px-6 pt-6 pb-3 border-b">
            <DialogHeader>
              <DialogTitle>Link to Product</DialogTitle>
              <DialogDescription>Search for an existing product to link to. This enables price comparison.</DialogDescription>
            </DialogHeader>
            <div className="mt-3">
              <Input
                placeholder="Search products..."
                value={linkSearchQuery}
                onChange={(e) => handleLinkSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
            {linkSearching && <p className="text-xs text-slate-400 py-2">Searching...</p>}
            {linkSearchResults.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleLinkProduct(p.id)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-lg bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-4 w-4 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {p.storeCount} {p.storeCount === 1 ? "store" : "stores"}
                    {p.minPrice ? ` · from N$ ${Number(p.minPrice).toFixed(2)}` : ""}
                  </p>
                </div>
              </button>
            ))}
            {linkSearchQuery.length >= 2 && !linkSearching && linkSearchResults.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No products found</p>
            )}
          </div>
          {editProduct?.matchStatus !== "not_linked" && (
            <div className="border-t px-6 py-3">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="w-full text-xs"
                onClick={handleUnlinkProduct}
              >
                Unlink Product
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Products List */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <Package className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-500">No products yet</p>
          <p className="text-xs text-slate-400 mt-1">Add your first product to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group"
            >
              {/* Product image */}
              <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden">
                {p.productImage ? (
                  <img
                    src={p.productImage}
                    alt={p.productName}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-slate-200" />
                  </div>
                )}
                {/* Status badge */}
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={p.inStock ? "default" : "secondary"}
                    className="text-[10px] shadow-sm"
                  >
                    {p.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
                {/* Match status badge */}
                <div className="absolute top-2 left-2">
                  <Badge
                    variant="secondary"
                    className={
                      p.matchStatus === "linked"
                        ? "bg-green-100 text-green-700 text-[10px] shadow-sm"
                        : p.matchStatus === "auto_matched"
                        ? "bg-amber-100 text-amber-700 text-[10px] shadow-sm"
                        : "bg-red-100 text-red-700 text-[10px] shadow-sm"
                    }
                  >
                    {p.matchStatus === "linked" ? "\u2713 Linked" : p.matchStatus === "auto_matched" ? "\u26A1 Auto" : "\u2717 Not Linked"}
                  </Badge>
                </div>
              </div>

              {/* Product info */}
              <div className="p-3">
                <p className="text-sm font-semibold text-slate-900 truncate">{p.productName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-primary">
                    N$ {Number(p.price).toFixed(2)}
                  </span>
                  {p.unit && (
                    <span className="text-xs text-slate-400">/ {p.unit}</span>
                  )}
                </div>
                {p.bundleInfo && (
                  <p className="text-xs text-slate-400 mt-0.5">{p.bundleInfo}</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 rounded-xl text-xs"
                  onClick={() => openEditDialog(p)}
                >
                  <Edit2 className="h-3 w-3 mr-1.5" />
                  Edit Product
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
