/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Settings, Store, CheckCircle, Clock, Globe, Phone, MapPin, GitBranch, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { NAMIBIA_REGIONS } from "@/hooks/use-location";
import { useBranch } from "@/hooks/use-branch";

interface VendorData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  websiteUrl: string | null;
  approved: boolean;
  active: boolean;
}

interface BranchData {
  id: string;
  branchName: string;
  town: string | null;
  region: string | null;
  address: string | null;
  whatsappNumber: string | null;
  approved: boolean;
  productCount: number;
}

export default function VendorSettingsPage() {
  const { fetchVendorData } = useBranch();

  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingVendor, setSavingVendor] = useState(false);
  const [savingBranchId, setSavingBranchId] = useState<string | null>(null);
  const [expandedBranchId, setExpandedBranchId] = useState<string | null>(null);

  const [vendorForm, setVendorForm] = useState({
    name: "",
    description: "",
    logoUrl: "",
    bannerUrl: "",
    websiteUrl: "",
  });

  const [branchForms, setBranchForms] = useState<Record<string, {
    branchName: string;
    town: string;
    region: string;
    address: string;
    whatsappNumber: string;
  }>>({});

  const regionNames = Object.keys(NAMIBIA_REGIONS);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/dashboard/overview");
        if (res.ok) {
          const data = await res.json();
          if (data.vendor) {
            setVendor(data.vendor);
            setVendorForm({
              name: data.vendor.name || "",
              description: data.vendor.description || "",
              logoUrl: data.vendor.logoUrl || "",
              bannerUrl: data.vendor.bannerUrl || "",
              websiteUrl: data.vendor.websiteUrl || "",
            });
          }
          if (data.branches) {
            setBranches(data.branches);
            const forms: Record<string, typeof branchForms[string]> = {};
            for (const b of data.branches) {
              forms[b.id] = {
                branchName: b.branchName || "",
                town: b.town || "",
                region: b.region || "",
                address: b.address || "",
                whatsappNumber: b.whatsappNumber || "",
              };
            }
            setBranchForms(forms);
          }
        }
      } catch {
        toast.error("Failed to load vendor data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleSaveVendor(e: React.FormEvent) {
    e.preventDefault();
    if (!vendor) return;
    setSavingVendor(true);

    try {
      const res = await fetch("/api/dashboard/vendor-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: vendorForm.name,
          description: vendorForm.description,
          logoUrl: vendorForm.logoUrl,
          bannerUrl: vendorForm.bannerUrl,
          websiteUrl: vendorForm.websiteUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to update vendor settings");
        return;
      }

      toast.success("Vendor settings updated successfully");

      // Refresh vendor data
      const refreshRes = await fetch("/api/dashboard/overview");
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        if (data.vendor) {
          setVendor(data.vendor);
        }
      }
      // Also refresh the branch store
      await fetchVendorData();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSavingVendor(false);
    }
  }

  async function handleSaveBranch(branchId: string, e: React.FormEvent) {
    e.preventDefault();
    const form = branchForms[branchId];
    if (!form) return;
    setSavingBranchId(branchId);

    try {
      const res = await fetch(`/api/dashboard/branches/${branchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchName: form.branchName,
          town: form.town,
          region: form.region,
          address: form.address,
          whatsappNumber: form.whatsappNumber,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to update branch");
        return;
      }

      toast.success(`Branch "${form.branchName}" updated successfully`);

      // Refresh branches
      const refreshRes = await fetch("/api/dashboard/overview");
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        if (data.branches) {
          setBranches(data.branches);
        }
      }
      // Also refresh the branch store
      await fetchVendorData();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSavingBranchId(null);
    }
  }

  function updateBranchForm(branchId: string, field: string, value: string) {
    setBranchForms((prev) => ({
      ...prev,
      [branchId]: {
        ...prev[branchId],
        [field]: value,
      },
    }));
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="h-8 w-56 bg-muted rounded animate-pulse" />
        <div className="h-16 bg-muted rounded-2xl animate-pulse" />
        <div className="h-96 bg-muted rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">No Vendor Account Found</h1>
        <p className="text-muted-foreground">
          You need to register as a vendor before you can manage settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Vendor Settings</h1>
        <p className="text-muted-foreground">Manage your business profile and branch details</p>
      </div>

      {/* Approval Status Banner */}
      <Card className="rounded-2xl overflow-hidden">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            {vendor.approved ? (
              <>
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">Vendor Approved</span>
                    <Badge className="bg-emerald-600 text-white">Active</Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    Your business is live and visible to customers.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-100">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">Pending Approval</span>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      Under Review
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    Your business is being reviewed by our admin team. You will be notified once approved.
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vendor Preview */}
      {(vendorForm.bannerUrl || vendorForm.logoUrl) && (
        <Card className="rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Business Preview</CardTitle>
            <CardDescription>Preview how your business branding looks</CardDescription>
          </CardHeader>
          <CardContent>
            {vendorForm.bannerUrl && (
              <div className="relative h-40 rounded-xl overflow-hidden bg-slate-100 mb-4">
                <img
                  src={vendorForm.bannerUrl}
                  alt="Vendor banner"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {vendorForm.logoUrl && (
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                  <img
                    src={vendorForm.logoUrl}
                    alt="Vendor logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{vendorForm.name || "Business Name"}</p>
                  <p className="text-sm text-slate-500 line-clamp-1">
                    {vendorForm.description || "Business description"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vendor Settings Form */}
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5" style={{ color: "#0056b2" }} />
            <div>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Update your vendor-level details. These apply across all your branches.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveVendor} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Basic Information
              </h3>
              <div className="space-y-2">
                <Label htmlFor="vendor-name">Business Name *</Label>
                <Input
                  id="vendor-name"
                  placeholder="Your business name"
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-description">Description</Label>
                <Input
                  id="vendor-description"
                  placeholder="Brief description of your business"
                  value={vendorForm.description}
                  onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })}
                />
              </div>
            </div>

            {/* Links */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Links
              </h3>
              <div className="space-y-2">
                <Label htmlFor="vendor-website" className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-slate-400" />
                  Website URL
                </Label>
                <Input
                  id="vendor-website"
                  placeholder="https://yourbusiness.com"
                  value={vendorForm.websiteUrl}
                  onChange={(e) => setVendorForm({ ...vendorForm, websiteUrl: e.target.value })}
                />
              </div>
            </div>

            {/* Branding */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Branding
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-start">
                <div className="space-y-2">
                  <Label>Business Logo</Label>
                  <ImageUpload
                    value={vendorForm.logoUrl || undefined}
                    onChange={(url) => setVendorForm({ ...vendorForm, logoUrl: url })}
                    onRemove={() => setVendorForm({ ...vendorForm, logoUrl: "" })}
                    folder="vendors/logos"
                    aspectRatio="square"
                    label="Upload Business Logo"
                    className="max-w-[200px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 200x200px
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Business Banner</Label>
                  <ImageUpload
                    value={vendorForm.bannerUrl || undefined}
                    onChange={(url) => setVendorForm({ ...vendorForm, bannerUrl: url })}
                    onRemove={() => setVendorForm({ ...vendorForm, bannerUrl: "" })}
                    folder="vendors/banners"
                    aspectRatio="banner"
                    label="Upload Business Banner"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 1200x400px
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100">
              <Button
                type="submit"
                className="w-full md:w-auto text-white hover:opacity-90"
                style={{ backgroundColor: "#0056b2" }}
                disabled={savingVendor}
              >
                {savingVendor ? "Saving Changes..." : "Save Vendor Settings"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Branches Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="h-5 w-5" style={{ color: "#0056b2" }} />
          <h2 className="text-xl font-bold">Branches</h2>
          <Badge variant="secondary" className="ml-2">{branches.length}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Manage location-specific details for each of your branches.
        </p>

        {branches.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="py-8 text-center">
              <GitBranch className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No branches found. Contact admin to add branches.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {branches.map((branch) => {
              const form = branchForms[branch.id];
              if (!form) return null;
              const isExpanded = expandedBranchId === branch.id;
              const citiesForBranchRegion = form.region ? NAMIBIA_REGIONS[form.region] || [] : [];

              return (
                <Card key={branch.id} className="rounded-2xl overflow-hidden">
                  {/* Branch header - clickable to expand */}
                  <button
                    type="button"
                    onClick={() => setExpandedBranchId(isExpanded ? null : branch.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-slate-100">
                        <MapPin className="h-4 w-4 text-slate-600" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{branch.branchName}</span>
                          {branch.approved ? (
                            <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Approved</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px]">Pending</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {branch.town || "No town set"} {branch.region ? `· ${branch.region}` : ""} · {branch.productCount} products
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Edit2 className="h-4 w-4 text-slate-400" />
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded branch form */}
                  {isExpanded && (
                    <CardContent className="pt-0 pb-6">
                      <form onSubmit={(e) => handleSaveBranch(branch.id, e)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`branch-name-${branch.id}`}>Branch Name *</Label>
                          <Input
                            id={`branch-name-${branch.id}`}
                            placeholder="Branch name"
                            value={form.branchName}
                            onChange={(e) => updateBranchForm(branch.id, "branchName", e.target.value)}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`branch-region-${branch.id}`}>Region</Label>
                            <select
                              id={`branch-region-${branch.id}`}
                              value={form.region}
                              onChange={(e) => {
                                updateBranchForm(branch.id, "region", e.target.value);
                                updateBranchForm(branch.id, "town", "");
                              }}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              <option value="">Select region</option>
                              {regionNames.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`branch-town-${branch.id}`}>Town</Label>
                            <select
                              id={`branch-town-${branch.id}`}
                              value={form.town}
                              onChange={(e) => updateBranchForm(branch.id, "town", e.target.value)}
                              disabled={!form.region}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="">
                                {form.region ? "Select town" : "Select a region first"}
                              </option>
                              {citiesForBranchRegion.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`branch-address-${branch.id}`} className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            Address
                          </Label>
                          <Input
                            id={`branch-address-${branch.id}`}
                            placeholder="123 Main Street"
                            value={form.address}
                            onChange={(e) => updateBranchForm(branch.id, "address", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`branch-whatsapp-${branch.id}`} className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            WhatsApp Number
                          </Label>
                          <Input
                            id={`branch-whatsapp-${branch.id}`}
                            placeholder="+264 81 123 4567"
                            value={form.whatsappNumber}
                            onChange={(e) => updateBranchForm(branch.id, "whatsappNumber", e.target.value)}
                          />
                        </div>
                        <div className="pt-2">
                          <Button
                            type="submit"
                            className="w-full md:w-auto text-white hover:opacity-90"
                            style={{ backgroundColor: "#0056b2" }}
                            disabled={savingBranchId === branch.id}
                          >
                            {savingBranchId === branch.id ? "Saving..." : "Save Branch"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
