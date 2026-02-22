"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SecurityPage() {
  const { status } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (status === "unauthenticated") {
    redirect("/login");
  }

  if (status === "loading") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/account/security", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to change password"
      );
    } finally {
      setSaving(false);
    }
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
          Security Settings
        </h1>
        <p className="text-slate-500 mt-2">
          Manage your password and account security.
        </p>
      </div>

      {/* Change Password Section */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="h-5 w-5 text-slate-600" />
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Change Password
          </h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-5">
          <div>
            <label
              htmlFor="currentPassword"
              className="text-sm font-medium text-slate-700 mb-2 block"
            >
              Current Password
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="text-sm font-medium text-slate-700 mb-2 block"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-slate-700 mb-2 block"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl px-8"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4 mr-2" />
                  Update Password
                </>
              )}
            </Button>
          </div>
        </form>
      </section>

      {/* Two-Factor Authentication Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Smartphone className="h-5 w-5 text-slate-600" />
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Two-Factor Authentication
          </h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-700">Coming Soon</p>
              <p className="text-sm text-slate-500 mt-1">
                Two-factor authentication adds an extra layer of security to
                your account. This feature is currently under development and
                will be available soon.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
