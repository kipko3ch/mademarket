"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { toast } from "sonner";
import { Plus, Tags, Loader2, Edit2, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) setCategories(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function openCreateDialog() {
    setEditingId(null);
    setName("");
    setImageUrl("");
    setDialogOpen(true);
  }

  function openEditDialog(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setImageUrl(cat.imageUrl || "");
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : "/api/categories";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, imageUrl: imageUrl || null }),
      });

      if (res.ok) {
        toast.success(editingId ? "Category updated" : "Category created");
        setName("");
        setImageUrl("");
        setEditingId(null);
        setDialogOpen(false);
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save category");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function seedDefaults() {
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/categories", { method: "POST" });
      if (res.ok) {
        toast.success("Default categories seeded!");
        await fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to seed categories");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {categories.length} categor{categories.length !== 1 ? "ies" : "y"} — used to organise products across the platform.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Category" : "Create Category"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input
                  placeholder="e.g., Dairy, Bakery, Produce"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Category Image</Label>
                <ImageUpload
                  value={imageUrl || undefined}
                  onChange={(url) => setImageUrl(url)}
                  onRemove={() => setImageUrl("")}
                  folder="categories"
                  aspectRatio="square"
                  label="Upload Category Image"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Saving..." : editingId ? "Save Changes" : "Create Category"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category list */}
      {loading ? (
        <div className="text-center py-16">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <Tags className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-4">No categories in the database yet.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={seedDefaults} disabled={seeding} variant="default">
              {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Load Default Categories
            </Button>
            <span className="text-xs text-muted-foreground">or</span>
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create From Scratch
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            &quot;Load Default Categories&quot; will create 20 common grocery categories.
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      {cat.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cat.imageUrl} alt={cat.name} className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Tags className="h-4 w-4 text-slate-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(cat.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditDialog(cat)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
