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

export default function RegisterStorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    whatsappNumber: "",
    address: "",
    websiteUrl: "",
    logoUrl: "",
    bannerUrl: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to register store");
        return;
      }

      toast.success("Store registered! Pending admin approval.");
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
              <CardTitle>Register Your Store</CardTitle>
              <CardDescription>
                Fill in your store details. Admin will review and approve.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Basic Information
              </h3>
              <div className="space-y-2">
                <Label htmlFor="name">Store Name *</Label>
                <Input
                  id="name"
                  placeholder="My Grocery Store"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of your store"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  Address
                </Label>
                <Input
                  id="address"
                  placeholder="Store address"
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
                  Recommended size: 200x200px
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
                  Recommended size: 1200x400px
                </p>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register Store"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
