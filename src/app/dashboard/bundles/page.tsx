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
import { Plus, Edit2, Trash2, Package, ExternalLink } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

interface Bundle {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  externalUrl: string | null;
  items: string | null;
  active: boolean;
  createdAt: string;
}

const emptyForm = {
  name: "",
  description: "",
  imageUrl: "",
  price: "",
  externalUrl: "",
  items: "",
};

export default function VendorBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchBundles = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/bundles");
      if (res.ok) {
        setBundles(await res.json());
      }
    } catch {
      toast.error("Failed to load bundles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBundles();
  }, [fetchBundles]);

  function openCreateDialog() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(bundle: Bundle) {
    setEditingId(bundle.id);
    setForm({
      name: bundle.name,
      description: bundle.description || "",
      imageUrl: bundle.imageUrl || "",
      price: String(bundle.price),
      externalUrl: bundle.externalUrl || "",
      items: bundle.items || "",
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: form.name,
        description: form.description,
        imageUrl: form.imageUrl,
        price: parseFloat(form.price),
        externalUrl: form.externalUrl,
        items: form.items,
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
                <Label>Bundle Image</Label>
                <ImageUpload
                  value={form.imageUrl || undefined}
                  onChange={(url) => setForm({ ...form, imageUrl: url })}
                  onRemove={() => setForm({ ...form, imageUrl: "" })}
                  folder="bundles"
                  aspectRatio="auto"
                  label="Upload Bundle Image"
                />
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
              <div className="space-y-2">
                <Label htmlFor="bundle-items">Items (comma-separated)</Label>
                <Input
                  id="bundle-items"
                  placeholder="e.g., Milk, Bread, Eggs, Butter"
                  value={form.items}
                  onChange={(e) => setForm({ ...form, items: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  List the items included in this bundle, separated by commas
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

                  {bundle.items && (
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
