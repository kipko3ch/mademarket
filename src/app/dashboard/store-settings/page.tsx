/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Settings, Store, CheckCircle, Clock, Globe, Phone, MapPin } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { NAMIBIA_REGIONS } from "@/hooks/use-location";

interface StoreData {
  id: string;
  name: string;
  description: string | null;
  region: string | null;
  city: string | null;
  address: string | null;
  whatsappNumber: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  websiteUrl: string | null;
  approved: boolean;
}

export default function VendorStoreSettingsPage() {
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    region: "",
    city: "",
    address: "",
    whatsappNumber: "",
    logoUrl: "",
    bannerUrl: "",
    websiteUrl: "",
  });

  const regionNames = Object.keys(NAMIBIA_REGIONS);
  const citiesForRegion = form.region ? NAMIBIA_REGIONS[form.region] || [] : [];

  useEffect(() => {
    async function fetchStore() {
      try {
        const res = await fetch("/api/dashboard/overview");
        if (res.ok) {
          const data = await res.json();
          if (data.store) {
            setStore(data.store);
            setForm({
              name: data.store.name || "",
              description: data.store.description || "",
              region: data.store.region || "",
              city: data.store.city || "",
              address: data.store.address || "",
              whatsappNumber: data.store.whatsappNumber || "",
              logoUrl: data.store.logoUrl || "",
              bannerUrl: data.store.bannerUrl || "",
              websiteUrl: data.store.websiteUrl || "",
            });
          }
        }
      } catch {
        toast.error("Failed to load store data");
      } finally {
        setLoading(false);
      }
    }
    fetchStore();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!store) return;
    setSaving(true);

    try {
      const res = await fetch("/api/dashboard/store-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          region: form.region,
          city: form.city,
          address: form.address,
          whatsappNumber: form.whatsappNumber,
          logoUrl: form.logoUrl,
          bannerUrl: form.bannerUrl,
          websiteUrl: form.websiteUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to update store settings");
        return;
      }

      toast.success("Store settings updated successfully");

      // Refresh store data
      const refreshRes = await fetch("/api/dashboard/overview");
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        if (data.store) {
          setStore(data.store);
        }
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
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

  if (!store) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">No Store Found</h1>
        <p className="text-muted-foreground">
          You need to register a store before you can manage settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Store Settings</h1>
        <p className="text-muted-foreground">Manage your store profile and details</p>
      </div>

      {/* Approval Status Banner */}
      <Card className="rounded-2xl overflow-hidden">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            {store.approved ? (
              <>
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">Store Approved</span>
                    <Badge className="bg-emerald-600 text-white">Active</Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    Your store is live and visible to customers.
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
                    Your store is being reviewed by our admin team. You will be notified once approved.
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Store Preview */}
      {(form.bannerUrl || form.logoUrl) && (
        <Card className="rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Store Preview</CardTitle>
            <CardDescription>Preview how your store branding looks</CardDescription>
          </CardHeader>
          <CardContent>
            {form.bannerUrl && (
              <div className="relative h-40 rounded-xl overflow-hidden bg-slate-100 mb-4">
                <img
                  src={form.bannerUrl}
                  alt="Store banner"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {form.logoUrl && (
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                  <img
                    src={form.logoUrl}
                    alt="Store logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{form.name || "Store Name"}</p>
                  <p className="text-sm text-slate-500 line-clamp-1">
                    {form.description || "Store description"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Settings Form */}
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5" style={{ color: "#0056b2" }} />
            <div>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>
                Update your store details. Changes will be reflected on your public store page.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Basic Information
              </h3>
              <div className="space-y-2">
                <Label htmlFor="store-name">Store Name *</Label>
                <Input
                  id="store-name"
                  placeholder="Your store name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-description">Description</Label>
                <Input
                  id="store-description"
                  placeholder="Brief description of your store"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-region">Region *</Label>
                  <select
                    id="store-region"
                    value={form.region}
                    onChange={(e) =>
                      setForm({ ...form, region: e.target.value, city: "" })
                    }
                    required
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
                  <Label htmlFor="store-city">City / Town *</Label>
                  <select
                    id="store-city"
                    value={form.city}
                    onChange={(e) =>
                      setForm({ ...form, city: e.target.value })
                    }
                    required
                    disabled={!form.region}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">
                      {form.region ? "Select city/town" : "Select a region first"}
                    </option>
                    {citiesForRegion.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-address" className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  Address
                </Label>
                <Input
                  id="store-address"
                  placeholder="123 Main Street, City, Country"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Contact & Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-whatsapp" className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    WhatsApp Number
                  </Label>
                  <Input
                    id="store-whatsapp"
                    placeholder="+1234567890"
                    value={form.whatsappNumber}
                    onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-website" className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    Website URL
                  </Label>
                  <Input
                    id="store-website"
                    placeholder="https://yourstore.com"
                    value={form.websiteUrl}
                    onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Branding */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Branding
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-start">
                <div className="space-y-2">
                  <Label>Store Logo</Label>
                  <ImageUpload
                    value={form.logoUrl || undefined}
                    onChange={(url) => setForm({ ...form, logoUrl: url })}
                    onRemove={() => setForm({ ...form, logoUrl: "" })}
                    folder="stores/logos"
                    aspectRatio="square"
                    label="Upload Store Logo"
                    className="max-w-[200px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 200x200px
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Store Banner</Label>
                  <ImageUpload
                    value={form.bannerUrl || undefined}
                    onChange={(url) => setForm({ ...form, bannerUrl: url })}
                    onRemove={() => setForm({ ...form, bannerUrl: "" })}
                    folder="stores/banners"
                    aspectRatio="banner"
                    label="Upload Store Banner"
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
                disabled={saving}
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
