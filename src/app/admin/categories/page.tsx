"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, Tag } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  productCount: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data: Category[] = await res.json();
        setCategories(data.sort((a, b) => a.sortOrder - b.sortOrder));
      }
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCategories(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateSubmitting(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName }),
      });
      if (res.ok) {
        toast.success("Category created");
        setCreateName("");
        setCreateOpen(false);
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create category");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreateSubmitting(false);
    }
  }

  function openEdit(cat: Category) {
    setEditTarget(cat);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/categories/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, slug: editSlug }),
      });
      if (res.ok) {
        toast.success("Category updated");
        setEditOpen(false);
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update category");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleToggleActive(cat: Category) {
    const optimistic = categories.map((c) => c.id === cat.id ? { ...c, active: !c.active } : c);
    setCategories(optimistic);
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !cat.active }),
      });
      if (!res.ok) {
        toast.error("Failed to update status");
        fetchCategories();
      } else {
        toast.success(`Category ${!cat.active ? "activated" : "deactivated"}`);
      }
    } catch {
      toast.error("Something went wrong");
      fetchCategories();
    }
  }

  async function handleMove(cat: Category, direction: "up" | "down") {
    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((c) => c.id === cat.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const swapCat = sorted[swapIdx];
    const newOrder = swapCat.sortOrder;
    const swapOrder = cat.sortOrder;
    const updated = categories.map((c) => {
      if (c.id === cat.id) return { ...c, sortOrder: newOrder };
      if (c.id === swapCat.id) return { ...c, sortOrder: swapOrder };
      return c;
    });
    setCategories(updated.sort((a, b) => a.sortOrder - b.sortOrder));
    try {
      await Promise.all([
        fetch(`/api/categories/${cat.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: newOrder }) }),
        fetch(`/api/categories/${swapCat.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: swapOrder }) }),
      ]);
    } catch {
      toast.error("Failed to update sort order");
      fetchCategories();
    }
  }

  function openDelete(cat: Category) {
    setDeleteTarget(cat);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      const res = await fetch(`/api/categories/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Category deleted");
        setDeleteOpen(false);
        fetchCategories();
      } else if (res.status === 409) {
        toast.error("Cannot delete: category has products");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete category");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeleteSubmitting(false);
    }
  }

  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500 mt-1">{categories.length} categor{categories.length !== 1 ? "ies" : "y"} — organise products across the platform.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Category</Button>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="h-6 w-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading categories…</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl">
          <Tag className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 mb-4">No categories yet.</p>
          <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Create First Category</Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-500 w-24">Sort</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 w-24">Products</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 w-20">Active</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((cat, idx) => (
                <tr key={cat.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-xs w-6 text-right">{cat.sortOrder}</span>
                      <div className="flex flex-col">
                        <button onClick={() => handleMove(cat, "up")} disabled={idx === 0} className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:cursor-not-allowed" aria-label="Move up"><ChevronUp className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleMove(cat, "down")} disabled={idx === sorted.length - 1} className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:cursor-not-allowed" aria-label="Move down"><ChevronDown className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{cat.name}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3"><Badge variant={cat.productCount > 0 ? "secondary" : "outline"} className="text-xs">{cat.productCount}</Badge></td>
                  <td className="px-4 py-3"><Switch checked={cat.active} onCheckedChange={() => handleToggleActive(cat)} aria-label={`Toggle ${cat.name} active`} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700" onClick={() => openEdit(cat)} aria-label={`Edit ${cat.name}`}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => openDelete(cat)} aria-label={`Delete ${cat.name}`}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Create Category</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="create-name">Category Name</Label>
              <Input id="create-name" placeholder="e.g. Dairy, Bakery, Produce" value={createName} onChange={(e) => setCreateName(e.target.value)} required autoFocus />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createSubmitting}>{createSubmitting ? "Creating…" : "Create Category"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} required autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-slug">Slug</Label>
              <Input id="edit-slug" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} required placeholder="e.g. dairy-products" className="font-mono text-sm" />
              <p className="text-xs text-slate-400">URL-safe identifier. Changing this may break existing links.</p>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={editSubmitting}>{editSubmitting ? "Saving…" : "Save Changes"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleteTarget?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>This will delete the category. Products using it will be uncategorized.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteSubmitting} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">{deleteSubmitting ? "Deleting…" : "Delete Category"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
