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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, FileText, Calendar } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

interface Brochure {
  id: string;
  title: string;
  description: string | null;
  bannerImageUrl: string | null;
  thumbnailImageUrl: string | null;
  status: "draft" | "published";
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
}

const emptyForm = {
  title: "",
  description: "",
  bannerImageUrl: "",
  thumbnailImageUrl: "",
  status: "draft" as "draft" | "published",
  validFrom: "",
  validUntil: "",
};

export default function VendorBrochuresPage() {
  const [brochures, setBrochures] = useState<Brochure[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchBrochures = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/brochures");
      if (res.ok) {
        setBrochures(await res.json());
      }
    } catch {
      toast.error("Failed to load brochures");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrochures();
  }, [fetchBrochures]);

  function openCreateDialog() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(brochure: Brochure) {
    setEditingId(brochure.id);
    setForm({
      title: brochure.title,
      description: brochure.description || "",
      bannerImageUrl: brochure.bannerImageUrl || "",
      thumbnailImageUrl: brochure.thumbnailImageUrl || "",
      status: brochure.status || "draft",
      validFrom: brochure.validFrom
        ? new Date(brochure.validFrom).toISOString().split("T")[0]
        : "",
      validUntil: brochure.validUntil
        ? new Date(brochure.validUntil).toISOString().split("T")[0]
        : "",
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        bannerImageUrl: form.bannerImageUrl || undefined,
        thumbnailImageUrl: form.thumbnailImageUrl || undefined,
        status: form.status,
        validFrom: form.validFrom || undefined,
        validUntil: form.validUntil || undefined,
      };

      let res: Response;

      if (editingId) {
        res = await fetch(`/api/dashboard/brochures/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/dashboard/brochures", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to save brochure");
        return;
      }

      toast.success(
        editingId
          ? "Brochure updated successfully"
          : "Brochure created successfully"
      );
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      fetchBrochures();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/dashboard/brochures/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to delete brochure");
        return;
      }

      toast.success("Brochure deleted successfully");
      fetchBrochures();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString();
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
          <h1 className="text-2xl font-bold">Brochures</h1>
          <p className="text-muted-foreground">
            {brochures.length} brochure{brochures.length !== 1 ? "s" : ""}{" "}
            created
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingId(null);
              setForm(emptyForm);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={openCreateDialog}
              style={{ backgroundColor: "#0056b2" }}
              className="text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Brochure
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Brochure" : "Create New Brochure"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update the details of your brochure."
                  : "Fill in the details to create a new brochure."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brochure-title">Title *</Label>
                <Input
                  id="brochure-title"
                  placeholder="e.g., Summer Sale Brochure"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brochure-description">Description</Label>
                <Input
                  id="brochure-description"
                  placeholder="A brief description of this brochure"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Banner Image</Label>
                <ImageUpload
                  value={form.bannerImageUrl || undefined}
                  onChange={(url) => setForm({ ...form, bannerImageUrl: url })}
                  onRemove={() => setForm({ ...form, bannerImageUrl: "" })}
                  folder="brochures"
                  aspectRatio="banner"
                  label="Upload Banner Image"
                />
              </div>
              <div className="space-y-2">
                <Label>Thumbnail Image</Label>
                <ImageUpload
                  value={form.thumbnailImageUrl || undefined}
                  onChange={(url) =>
                    setForm({ ...form, thumbnailImageUrl: url })
                  }
                  onRemove={() => setForm({ ...form, thumbnailImageUrl: "" })}
                  folder="brochures"
                  aspectRatio="square"
                  label="Upload Thumbnail Image"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brochure-status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value: "draft" | "published") =>
                    setForm({ ...form, status: value })
                  }
                >
                  <SelectTrigger id="brochure-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brochure-valid-from">Valid From</Label>
                  <Input
                    id="brochure-valid-from"
                    type="date"
                    value={form.validFrom}
                    onChange={(e) =>
                      setForm({ ...form, validFrom: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brochure-valid-until">Valid Until</Label>
                  <Input
                    id="brochure-valid-until"
                    type="date"
                    value={form.validUntil}
                    onChange={(e) =>
                      setForm({ ...form, validUntil: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full text-white hover:opacity-90"
                style={{ backgroundColor: "#0056b2" }}
                disabled={submitting}
              >
                {submitting
                  ? editingId
                    ? "Updating..."
                    : "Creating..."
                  : editingId
                    ? "Update Brochure"
                    : "Create Brochure"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Brochures Grid */}
      {brochures.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-1">No brochures yet</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Create your first brochure to showcase your products and
              promotions.
            </p>
            <Button
              onClick={openCreateDialog}
              style={{ backgroundColor: "#0056b2" }}
              className="text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Brochure
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brochures.map((brochure) => (
            <Card
              key={brochure.id}
              className="rounded-2xl overflow-hidden flex flex-col"
            >
              {/* Brochure Image */}
              {brochure.bannerImageUrl ? (
                <div className="relative h-48 bg-slate-100">
                  <img
                    src={brochure.bannerImageUrl}
                    alt={brochure.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={
                        brochure.status === "published"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        brochure.status === "published"
                          ? "bg-emerald-600 text-white"
                          : ""
                      }
                    >
                      {brochure.status === "published"
                        ? "Published"
                        : "Draft"}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="relative h-48 bg-slate-100 flex items-center justify-center">
                  <FileText className="h-12 w-12 text-slate-300" />
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={
                        brochure.status === "published"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        brochure.status === "published"
                          ? "bg-emerald-600 text-white"
                          : ""
                      }
                    >
                      {brochure.status === "published"
                        ? "Published"
                        : "Draft"}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Brochure Details */}
              <CardContent className="flex-1 flex flex-col gap-3 pt-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg leading-tight text-slate-900">
                    {brochure.title}
                  </h3>

                  {brochure.description && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {brochure.description}
                    </p>
                  )}

                  {(brochure.validFrom || brochure.validUntil) && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {formatDate(brochure.validFrom) || "No start date"}
                        {" - "}
                        {formatDate(brochure.validUntil) || "No end date"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-400">
                  Created {new Date(brochure.createdAt).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(brochure)}
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={() => handleDelete(brochure.id)}
                    disabled={deletingId === brochure.id}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    {deletingId === brochure.id ? "Deleting..." : "Delete"}
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
