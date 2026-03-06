/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Package,
  PlusCircle,
  ImageIcon,
  Trash2,
  Search,
  Store,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

/* ─── Types ─── */

interface Vendor {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  approved: boolean;
  active: boolean;
  branchCount: number;
}

interface Branch {
  id: string;
  vendorId: string;
  branchName: string;
  city: string | null;
  area: string | null;
  town: string | null;
  approved: boolean;
  active: boolean;
  vendorName: string;
  vendorLogoUrl: string | null;
}

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

/* ─── Component ─── */

export default function AdminProductsPage() {
  // Vendor & branch selection
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [loadingVendors, setLoadingVendors] = useState(true);

  // Products
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  // Add product
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

  // Product search (for linking)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ExistingProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedExisting, setSelectedExisting] = useState<ExistingProduct | null>(null);
  const [showCreateNew, setShowCreateNew] = useState(false);

  // Edit product
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

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<StoreProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ─── Fetch vendors & branches on mount ─── */

  useEffect(() => {
    async function load() {
      setLoadingVendors(true);
      try {
        const [vendorRes, branchRes, catRes] = await Promise.all([
          fetch("/api/admin/vendors"),
          fetch("/api/admin/branches"),
          fetch("/api/categories"),
        ]);
        if (vendorRes.ok) setVendors(await vendorRes.json());
        if (branchRes.ok) setAllBranches(await branchRes.json());
        if (catRes.ok) setCategories(await catRes.json());
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoadingVendors(false);
      }
    }
    load();
  }, []);

  /* ─── Filtered branches for selected vendor ─── */

  const filteredBranches = selectedVendorId
    ? allBranches.filter((b) => b.vendorId === selectedVendorId)
    : allBranches;

  /* ─── Reset branch when vendor changes ─── */

  useEffect(() => {
    setSelectedBranchId("");
    setProducts([]);
  }, [selectedVendorId]);

  /* ─── Fetch products when branch changes ─── */

  const fetchProducts = useCallback(async () => {
    if (!selectedBranchId) {
      setProducts([]);
      return;
    }
    setLoadingProducts(true);
    try {
      const res = await fetch(`/api/stores/${selectedBranchId}/products`);
      if (res.ok) setProducts(await res.json());
    } catch {
      toast.error("Failed to fetch products");
    } finally {
      setLoadingProducts(false);
    }
  }, [selectedBranchId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ─── Product search for linking ─── */

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
      const res = await fetch(`/api/products?search=${encodeURIComponent(query.trim())}&pageSize=8&all=true`);
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
    setForm((prev) => ({ ...prev, name: p.name, imageUrl: p.imageUrl || "", unit: p.unit || "" }));
  }

  function handleCreateNewProduct() {
    setSelectedExisting(null);
    setShowCreateNew(true);
    setSearchResults([]);
    setForm((prev) => ({ ...prev, name: searchQuery.trim() }));
  }

  function resetAddDialog() {
    setForm({ name: "", price: "", categoryId: "", unit: "", bundleInfo: "", imageUrl: "", brand: "", size: "", barcode: "" });
    setSearchQuery("");
    setSearchResults([]);
    setSelectedExisting(null);
    setShowCreateNew(false);
  }

  /* ─── Create category ─── */

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

  /* ─── Add product ─── */

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBranchId) return;
    setSubmitting(true);

    try {
      let productId: string;

      if (selectedExisting) {
        productId = selectedExisting.id;
      } else {
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

      const priceRes = await fetch(`/api/stores/${selectedBranchId}/products`, {
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

      toast.success(selectedExisting ? "Product linked to branch" : "Product added successfully");
      setDialogOpen(false);
      resetAddDialog();
      await fetchProducts();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  /* ─── Edit product ─── */

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
    if (!editProduct || !selectedBranchId) return;
    setEditSubmitting(true);

    try {
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

      const priceRes = await fetch(`/api/stores/${selectedBranchId}/products`, {
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
      await fetchProducts();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setEditSubmitting(false);
    }
  }

  /* ─── Delete product ─── */

  async function handleDelete() {
    if (!deleteTarget || !selectedBranchId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/stores/${selectedBranchId}/products`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeProductId: deleteTarget.id }),
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        toast.success("Listing removed");
        setDeleteTarget(null);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to remove listing");
      }
    } catch {
      toast.error("Failed to remove listing");
    } finally {
      setDeleting(false);
    }
  }

  /* ─── Filtered products by local search ─── */

  const displayProducts = productSearch.trim()
    ? products.filter((p) =>
        p.productName.toLowerCase().includes(productSearch.toLowerCase())
      )
    : products;

  /* ─── Selected vendor/branch info ─── */

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId);
  const selectedBranch = filteredBranches.find((b) => b.id === selectedBranchId);

  /* ─── Render ─── */

  if (loadingVendors) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Manage Vendor Products</h1>
        <p className="text-muted-foreground text-sm">
          Select a vendor and branch to add, edit, or remove products on their behalf.
        </p>
      </div>

      {/* Vendor & Branch Selectors */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vendor selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Vendor
            </Label>
            <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Choose a vendor..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {vendors.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    <div className="flex items-center gap-2">
                      {v.logoUrl ? (
                        <img src={v.logoUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
                      ) : (
                        <Store className="h-4 w-4 text-slate-400" />
                      )}
                      <span>{v.name}</span>
                      {!v.approved && (
                        <Badge variant="secondary" className="text-[9px] ml-1">Pending</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Branch selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Branch
            </Label>
            <Select
              value={selectedBranchId}
              onValueChange={setSelectedBranchId}
              disabled={filteredBranches.length === 0}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder={filteredBranches.length === 0 ? "No branches available" : "Choose a branch..."} />
              </SelectTrigger>
              <SelectContent>
                {filteredBranches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    <div className="flex items-center gap-2">
                      <span>{b.branchName}</span>
                      {!selectedVendorId && (
                        <span className="text-xs text-slate-400">({b.vendorName})</span>
                      )}
                      {b.city && (
                        <span className="text-xs text-slate-400">- {b.city}</span>
                      )}
                      {!b.approved && (
                        <Badge variant="secondary" className="text-[9px] ml-1">Pending</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selected info summary */}
        {selectedBranch && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
            {selectedBranch.vendorLogoUrl ? (
              <img src={selectedBranch.vendorLogoUrl} alt="" className="h-8 w-8 rounded-full object-cover border" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                <Store className="h-4 w-4 text-slate-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                {selectedBranch.vendorName} / {selectedBranch.branchName}
              </p>
              <p className="text-xs text-slate-400">
                {products.length} products listed
                {selectedBranch.city ? ` · ${selectedBranch.city}` : ""}
                {selectedBranch.area ? `, ${selectedBranch.area}` : ""}
              </p>
            </div>
            <Badge
              variant={selectedBranch.approved && selectedBranch.active ? "default" : "secondary"}
              className="text-[10px]"
            >
              {selectedBranch.approved && selectedBranch.active ? "Active" : !selectedBranch.approved ? "Pending Approval" : "Inactive"}
            </Badge>
          </div>
        )}
      </div>

      {/* No branch selected state */}
      {!selectedBranchId && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <Store className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-500">Select a vendor and branch</p>
          <p className="text-xs text-slate-400 mt-1">Choose a branch above to manage its products</p>
        </div>
      )}

      {/* Products section */}
      {selectedBranchId && (
        <>
          {/* Toolbar: search + add button */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Filter products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Loading */}
          {loadingProducts && (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {/* Empty state */}
          {!loadingProducts && products.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <Package className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-500">No products yet</p>
              <p className="text-xs text-slate-400 mt-1">Add the first product for this branch</p>
            </div>
          )}

          {/* Product grid */}
          {!loadingProducts && displayProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {displayProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group"
                >
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
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={p.inStock ? "default" : "secondary"}
                        className="text-[10px] shadow-sm"
                      >
                        {p.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
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

                  <div className="p-3">
                    <p className="text-sm font-semibold text-slate-900 truncate">{p.productName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold text-primary">
                        N$ {Number(p.price).toFixed(2)}
                      </span>
                      {p.unit && <span className="text-xs text-slate-400">/ {p.unit}</span>}
                    </div>
                    {p.bundleInfo && (
                      <p className="text-xs text-slate-400 mt-0.5">{p.bundleInfo}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-xl text-xs"
                        onClick={() => openEditDialog(p)}
                      >
                        <Edit2 className="h-3 w-3 mr-1.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => setDeleteTarget(p)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── Add Product Dialog ─── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetAddDialog(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Product to Branch</DialogTitle>
            <DialogDescription>
              Search for an existing product or create a new one for{" "}
              <strong>{selectedBranch?.vendorName} / {selectedBranch?.branchName}</strong>.
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Search */}
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

              {searching && <p className="text-xs text-slate-400 py-2">Searching...</p>}

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

          {/* Step 2: Link existing product */}
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
                <Button type="button" variant="ghost" size="sm" className="text-xs shrink-0" onClick={resetAddDialog}>
                  Change
                </Button>
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
                {submitting ? "Adding..." : "Add to Branch"}
              </Button>
            </form>
          )}

          {/* Step 2b: Create new product */}
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
                  <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
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
                  <Input placeholder="e.g., Topscore" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Size / Weight</Label>
                  <Input placeholder="e.g., 10kg" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input placeholder="kg, litre, pack" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Bundle Info</Label>
                  <Input placeholder="e.g., Pack of 6" value={form.bundleInfo} onChange={(e) => setForm({ ...form, bundleInfo: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Barcode (optional)</Label>
                <Input placeholder="e.g., 6001240100011" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Adding..." : "Create & Add Product"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Edit Product Dialog ─── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0">
          <div className="sticky top-0 z-10 bg-background border-b px-6 pt-6 pb-4">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update product details, image, and price.</DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleEditProduct} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Product Image</Label>
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

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Product Name *</Label>
                  <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Price (N$) *</Label>
                  <Input type="number" step="0.01" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input placeholder="kg, litre, pack" value={editForm.unit} onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bundle Info</Label>
                    <Input placeholder="e.g., Pack of 6" value={editForm.bundleInfo} onChange={(e) => setEditForm({ ...editForm, bundleInfo: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>

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

      {/* ─── Delete Confirmation ─── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Listing</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deleteTarget?.productName}</strong> from this branch. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              {deleting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
