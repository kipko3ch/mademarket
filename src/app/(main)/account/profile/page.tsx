"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Save,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  if (status === "unauthenticated") {
    redirect("/login");
  }

  async function fetchProfile() {
    try {
      const res = await fetch("/api/account/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const { data } = await res.json();
      setName(data.name || "");
      setEmail(data.email || "");
      setImageUrl(data.image || "");
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, image: imageUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Update the session with new data
      await update({
        name: data.data.name,
        email: data.data.email,
        image: data.data.image,
      });

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-32 w-32 bg-muted rounded-full mx-auto" />
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Account
      </Link>

      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900">
          Profile Information
        </h1>
        <p className="text-slate-500 mt-2">
          Update your personal details and profile photo.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-10">
        {/* Profile Photo Section */}
        <section>
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
            Profile Photo
          </h2>
          <div className="max-w-[200px]">
            <ImageUpload
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
              onRemove={() => setImageUrl("")}
              folder="avatars"
              aspectRatio="square"
              label="Upload Photo"
            />
          </div>
        </section>

        {/* Personal Details Section */}
        <section>
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
            Personal Details
          </h2>
          <div className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2"
              >
                <User className="h-4 w-4 text-slate-400" />
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2"
              >
                <Mail className="h-4 w-4 text-slate-400" />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="your@email.com"
              />
            </div>
          </div>
        </section>

        {/* Account Info */}
        <section>
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
            Account Info
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Account Type</span>
              <span className="font-medium text-slate-900 capitalize">
                {session?.user?.role || "User"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">User ID</span>
              <span className="font-mono text-xs text-slate-400">
                {session?.user?.id?.slice(0, 8)}...
              </span>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={saving}
            className="rounded-xl px-8"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
