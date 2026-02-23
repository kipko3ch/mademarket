/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Package, ExternalLink, Search, X } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { useBranch } from "@/hooks/use-branch";

interface BundleProduct {
  productId: string;
  quantity: number;
  productName: string | null;
  productSlug: string | null;
  productImageUrl: string | null;
}

interface BundleImage {
  id: string;
  imageUrl: string;
}

interface Bundle {
  id: string;
  branchId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  externalUrl: string | null;
  items: string | null;
  active: boolean;
  createdAt: string;
  bundleProducts: BundleProduct[];
  bundleImages?: BundleImage[];
}

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

interface SelectedProduct {
  productId: string;
  name: string;
  imageUrl: string | null;
  quantity: number;
}

const emptyForm = {
  name: "",
  description: "",
  imageUrl: "",
  images: [] as string[],
  price: "",
  externalUrl: "",
  items: "",
};

export default function VendorBundlesPage() {
  const { selectedBranchId } = useBranch();

  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  // Product selection for bundleProducts
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchBundles = useCallback(async () => {
    if (!selectedBranchId) {
      setBundles([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/dashboard/bundles?branchId=${selectedBranchId}`);
      if (res.ok) {
        setBundles(await res.json());
      }
    } catch {
      toast.error("Failed to load bundles");
    } finally {
      setLoading(false);
    }
  }, [selectedBranchId]);

  useEffect(() => {
    setLoading(true);
    fetchBundles();
  }, [fetchBundles]);

  // Search products for bundle
  async function searchProducts(query: string) {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(query.trim())}&pageSize=8`);
      if (res.ok) {
        const data = await res.json();
        const products: SearchProduct[] = (data.products || data || []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            imageUrl: p.imageUrl || null,
          })
        );
        // Filter out already selected products
        const selectedIds = new Set(selectedProducts.map((sp) => sp.productId));
        setSearchResults(products.filter((p) => !selectedIds.has(p.id)));
      }
    } catch {
      /* swallow */
    } finally {
      setSearching(false);
    }
  }

  function addProduct(product: SearchProduct) {
    setSelectedProducts((prev) => [
      ...prev,
      { productId: product.id, name: product.name, imageUrl: product.imageUrl, quantity: 1 },
    ]);
    setSearchResults((prev) => prev.filter((p) => p.id !== product.id));
    setProductSearch("");
  }

  function removeProduct(productId: string) {
    setSelectedProducts((prev) => prev.filter((p) => p.productId !== productId));
  }

  function updateProductQuantity(productId: string, quantity: number) {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.productId === productId ? { ...p, quantity: Math.max(1, quantity) } : p))
    );
  }

  function openCreateDialog() {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedProducts([]);
    setProductSearch("");
    setSearchResults([]);
    setDialogOpen(true);
  }

  function openEditDialog(bundle: Bundle) {
    setEditingId(bundle.id);
    // Populate additional images from bundleImages (excluding the main imageUrl)
    const additionalImages = (bundle.bundleImages || [])
      .map((bi) => bi.imageUrl)
      .filter((url) => url !== bundle.imageUrl);
    setForm({
      name: bundle.name,
      description: bundle.description || "",
      imageUrl: bundle.imageUrl || "",
      images: additionalImages,
      price: String(bundle.price),
      externalUrl: bundle.externalUrl || "",
      items: bundle.items || "",
    });
    // Populate selectedProducts from bundleProducts
    setSelectedProducts(
      (bundle.bundleProducts || []).map((bp) => ({
        productId: bp.productId,
        name: bp.productName || "Unknown Product",
        imageUrl: bp.productImageUrl || null,
        quantity: bp.quantity,
      }))
    );
    setProductSearch("");
    setSearchResults([]);
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedBranchId) {
      toast.error("Please select a branch first");
      return;
    }

    setSubmitting(true);

    try {
      // Combine main imageUrl + additional images for the API
      const allImages = [
        ...(form.imageUrl ? [form.imageUrl] : []),
        ...form.images,
      ];

      const payload = {
        branchId: selectedBranchId,
        name: form.name,
        description: form.description,
        imageUrl: form.imageUrl,
        images: allImages.length > 0 ? allImages : undefined,
        price: parseFloat(form.price),
        externalUrl: form.externalUrl,
        items: form.items,
        products: selectedProducts.map((p) => ({
          productId: p.productId,
          quantity: p.quantity,
        })),
      };

      let res: Response;

      if (editingId) {
        res = await fetch(`/api/dashboard/bundles/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/dashboard/bundles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to save bundle");
        return;
      }

      toast.success(editingId ? "Bundle updated successfully" : "Bundle created successfully");
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      setSelectedProducts([]);
      fetchBundles();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/dashboard/bundles/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to delete bundle");
        return;
      }

      toast.success("Bundle deleted successfully");
      fetchBundles();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  }

  if (!selectedBranchId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Bundles</h1>
          <p className="text-muted-foreground">Please select a branch to manage bundles.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bundles</h1>
          <p className="text-muted-foreground">
            {bundles.length} bundle{bundles.length !== 1 ? "s" : ""} created
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingId(null);
            setForm(emptyForm);
            setSelectedProducts([]);
            setProductSearch("");
            setSearchResults([]);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} style={{ backgroundColor: "#0056b2" }} className="text-white hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Create Bundle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Bundle" : "Create New Bundle"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bundle-name">Bundle Name *</Label>
                <Input
                  id="bundle-name"
                  placeholder="e.g., Weekend Essentials Pack"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bundle-description">Description</Label>
                <Input
                  id="bundle-description"
                  placeholder="A brief description of this bundle"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Main Image</Label>
                <ImageUpload
                  value={form.imageUrl || undefined}
                  onChange={(url) => setForm({ ...form, imageUrl: url })}
                  onRemove={() => setForm({ ...form, imageUrl: "" })}
                  folder="bundles"
                  aspectRatio="auto"
                  label="Upload Main Image"
                />
              </div>
              <div className="space-y-2">
                <Label>Additional Images</Label>
                <div className="space-y-3">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="flex-1">
                        <ImageUpload
                          value={img}
                          onChange={(url) => {
                            const newImages = [...form.images];
                            newImages[idx] = url;
                            setForm({ ...form, images: newImages });
                          }}
                          onRemove={() => {
                            setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
                          }}
                          folder="bundles"
                          aspectRatio="auto"
                          label={`Image ${idx + 2}`}
                        />
                      </div>
                    </div>
                  ))}
                  {form.images.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, images: [...form.images, ""] })}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add another image ({form.images.length}/5)
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bundle-price">Price *</Label>
                  <Input
                    id="bundle-price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bundle-url">External URL</Label>
                  <Input
                    id="bundle-url"
                    placeholder="https://..."
                    value={form.externalUrl}
                    onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                  />
                </div>
              </div>

              {/* Bundle Products Selection */}
              <div className="space-y-2">
                <Label>Bundle Products *</Label>
                <p className="text-xs text-muted-foreground">
                  Search and add products to this bundle. At least one product is required.
                </p>

                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search products to add..."
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      searchProducts(e.target.value);
                    }}
                    className="pl-9"
                  />
                </div>

                {/* Search results dropdown */}
                {(searchResults.length > 0 || searching) && productSearch.trim() && (
                  <div className="border border-slate-200 rounded-lg max-h-40 overflow-y-auto bg-white shadow-sm">
                    {searching ? (
                      <div className="p-3 text-sm text-slate-400 text-center">Searching...</div>
                    ) : (
                      searchResults.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 transition-colors text-left"
                          onClick={() => addProduct(product)}
                        >
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-8 w-8 rounded object-cover bg-slate-100"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center">
                              <Package className="h-4 w-4 text-slate-300" />
                            </div>
                          )}
                          <span className="text-sm text-slate-700 truncate">{product.name}</span>
                          <Plus className="h-4 w-4 text-slate-400 ml-auto shrink-0" />
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Selected products */}
                {selectedProducts.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {selectedProducts.map((sp) => (
                      <div
                        key={sp.productId}
                        className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100"
                      >
                        {sp.imageUrl ? (
                          <img
                            src={sp.imageUrl}
                            alt={sp.name}
                            className="h-8 w-8 rounded object-cover bg-slate-100"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-slate-200 flex items-center justify-center">
                            <Package className="h-4 w-4 text-slate-400" />
                          </div>
                        )}
                        <span className="text-sm text-slate-700 flex-1 truncate">{sp.name}</span>
                        <div className="flex items-center gap-1">
                          <Label className="text-xs text-slate-500 sr-only">Qty</Label>
                          <Input
                            type="number"
                            min="1"
                            value={sp.quantity}
                            onChange={(e) =>
                              updateProductQuantity(sp.productId, parseInt(e.target.value) || 1)
                            }
                            className="w-16 h-7 text-xs text-center"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProduct(sp.productId)}
                          className="p-1 hover:bg-red-50 rounded transition-colors"
                        >
                          <X className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bundle-items">Items Description (optional)</Label>
                <Input
                  id="bundle-items"
                  placeholder="e.g., Milk, Bread, Eggs, Butter"
                  value={form.items}
                  onChange={(e) => setForm({ ...form, items: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Optional comma-separated text description of items in this bundle
                </p>
              </div>
              <Button
                type="submit"
                className="w-full text-white hover:opacity-90"
                style={{ backgroundColor: "#0056b2" }}
                disabled={submitting}
              >
                {submitting
                  ? editingId ? "Updating..." : "Creating..."
                  : editingId ? "Update Bundle" : "Create Bundle"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bundles Grid */}
      {bundles.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-1">No bundles yet</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Create your first bundle to offer grouped products at a special price.
            </p>
            <Button onClick={openCreateDialog} style={{ backgroundColor: "#0056b2" }} className="text-white hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Create Bundle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((bundle) => (
            <Card key={bundle.id} className="rounded-2xl overflow-hidden flex flex-col">
              {/* Bundle Image */}
              {bundle.imageUrl ? (
                <div className="relative h-48 bg-slate-100">
                  <img
                    src={bundle.imageUrl}
                    alt={bundle.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={bundle.active ? "default" : "secondary"}
                      className={bundle.active ? "bg-emerald-600 text-white" : ""}
                    >
                      {bundle.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="relative h-48 bg-slate-100 flex items-center justify-center">
                  <Package className="h-12 w-12 text-slate-300" />
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={bundle.active ? "default" : "secondary"}
                      className={bundle.active ? "bg-emerald-600 text-white" : ""}
                    >
                      {bundle.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Bundle Details */}
              <CardContent className="flex-1 flex flex-col gap-3 pt-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg leading-tight text-slate-900">
                      {bundle.name}
                    </h3>
                    <span
                      className="text-lg font-bold whitespace-nowrap"
                      style={{ color: "#0056b2" }}
                    >
                      ${Number(bundle.price).toFixed(2)}
                    </span>
                  </div>

                  {bundle.description && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {bundle.description}
                    </p>
                  )}

                  {/* Bundle Products */}
                  {bundle.bundleProducts && bundle.bundleProducts.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {bundle.bundleProducts.map((bp) => (
                        <Badge key={bp.productId} variant="outline" className="text-xs font-normal text-slate-600">
                          {bp.productName || "Product"}{bp.quantity > 1 ? ` x${bp.quantity}` : ""}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Legacy text items */}
                  {bundle.items && (!bundle.bundleProducts || bundle.bundleProducts.length === 0) && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {bundle.items.split(",").map((item, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs font-normal text-slate-600">
                          {item.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {bundle.externalUrl && (
                    <a
                      href={bundle.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs mt-2 hover:underline"
                      style={{ color: "#0056b2" }}
                    >
                      <ExternalLink className="h-3 w-3" />
                      View external link
                    </a>
                  )}
                </div>

                <div className="text-xs text-slate-400">
                  Created {new Date(bundle.createdAt).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(bundle)}
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={() => handleDelete(bundle.id)}
                    disabled={deletingId === bundle.id}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    {deletingId === bundle.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
