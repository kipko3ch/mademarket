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
import {
  Plus,
  Edit2,
  Trash2,
  GitBranch,
  MapPin,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import { useBranch } from "@/hooks/use-branch";
import { NAMIBIA_REGIONS, NAMIBIA_AREAS } from "@/hooks/use-location";
import { ImageUpload } from "@/components/ui/image-upload";

interface Branch {
  id: string;
  branchName: string;
  slug: string;
  city: string | null;
  area: string | null;
  town: string | null;
  region: string | null;
  address: string | null;
  whatsappNumber: string | null;
  logoUrl: string | null;
  approved: boolean;
  active: boolean;
  showInMarquee: boolean;
  createdAt: string;
}

const emptyForm = {
  branchName: "",
  city: "",
  area: "",
  address: "",
  whatsappNumber: "",
  logoUrl: "",
};

export default function VendorBranchesPage() {
  const { vendor, fetchVendorData } = useBranch();
  const [branchesList, setBranchesList] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const allCities = Object.values(NAMIBIA_REGIONS).flat();
  const areas = form.city ? NAMIBIA_AREAS[form.city] || [] : [];

  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/branches");
      if (res.ok) {
        setBranchesList(await res.json());
      }
    } catch {
      toast.error("Failed to load branches");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (branch: Branch) => {
    setEditingId(branch.id);
    setForm({
      branchName: branch.branchName || "",
      city: branch.city || branch.town || "",
      area: branch.area || "",
      address: branch.address || "",
      whatsappNumber: branch.whatsappNumber || "",
      logoUrl: branch.logoUrl || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.branchName.trim()) {
      toast.error("Branch name is required");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/dashboard/branches/${editingId}`
        : "/api/dashboard/branches";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchName: form.branchName.trim(),
          city: form.city || null,
          area: form.area || null,
          address: form.address.trim() || null,
          whatsappNumber: form.whatsappNumber.trim() || null,
          logoUrl: form.logoUrl || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to save branch");
        return;
      }

      toast.success(editingId ? "Branch updated" : "Branch created — pending admin approval");
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      fetchBranches();
      fetchVendorData();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/dashboard/branches/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete branch");
        return;
      }
      toast.success("Branch deleted");
      fetchBranches();
      fetchVendorData();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Branches</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your store branches across Namibia
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Branch
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Branch" : "Add New Branch"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update this branch's details."
                  : "New branches require admin approval before they appear publicly."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2 pb-4">
              {/* Branch Name */}
              <div className="space-y-2">
                <Label htmlFor="branchName">Branch Name *</Label>
                <Input
                  id="branchName"
                  placeholder="e.g. Windhoek CBD"
                  value={form.branchName}
                  onChange={(e) => setForm({ ...form, branchName: e.target.value })}
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select
                  value={form.city}
                  onValueChange={(val) => setForm({ ...form, city: val, area: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCities.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Area / Suburb */}
              <div className="space-y-2">
                <Label htmlFor="area">Area / Suburb</Label>
                {areas.length > 0 ? (
                  <Select
                    value={form.area}
                    onValueChange={(val) => setForm({ ...form, area: val })}
                    disabled={!form.city}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={form.city ? "Select area/suburb" : "Select city first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map((a) => (
                        <SelectItem key={a} value={a}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="area"
                    placeholder="e.g. Otjomuise, Katutura, Central"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                  />
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="e.g. 123 Independence Ave"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <Input
                  id="whatsappNumber"
                  placeholder="e.g. +264811234567"
                  value={form.whatsappNumber}
                  onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                />
              </div>

              {/* Branch Logo */}
              <div className="space-y-2">
                <Label>Branch Logo</Label>
                <p className="text-[10px] text-slate-400">Optional — overrides vendor logo for this branch</p>
                <ImageUpload
                  value={form.logoUrl || undefined}
                  onChange={(url) => setForm({ ...form, logoUrl: url })}
                  onRemove={() => setForm({ ...form, logoUrl: "" })}
                  folder="branch-logos"
                  aspectRatio="square"
                  label="Branch Logo"
                />
              </div>

              {/* Info note */}
              {!editingId && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>New branches require admin approval before they appear on the marketplace.</span>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full"
              >
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingId ? "Save Changes" : "Create Branch"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vendor not approved warning */}
      {vendor && !vendor.approved && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Vendor Pending Approval</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Your vendor account must be approved before you can add branches. Contact admin at +264818222368.
            </p>
          </div>
        </div>
      )}

      {/* Branches list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : branchesList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <GitBranch className="h-10 w-10 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700">No branches yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Add your first branch to start listing products and appearing on the marketplace.
            </p>
            <Button onClick={openCreateDialog} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Branch
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {branchesList.map((branch) => (
            <Card key={branch.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Branch info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900">
                        {branch.branchName}
                      </h3>
                      {branch.approved ? (
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold uppercase">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold uppercase">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                      {branch.showInMarquee && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold uppercase">
                          Marquee
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                      {(branch.city || branch.area || branch.town) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {[branch.city || branch.town, branch.area].filter(Boolean).join(", ")}
                        </span>
                      )}
                      {branch.whatsappNumber && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {branch.whatsappNumber}
                        </span>
                      )}
                    </div>

                    {branch.address && (
                      <p className="text-xs text-slate-400">{branch.address}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(branch)}
                      className="gap-1.5"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(branch.id)}
                      disabled={deletingId === branch.id}
                      className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      {deletingId === branch.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
