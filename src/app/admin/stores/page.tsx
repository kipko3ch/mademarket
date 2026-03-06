"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Check,
  X,
  Store,
  Eye,
  EyeOff,
  Trash2,
  Play,
  Pause,
  ChevronDown,
  ChevronRight,
  MapPin,
  ArrowUp,
  ArrowDown,
  GitBranch,
  Plus,
} from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

/* ---------- Types ---------- */

interface VendorItem {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  approved: boolean;
  active: boolean;
  branchCount: number;
  createdAt: string;
}

interface BranchItem {
  id: string;
  branchName: string;
  city: string | null;
  area: string | null;
  town: string | null;
  region: string | null;
  approved: boolean;
  active: boolean;
  showInMarquee: boolean;
  marqueeOrder: number;
  createdAt: string;
}

/* ---------- Component ---------- */

function AdminVendorsContent() {
  const searchParams = useSearchParams();
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VendorItem | null>(null);

  // Expanded vendor rows -> branch lists
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null);
  const [branchesMap, setBranchesMap] = useState<Record<string, BranchItem[]>>({});
  const [branchesLoading, setBranchesLoading] = useState<string | null>(null);

  // Create vendor dialog
  const [createVendorOpen, setCreateVendorOpen] = useState(false);
  const [vendorForm, setVendorForm] = useState({
    name: "",
    description: "",
    logoUrl: "",
    websiteUrl: "",
    branchName: "",
    city: "",
    area: "",
    address: "",
    whatsappNumber: "",
  });
  const [creatingVendor, setCreatingVendor] = useState(false);

  // Create branch dialog
  const [createBranchOpen, setCreateBranchOpen] = useState(false);
  const [branchForVendor, setBranchForVendor] = useState<VendorItem | null>(null);
  const [branchForm, setBranchForm] = useState({
    branchName: "",
    city: "",
    area: "",
    address: "",
    whatsappNumber: "",
    logoUrl: "",
  });
  const [creatingBranch, setCreatingBranch] = useState(false);

  /* ---- Fetch vendors ---- */
  const fetchVendors = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/vendors");
      if (res.ok) setVendors(await res.json());
    } catch {
      /* swallow */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  /* ---- Fetch branches for a vendor ---- */
  async function fetchBranches(vendorId: string) {
    setBranchesLoading(vendorId);
    try {
      const res = await fetch(`/api/admin/branches?vendorId=${vendorId}`);
      if (res.ok) {
        const data: BranchItem[] = await res.json();
        setBranchesMap((prev) => ({ ...prev, [vendorId]: data }));
      }
    } catch {
      toast.error("Failed to load branches");
    } finally {
      setBranchesLoading(null);
    }
  }

  function toggleExpand(vendorId: string) {
    if (expandedVendorId === vendorId) {
      setExpandedVendorId(null);
      return;
    }
    setExpandedVendorId(vendorId);
    if (!branchesMap[vendorId]) {
      fetchBranches(vendorId);
    }
  }

  /* ---- Vendor actions ---- */
  async function handleVendorUpdate(vendorId: string, data: Record<string, unknown>) {
    setActionLoading(vendorId);
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Vendor updated");
        fetchVendors();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update vendor");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleVendorDelete(vendor: VendorItem) {
    setActionLoading(vendor.id);
    try {
      const res = await fetch(`/api/admin/vendors/${vendor.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(`"${vendor.name}" deleted — all branches, products, bundles, and brochures removed`);
        fetchVendors();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete vendor");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
      setDeleteTarget(null);
    }
  }

  /* ---- Branch actions ---- */
  async function handleBranchUpdate(branchId: string, vendorId: string, data: Record<string, unknown>) {
    setActionLoading(branchId);
    try {
      const res = await fetch(`/api/admin/branches/${branchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Branch updated");
        fetchBranches(vendorId);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update branch");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  }

  /* ---- Create vendor ---- */
  async function handleCreateVendor(e: React.FormEvent) {
    e.preventDefault();
    if (!vendorForm.name.trim() || !vendorForm.branchName.trim()) return;
    setCreatingVendor(true);
    try {
      const res = await fetch("/api/admin/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendorForm),
      });
      if (res.ok) {
        toast.success(`Vendor "${vendorForm.name}" created with branch`);
        setCreateVendorOpen(false);
        setVendorForm({ name: "", description: "", logoUrl: "", websiteUrl: "", branchName: "", city: "", area: "", address: "", whatsappNumber: "" });
        fetchVendors();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create vendor");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreatingVendor(false);
    }
  }

  /* ---- Create branch ---- */
  function openCreateBranch(vendor: VendorItem) {
    setBranchForVendor(vendor);
    setBranchForm({ branchName: "", city: "", area: "", address: "", whatsappNumber: "", logoUrl: "" });
    setCreateBranchOpen(true);
  }

  async function handleCreateBranch(e: React.FormEvent) {
    e.preventDefault();
    if (!branchForVendor || !branchForm.branchName.trim()) return;
    setCreatingBranch(true);
    try {
      const res = await fetch(`/api/vendors/${branchForVendor.id}/branches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branchForm),
      });
      if (res.ok) {
        toast.success(`Branch "${branchForm.branchName}" added to ${branchForVendor.name}`);
        setCreateBranchOpen(false);
        fetchVendors();
        // Refresh branches if expanded
        if (expandedVendorId === branchForVendor.id) {
          fetchBranches(branchForVendor.id);
        }
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create branch");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreatingBranch(false);
    }
  }

  /* ---- Badges ---- */
  function getVendorStatusBadge(vendor: VendorItem) {
    if (!vendor.active) {
      return <Badge className="bg-red-100 text-red-700 border-0">Inactive</Badge>;
    }
    if (vendor.approved) {
      return <Badge className="bg-green-100 text-green-700 border-0">Approved</Badge>;
    }
    return <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-0">Pending</Badge>;
  }

  function getBranchStatusBadge(branch: BranchItem) {
    if (!branch.active) {
      return <Badge className="bg-red-100 text-red-700 border-0">Inactive</Badge>;
    }
    if (branch.approved) {
      return <Badge className="bg-green-100 text-green-700 border-0">Approved</Badge>;
    }
    return <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-0">Pending</Badge>;
  }

  /* ---- Loading state ---- */
  if (loading) {
    return <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Vendors</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Approve, deactivate, or remove vendors and manage their branches
          </p>
        </div>
        <Button onClick={() => setCreateVendorOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Vendor
        </Button>
      </div>

      {/* Search bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-3">
        <input
          type="text"
          placeholder="Search vendors by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white transition-all outline-none"
        />
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs font-bold text-slate-500 w-8" />
              <TableHead className="text-xs font-bold text-slate-500">Vendor</TableHead>
              <TableHead className="text-xs font-bold text-slate-500">Owner</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 text-center">Branches</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 text-center">Status</TableHead>
              <TableHead className="text-xs font-bold text-slate-500">Registered</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 w-44">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.filter((v) => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return v.name.toLowerCase().includes(q) || v.ownerEmail.toLowerCase().includes(q) || v.ownerName.toLowerCase().includes(q);
              }).length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                  <Store className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  {searchQuery ? "No vendors match your search" : "No vendors registered yet"}
                </TableCell>
              </TableRow>
            ) : (
              vendors.filter((v) => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return v.name.toLowerCase().includes(q) || v.ownerEmail.toLowerCase().includes(q) || v.ownerName.toLowerCase().includes(q);
              }).map((vendor) => {
                const isExpanded = expandedVendorId === vendor.id;
                const vendorBranches = branchesMap[vendor.id] || [];

                return (
                  <>
                    {/* Vendor Row */}
                    <TableRow
                      key={vendor.id}
                      className={`hover:bg-slate-50/50 ${!vendor.active ? "opacity-60" : ""}`}
                    >
                      <TableCell>
                        <button
                          onClick={() => toggleExpand(vendor.id)}
                          className="p-1 rounded hover:bg-slate-100 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-semibold text-slate-900">{vendor.name}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-700">{vendor.ownerName}</p>
                        <p className="text-xs text-slate-400">{vendor.ownerEmail}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-600">
                          <GitBranch className="h-3.5 w-3.5" />
                          {vendor.branchCount}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getVendorStatusBadge(vendor)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {new Date(vendor.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {/* Approve / Revoke */}
                          {!vendor.approved ? (
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 text-green-600 hover:bg-green-50 border-green-200"
                              disabled={actionLoading === vendor.id}
                              onClick={() => handleVendorUpdate(vendor.id, { approved: true })}
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 text-slate-500 hover:bg-slate-50 border-slate-200"
                              disabled={actionLoading === vendor.id}
                              onClick={() => handleVendorUpdate(vendor.id, { approved: false })}
                              title="Revoke approval"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Toggle active */}
                          <Button
                            size="icon"
                            variant="outline"
                            className={`h-8 w-8 ${
                              !vendor.active
                                ? "text-green-600 hover:bg-green-50 border-green-200"
                                : "text-amber-600 hover:bg-amber-50 border-amber-200"
                            }`}
                            disabled={actionLoading === vendor.id}
                            onClick={() => handleVendorUpdate(vendor.id, { active: !vendor.active })}
                            title={vendor.active ? "Deactivate" : "Activate"}
                          >
                            {vendor.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>

                          {/* Add Branch */}
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50 border-blue-200"
                            disabled={actionLoading === vendor.id}
                            onClick={() => openCreateBranch(vendor)}
                            title="Add branch"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>

                          {/* Delete */}
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 text-red-500 hover:bg-red-50 border-red-200"
                            disabled={actionLoading === vendor.id}
                            onClick={() => setDeleteTarget(vendor)}
                            title="Delete vendor"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Branches */}
                    {isExpanded && (
                      <TableRow key={`${vendor.id}-branches`}>
                        <TableCell colSpan={7} className="bg-slate-50/50 px-0 py-0">
                          {branchesLoading === vendor.id ? (
                            <div className="py-6 text-center text-sm text-slate-400">
                              Loading branches...
                            </div>
                          ) : vendorBranches.length === 0 ? (
                            <div className="py-6 text-center text-sm text-slate-400">
                              No branches for this vendor
                            </div>
                          ) : (
                            <div className="px-4 py-3">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                                Branches ({vendorBranches.length})
                              </p>
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-slate-100/50">
                                    <TableHead className="text-[11px] font-bold text-slate-500">Branch</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-500">Location</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-500 text-center">Status</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-500 text-center">Marquee</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-500 text-center">Order</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-500 w-40">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {vendorBranches.map((branch) => (
                                    <TableRow key={branch.id} className={`hover:bg-white/50 ${!branch.active ? "opacity-60" : ""}`}>
                                      <TableCell>
                                        <p className="text-sm font-medium text-slate-800">{branch.branchName}</p>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-slate-600">
                                          <MapPin className="h-3 w-3 text-slate-400" />
                                          {branch.city || branch.area || branch.town || branch.region
                                            ? [branch.city || branch.town, branch.area || branch.region].filter(Boolean).join(", ")
                                            : "-"}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {getBranchStatusBadge(branch)}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <button
                                          onClick={() =>
                                            handleBranchUpdate(branch.id, vendor.id, {
                                              showInMarquee: !branch.showInMarquee,
                                            })
                                          }
                                          disabled={actionLoading === branch.id}
                                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                                            branch.showInMarquee
                                              ? "bg-primary/10 text-primary"
                                              : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                          }`}
                                        >
                                          {branch.showInMarquee ? (
                                            <Eye className="h-3 w-3" />
                                          ) : (
                                            <EyeOff className="h-3 w-3" />
                                          )}
                                          {branch.showInMarquee ? "Visible" : "Hidden"}
                                        </button>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                          <span className="text-xs font-medium text-slate-600 min-w-[20px] text-center">
                                            {branch.marqueeOrder}
                                          </span>
                                          <div className="flex flex-col">
                                            <button
                                              onClick={() =>
                                                handleBranchUpdate(branch.id, vendor.id, {
                                                  marqueeOrder: Math.max(0, branch.marqueeOrder - 1),
                                                })
                                              }
                                              disabled={actionLoading === branch.id}
                                              className="p-0.5 hover:bg-slate-200 rounded transition-colors"
                                              title="Move up"
                                            >
                                              <ArrowUp className="h-3 w-3 text-slate-400" />
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleBranchUpdate(branch.id, vendor.id, {
                                                  marqueeOrder: branch.marqueeOrder + 1,
                                                })
                                              }
                                              disabled={actionLoading === branch.id}
                                              className="p-0.5 hover:bg-slate-200 rounded transition-colors"
                                              title="Move down"
                                            >
                                              <ArrowDown className="h-3 w-3 text-slate-400" />
                                            </button>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex gap-1">
                                          {/* Approve / Revoke branch */}
                                          {!branch.approved ? (
                                            <Button
                                              size="icon"
                                              variant="outline"
                                              className="h-7 w-7 text-green-600 hover:bg-green-50 border-green-200"
                                              disabled={actionLoading === branch.id}
                                              onClick={() =>
                                                handleBranchUpdate(branch.id, vendor.id, { approved: true })
                                              }
                                              title="Approve branch"
                                            >
                                              <Check className="h-3.5 w-3.5" />
                                            </Button>
                                          ) : (
                                            <Button
                                              size="icon"
                                              variant="outline"
                                              className="h-7 w-7 text-slate-500 hover:bg-slate-50 border-slate-200"
                                              disabled={actionLoading === branch.id}
                                              onClick={() =>
                                                handleBranchUpdate(branch.id, vendor.id, { approved: false })
                                              }
                                              title="Revoke branch approval"
                                            >
                                              <X className="h-3.5 w-3.5" />
                                            </Button>
                                          )}

                                          {/* Toggle active */}
                                          <Button
                                            size="icon"
                                            variant="outline"
                                            className={`h-7 w-7 ${
                                              !branch.active
                                                ? "text-green-600 hover:bg-green-50 border-green-200"
                                                : "text-amber-600 hover:bg-amber-50 border-amber-200"
                                            }`}
                                            disabled={actionLoading === branch.id}
                                            onClick={() =>
                                              handleBranchUpdate(branch.id, vendor.id, { active: !branch.active })
                                            }
                                            title={branch.active ? "Deactivate" : "Activate"}
                                          >
                                            {branch.active ? (
                                              <Pause className="h-3.5 w-3.5" />
                                            ) : (
                                              <Play className="h-3.5 w-3.5" />
                                            )}
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Vendor Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleteTarget?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the vendor and <strong>all associated data</strong>:
              branches, products, prices, bundles, brochures, and sponsored listings.
              The vendor&apos;s account will be downgraded to a regular user.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteTarget && handleVendorDelete(deleteTarget)}
            >
              {actionLoading === deleteTarget?.id ? "Deleting..." : "Delete Vendor"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Vendor Dialog */}
      <Dialog open={createVendorOpen} onOpenChange={setCreateVendorOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Vendor</DialogTitle>
            <DialogDescription>
              Create a vendor with its first branch. Both will be auto-approved and active.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateVendor} className="space-y-4">
            <div className="space-y-2">
              <Label>Vendor Logo</Label>
              <ImageUpload
                value={vendorForm.logoUrl}
                onChange={(url) => setVendorForm({ ...vendorForm, logoUrl: url })}
                onRemove={() => setVendorForm({ ...vendorForm, logoUrl: "" })}
                folder="vendors"
                aspectRatio="square"
                label="Vendor Logo"
              />
            </div>
            <div className="space-y-2">
              <Label>Vendor Name *</Label>
              <Input
                placeholder="e.g., Shoprite"
                value={vendorForm.name}
                onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Brief description..."
                value={vendorForm.description}
                onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                placeholder="e.g., shoprite.com.na"
                value={vendorForm.websiteUrl}
                onChange={(e) => setVendorForm({ ...vendorForm, websiteUrl: e.target.value })}
              />
            </div>
            <hr className="border-slate-100" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">First Branch</p>
            <div className="space-y-2">
              <Label>Branch Name *</Label>
              <Input
                placeholder="e.g., Windhoek Main"
                value={vendorForm.branchName}
                onChange={(e) => setVendorForm({ ...vendorForm, branchName: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  placeholder="e.g., Windhoek"
                  value={vendorForm.city}
                  onChange={(e) => setVendorForm({ ...vendorForm, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Area</Label>
                <Input
                  placeholder="e.g., Katutura"
                  value={vendorForm.area}
                  onChange={(e) => setVendorForm({ ...vendorForm, area: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                placeholder="Street address..."
                value={vendorForm.address}
                onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp Number</Label>
              <Input
                placeholder="e.g., +264812345678"
                value={vendorForm.whatsappNumber}
                onChange={(e) => setVendorForm({ ...vendorForm, whatsappNumber: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={creatingVendor}>
              {creatingVendor ? "Creating..." : "Create Vendor & Branch"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Branch Dialog */}
      <Dialog open={createBranchOpen} onOpenChange={setCreateBranchOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Branch to {branchForVendor?.name}</DialogTitle>
            <DialogDescription>
              Add a new branch location for this vendor.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateBranch} className="space-y-4">
            <div className="space-y-2">
              <Label>Branch Logo</Label>
              <ImageUpload
                value={branchForm.logoUrl}
                onChange={(url) => setBranchForm({ ...branchForm, logoUrl: url })}
                onRemove={() => setBranchForm({ ...branchForm, logoUrl: "" })}
                folder="branches"
                aspectRatio="square"
                label="Branch Logo"
              />
            </div>
            <div className="space-y-2">
              <Label>Branch Name *</Label>
              <Input
                placeholder="e.g., Oshakati Branch"
                value={branchForm.branchName}
                onChange={(e) => setBranchForm({ ...branchForm, branchName: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  placeholder="e.g., Oshakati"
                  value={branchForm.city}
                  onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Area</Label>
                <Input
                  placeholder="e.g., Main Road"
                  value={branchForm.area}
                  onChange={(e) => setBranchForm({ ...branchForm, area: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                placeholder="Street address..."
                value={branchForm.address}
                onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp Number</Label>
              <Input
                placeholder="e.g., +264812345678"
                value={branchForm.whatsappNumber}
                onChange={(e) => setBranchForm({ ...branchForm, whatsappNumber: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={creatingBranch}>
              {creatingBranch ? "Adding..." : "Add Branch"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminVendorsPage() {
  return (
    <Suspense fallback={null}>
      <AdminVendorsContent />
    </Suspense>
  );
}
