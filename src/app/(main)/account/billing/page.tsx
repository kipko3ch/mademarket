"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Check,
  Crown,
  Zap,
  Shield,
} from "lucide-react";

export default function BillingPage() {
  const { data: session, status } = useSession();

  if (status === "unauthenticated") {
    redirect("/login");
  }

  if (status === "loading") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded-xl" />
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
          Subscription & Billing
        </h1>
        <p className="text-slate-500 mt-2">
          Manage your plan and payment details.
        </p>
      </div>

      {/* Current Plan Section */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
          Current Plan
        </h2>

        <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">Free Plan</p>
                <p className="text-xs text-slate-500">
                  Full access to price comparison
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">
              Active
            </span>
          </div>

          <div className="space-y-2.5 mt-6">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>Compare prices across all stores</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>Save items to your wishlist</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>View price history</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>Smart cart optimization</span>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Plans Coming Soon */}
      <section>
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
          Premium Plans
        </h2>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 mb-4">
          <div className="flex items-start gap-3">
            <Crown className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-700">
                Premium plans coming soon
              </p>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                MaDe Market is currently free for all users. We are working on
                premium features that will offer even more value. Stay tuned
                for updates.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-100">
            <Zap className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-900">
                Real-time Price Alerts
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Instant notifications when prices drop on items you watch.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-100">
            <Shield className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-900">
                Priority Support
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Get faster help from our dedicated support team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Account Details */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
          Account Details
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Account Email</span>
            <span className="font-medium text-slate-900">
              {session?.user?.email}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Account Type</span>
            <span className="font-medium text-slate-900 capitalize">
              {session?.user?.role || "User"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Billing Cycle</span>
            <span className="font-medium text-slate-500">N/A (Free plan)</span>
          </div>
        </div>
      </section>
    </div>
  );
}
