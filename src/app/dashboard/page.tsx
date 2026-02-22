"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Package, Upload, Plus, Store, Settings, ShoppingBag, AlertTriangle, Phone, MessageCircle, Lock, Ban, MapPin, GitBranch } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useBranch } from "@/hooks/use-branch";

interface BranchData {
  id: string;
  branchName: string;
  town: string | null;
  approved: boolean;
  productCount: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { vendor, branches, fetchVendorData } = useBranch();
  const [branchStats, setBranchStats] = useState<BranchData[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/dashboard/overview");
        if (res.ok) {
          const data = await res.json();
          if (data.vendor) {
            fetchVendorData();
            setBranchStats(data.branches || []);
            setTotalProducts(data.totalProducts || 0);
          }
        }
      } catch { } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [fetchVendorData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Store className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Register Your Business</h1>
        <p className="text-slate-500 mb-6">
          You haven&apos;t registered a vendor account yet. Create one to start listing products.
        </p>
        <Link href="/dashboard/register-store">
          <Button size="lg" className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Register Business
          </Button>
        </Link>
      </div>
    );
  }

  const vendorActive = vendor.active;
  const vendorApproved = vendor.approved;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome back, {session?.user?.name}. Manage {vendor.name} with ease.</p>
      </div>

      {/* Suspension Banner */}
      {!vendorActive ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-5 mb-8 space-y-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <Ban className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-red-800 text-sm">Account Suspended</h3>
              <p className="text-xs text-red-700 mt-0.5">
                Your vendor account has been temporarily suspended by an admin. Your products and listings are hidden from the public. Please contact the admin to resolve this.
              </p>
            </div>
          </div>
          <div className="bg-white/70 rounded-2xl p-4 border border-red-100/50">
            <p className="text-xs font-semibold text-red-800 mb-3 flex items-center gap-1.5">
              <Phone className="h-4 w-4" />
              Admin Contact: +264 81 822 2368
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="tel:+264818222368"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20"
              >
                <Phone className="h-3.5 w-3.5" />
                Call Admin
              </a>
              <a
                href="https://wa.me/264818222368?text=Hello%20Admin%2C%20my%20vendor%20account%20on%20MaDe%20Market%20has%20been%20suspended.%20Can%20you%20help%20me%20resolve%20this%3F"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm shadow-green-600/20"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp Admin
              </a>
            </div>
          </div>
        </div>
      ) : null}

      {/* Approval Status Banner */}
      {!vendorApproved && vendorActive ? (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 mb-8 space-y-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-amber-800 text-sm">Pending Approval</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Your vendor account is awaiting admin approval. You can prepare your listings but they won&apos;t be visible until approved.
              </p>
            </div>
          </div>
          <div className="bg-white/70 rounded-2xl p-4 border border-amber-100/50">
            <p className="text-xs font-semibold text-amber-800 mb-3 flex items-center gap-1.5">
              <Phone className="h-4 w-4" />
              Admin Contact: +264 81 822 2368
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="tel:+264818222368"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition-colors shadow-sm shadow-amber-600/20"
              >
                <Phone className="h-3.5 w-3.5" />
                Call Admin
              </a>
              <a
                href="https://wa.me/264818222368?text=Hello%20Admin%2C%20I%20registered%20my%20vendor%20account%20on%20MaDe%20Market%20and%20I%27m%20waiting%20for%20approval."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm shadow-green-600/20"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp Admin
              </a>
            </div>
          </div>
        </div>
      ) : null}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 mt-4">
        {/* Total Products */}
        <div className="rounded-[28px] p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden transition-all shadow-sm border bg-blue-600 text-white border-blue-600">
          <div className="absolute -right-10 -bottom-10 opacity-20 transform rotate-12">
            <Package className="h-40 w-40 text-blue-900" />
          </div>
          <div className="flex justify-between items-start relative z-10 w-full mb-6">
            <span className="text-base font-semibold text-white/90">
              Listed Products
            </span>
            <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 border bg-white/10 border-white/20 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
              {totalProducts}
            </div>
            <div className="text-xs flex items-center gap-1.5 text-blue-100">
              <div className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white">
                All Branches
              </div>
              Total products
            </div>
          </div>
        </div>

        {/* Vendor Status */}
        <div className="rounded-[28px] p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden transition-all shadow-sm border bg-white text-slate-900 border-slate-100 hover:border-slate-200">
          <div className="flex justify-between items-start relative z-10 w-full mb-6">
            <span className="text-base font-semibold text-slate-600">
              Vendor Status
            </span>
            <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 border bg-white border-slate-200 text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
              {!vendorActive ? "Suspended" : vendorApproved ? "Active" : "Pending"}
            </div>
            <div className="text-xs flex items-center gap-1.5 text-slate-400">
              <div className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold", !vendorActive ? "bg-red-50 text-red-600" : vendorApproved ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600")}>
                {!vendorActive ? "Hidden" : vendorApproved ? "Live" : "Waiting"}
              </div>
              Status check
            </div>
          </div>
        </div>

        {/* Branches Count */}
        <div className="rounded-[28px] p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden transition-all shadow-sm border bg-white text-slate-900 border-slate-100 hover:border-slate-200">
          <div className="flex justify-between items-start relative z-10 w-full mb-6">
            <span className="text-base font-semibold text-slate-600">
              Branches
            </span>
            <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 border bg-white border-slate-200 text-slate-600">
              <GitBranch className="h-4 w-4" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
              {branches.length}
            </div>
            <div className="text-xs flex items-center gap-1.5 text-slate-400">
              <div className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                Locations
              </div>
              Total branches
            </div>
          </div>
        </div>
      </div>

      {/* Branch List */}
      {branchStats.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Your Branches</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {branchStats.map((branch) => (
              <div key={branch.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{branch.branchName || branch.town}</p>
                  <p className="text-xs text-slate-400">{branch.productCount} products</p>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                  branch.approved ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                )}>
                  {branch.approved ? "Active" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</h2>
        {(!vendorApproved || !vendorActive) && (
          <p className={cn("text-xs rounded-xl px-4 py-3 mb-4 flex items-center gap-2 shadow-sm", !vendorActive ? "text-red-600 bg-red-50 border border-red-100" : "text-amber-600 bg-amber-50 border border-amber-100")}>
            <Lock className="h-4 w-4 shrink-0" />
            {!vendorActive
              ? "Your account is suspended. Product management is disabled until reactivated."
              : "You can prepare your listings but they won\u0027t be visible until approved"}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Products */}
          {vendorApproved && vendorActive ? (
            <Link
              href="/dashboard/products"
              className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 hover:border-primary/20 hover:shadow-md transition-all group"
            >
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                <Package className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-0.5">Manage Products</p>
                <p className="text-[10px] text-slate-500 font-medium">Add, edit, or remove products</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-5 opacity-60 cursor-not-allowed">
              <div className="h-12 w-12 rounded-2xl bg-slate-200 flex items-center justify-center shrink-0">
                <Package className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-400 mb-0.5">Manage Products</p>
                <p className="text-[10px] text-slate-400 font-medium">Requires approval</p>
              </div>
            </div>
          )}

          {/* Bulk Upload */}
          {vendorApproved && vendorActive ? (
            <Link
              href="/dashboard/upload"
              className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 hover:border-primary/20 hover:shadow-md transition-all group"
            >
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                <Upload className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-0.5">Bulk Upload</p>
                <p className="text-[10px] text-slate-500 font-medium">Upload products via CSV</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-5 opacity-60 cursor-not-allowed">
              <div className="h-12 w-12 rounded-2xl bg-slate-200 flex items-center justify-center shrink-0">
                <Upload className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-400 mb-0.5">Bulk Upload</p>
                <p className="text-[10px] text-slate-400 font-medium">Requires approval</p>
              </div>
            </div>
          )}

          {/* Bundles */}
          {vendorApproved && vendorActive ? (
            <Link
              href="/dashboard/bundles"
              className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 hover:border-primary/20 hover:shadow-md transition-all group"
            >
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                <ShoppingBag className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-0.5">Bundles</p>
                <p className="text-[10px] text-slate-500 font-medium">Create product bundles</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-5 opacity-60 cursor-not-allowed">
              <div className="h-12 w-12 rounded-2xl bg-slate-200 flex items-center justify-center shrink-0">
                <ShoppingBag className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-400 mb-0.5">Bundles</p>
                <p className="text-[10px] text-slate-400 font-medium">Requires approval</p>
              </div>
            </div>
          )}

          {/* Vendor Settings */}
          <Link
            href="/dashboard/store-settings"
            className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 hover:border-primary/20 hover:shadow-md transition-all group"
          >
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
              <Settings className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-0.5">Vendor Settings</p>
              <p className="text-[10px] text-slate-500 font-medium">Edit vendor information</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
