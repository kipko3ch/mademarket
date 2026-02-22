"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Store, Globe, Phone, MapPin } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { NAMIBIA_REGIONS } from "@/hooks/use-location";

export default function RegisterStorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    // Vendor-level fields
    name: "",
    description: "",
    websiteUrl: "",
    logoUrl: "",
    bannerUrl: "",
    // First branch fields
    branchName: "",
    region: "",
    town: "",
    whatsappNumber: "",
    address: "",
  });

  const regionNames = Object.keys(NAMIBIA_REGIONS);
  const citiesForRegion = form.region ? NAMIBIA_REGIONS[form.region] || [] : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          websiteUrl: form.websiteUrl,
          logoUrl: form.logoUrl,
          bannerUrl: form.bannerUrl,
          // First branch data
          branchName: form.branchName || form.town || form.name,
          region: form.region,
          town: form.town,
          address: form.address,
          whatsappNumber: form.whatsappNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to register");
        return;
      }

      toast.success("Vendor registered! Pending admin approval.");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Store className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Register Your Business</CardTitle>
              <CardDescription>
                Fill in your business details and first branch location. Admin will review and approve.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vendor Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Business Information
              </h3>
              <div className="space-y-2">
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Woermann Brock"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of your business"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            {/* First Branch */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                First Branch Location
              </h3>
              <div className="space-y-2">
                <Label htmlFor="branchName">Branch Name</Label>
                <Input
                  id="branchName"
                  placeholder="e.g. Windhoek CBD (leave empty to use town name)"
                  value={form.branchName}
                  onChange={(e) => setForm({ ...form, branchName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <select
                    id="region"
                    value={form.region}
                    onChange={(e) =>
                      setForm({ ...form, region: e.target.value, town: "" })
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
                  <Label htmlFor="town">City / Town *</Label>
                  <select
                    id="town"
                    value={form.town}
                    onChange={(e) =>
                      setForm({ ...form, town: e.target.value })
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
                <Label htmlFor="address" className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  Address
                </Label>
                <Input
                  id="address"
                  placeholder="Branch street address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
            </div>

            {/* Contact & Links */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Contact & Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    WhatsApp Number
                  </Label>
                  <Input
                    id="whatsapp"
                    placeholder="+264812345678"
                    value={form.whatsappNumber}
                    onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    Website URL
                  </Label>
                  <Input
                    id="website"
                    placeholder="yourstore.com"
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
              <div className="space-y-2">
                <Label>Business Logo</Label>
                <ImageUpload
                  value={form.logoUrl || undefined}
                  onChange={(url) => setForm({ ...form, logoUrl: url })}
                  onRemove={() => setForm({ ...form, logoUrl: "" })}
                  folder="vendors/logos"
                  aspectRatio="square"
                  label="Upload Logo"
                  className="max-w-[200px]"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended size: 200x200px
                </p>
              </div>
              <div className="space-y-2">
                <Label>Business Banner</Label>
                <ImageUpload
                  value={form.bannerUrl || undefined}
                  onChange={(url) => setForm({ ...form, bannerUrl: url })}
                  onRemove={() => setForm({ ...form, bannerUrl: "" })}
                  folder="vendors/banners"
                  aspectRatio="banner"
                  label="Upload Banner"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended size: 1200x400px
                </p>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register Business"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
