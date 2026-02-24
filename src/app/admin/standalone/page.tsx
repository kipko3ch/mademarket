"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";
import { Plus, Edit2, Trash2, ShoppingBag, MessageCircle, ExternalLink, Tag } from "lucide-react";

interface Listing {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  categoryId: string | null;
  categoryName: string | null;
  price: number | null;
  checkoutType: "whatsapp" | "external_url";
  whatsappNumber: string | null;
  externalUrl: string | null;
  featured: boolean;
  active: boolean;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

const EMPTY_FORM = {
  title: "",
  description: "",
  categoryId: "",
  price: "",
  checkoutType: "whatsapp" as "whatsapp" | "external_url",
  whatsappNumber: "",
  externalUrl: "",
  featured: false,
  active: true,
};

type FormState = typeof EMPTY_FORM;

export default function AdminStandaloneListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);

  const fetchListings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/standalone");
      if (res.ok) setListings(await res.json());
    } catch {
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) setCategories(await res.json());
    } catch { /* swallow */ }
  }, []);

  useEffect(() => {
    fetchListings();
    fetchCategories();
  }, [fetchListings, fetchCategories]);

  function openCreateDialog() {
    setEditingListing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEditDialog(listing: Listing) {
    setEditingListing(listing);
    setForm({
      title: listing.title,
      description: listing.description ?? "",
      categoryId: listing.categoryId ?? "",
      price: listing.price != null ? String(listing.price) : "",
      checkoutType: listing.checkoutType,
      whatsappNumber: listing.whatsappNumber ?? "",
      externalUrl: listing.externalUrl ?? "",
      featured: listing.featured,
      active: listing.active,
    });
    setDialogOpen(true);
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      categoryId: form.categoryId || null,
      price: form.price !== "" ? parseFloat(form.price) : null,
      checkoutType: form.checkoutType,
      whatsappNumber: form.checkoutType === "whatsapp" ? form.whatsappNumber.trim() || null : null,
      externalUrl: form.checkoutType === "external_url" ? form.externalUrl.trim() || null : null,
      featured: form.featured,
      active: form.active,
    };
    setSubmitting(true);
    try {
      const res = editingListing
        ? await fetch(`/api/admin/standalone/${editingListing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/admin/standalone", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        toast.success(editingListing ? "Listing updated" : "Listing created");
        setDialogOpen(false);
        fetchListings();
      } else {
        const err = await res.json();
        toast.error(err.error || "Something went wrong");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(listing: Listing) {
    setActionLoading(listing.id);
    try {
      const res = await fetch(`/api/admin/standalone/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !listing.active }),
      });
      if (res.ok) {
        toast.success(listing.active ? "Listing deactivated" : "Listing activated");
        fetchListings();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update");
      }
    } catch { toast.error("Network error"); } finally { setActionLoading(null); }
  }

  async function handleDelete(listing: Listing) {
    setActionLoading(listing.id);
    try {
      const res = await fetch(`/api/admin/standalone/${listing.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`"${listing.title}" deleted`);
        fetchListings();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete");
      }
    } catch { toast.error("Network error"); } finally { setActionLoading(null); setDeleteTarget(null); }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marketplace Listings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage standalone listings (cars, houses, and more)</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2"><Plus className="h-4 w-4" />New Listing</Button>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl flex flex-col items-center justify-center py-20 text-slate-400">
          <ShoppingBag className="h-10 w-10 mb-3 opacity-40" />
          <p className="font-medium text-slate-500">No listings yet</p>
          <p className="text-sm mt-1">Create your first listing to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <div key={listing.id} className={`bg-white border border-slate-100 rounded-2xl overflow-hidden flex flex-col transition-opacity ${!listing.active ? "opacity-60" : ""}`}>
              <div className="h-36 bg-slate-100 flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-slate-300" />
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 flex-1">{listing.title}</p>
                  {listing.featured && <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] shrink-0">Featured</Badge>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {listing.categoryName && <Badge variant="secondary" className="gap-1 bg-slate-100 text-slate-600 border-0 text-[11px]"><Tag className="h-2.5 w-2.5" />{listing.categoryName}</Badge>}
                  {listing.checkoutType === "whatsapp"
                    ? <Badge className="gap-1 bg-green-100 text-green-700 border-0 text-[11px]"><MessageCircle className="h-2.5 w-2.5" />WhatsApp</Badge>
                    : <Badge className="gap-1 bg-blue-100 text-blue-700 border-0 text-[11px]"><ExternalLink className="h-2.5 w-2.5" />Website</Badge>}
                </div>
                {listing.price != null && <p className="text-base font-bold text-slate-900">N$ {Number(listing.price).toFixed(2)}</p>}
                <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Switch checked={listing.active} disabled={actionLoading === listing.id} onCheckedChange={() => handleToggleActive(listing)} />
                    <span className="text-xs text-slate-500">{listing.active ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="outline" className="h-8 w-8 text-slate-500 hover:bg-slate-50 border-slate-200" onClick={() => openEditDialog(listing)} title="Edit"><Edit2 className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="outline" className="h-8 w-8 text-red-500 hover:bg-red-50 border-red-200" disabled={actionLoading === listing.id} onClick={() => setDeleteTarget(listing)} title="Delete"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && setDialogOpen(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingListing ? "Edit Listing" : "New Listing"}</DialogTitle>
            <DialogDescription>{editingListing ? "Update the details of this marketplace listing." : "Add a new standalone marketplace listing."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input id="title" placeholder="e.g. 2021 Toyota Land Cruiser" value={form.title} onChange={(e) => setField("title", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe this listing..." rows={3} value={form.description} onChange={(e) => setField("description", e.target.value)} className="resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.categoryId || "none"} onValueChange={(val) => setField("categoryId", val === "none" ? "" : val)}>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (optional)</Label>
              <Input id="price" type="number" min={0} step="0.01" placeholder="e.g. 350000" value={form.price} onChange={(e) => setField("price", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Checkout Type</Label>
              <div className="flex gap-6">
                {(["whatsapp", "external_url"] as const).map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="checkoutType" value={type} checked={form.checkoutType === type} onChange={() => setField("checkoutType", type)} className="accent-slate-800" />
                    <span className="text-sm text-slate-700">{type === "whatsapp" ? "WhatsApp" : "Website URL"}</span>
                  </label>
                ))}
              </div>
            </div>
            {form.checkoutType === "whatsapp" && (
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input id="whatsapp" type="tel" placeholder="+264812345678" value={form.whatsappNumber} onChange={(e) => setField("whatsappNumber", e.target.value)} />
              </div>
            )}
            {form.checkoutType === "external_url" && (
              <div className="space-y-1.5">
                <Label htmlFor="externalUrl">External URL</Label>
                <Input id="externalUrl" type="url" placeholder="https://example.com/listing" value={form.externalUrl} onChange={(e) => setField("externalUrl", e.target.value)} />
              </div>
            )}
            <div className="flex flex-col gap-3 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between pt-2">
                <div><p className="text-sm font-medium text-slate-800">Featured</p><p className="text-xs text-slate-500">Highlight on the marketplace homepage</p></div>
                <Switch checked={form.featured} onCheckedChange={(val) => setField("featured", val)} />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium text-slate-800">Active</p><p className="text-xs text-slate-500">Visible to the public</p></div>
                <Switch checked={form.active} onCheckedChange={(val) => setField("active", val)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? (editingListing ? "Saving..." : "Creating...") : (editingListing ? "Save Changes" : "Create Listing")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleteTarget?.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this listing and cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => deleteTarget && handleDelete(deleteTarget)}>{actionLoading === deleteTarget?.id ? "Deleting..." : "Delete Listing"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
