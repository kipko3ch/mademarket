/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Store,
  LogOut,
  ExternalLink,
  Menu,
  X,
  LayoutDashboard,
  Package,
  Upload,
  Megaphone,
  Settings,
  ShoppingBag,
  FileText,
  GitBranch,
  AlertTriangle,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useBranch } from "@/hooks/use-branch";
import { BranchSwitcher } from "@/components/layout/branch-switcher";

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
  requiresApproval?: boolean;
}

// Single source of truth for nav links -- synced with sidebar.tsx
const vendorLinks: NavLink[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package, requiresApproval: true },
  { href: "/dashboard/upload", label: "Bulk Upload", icon: Upload, requiresApproval: true },
  { href: "/dashboard/bundles", label: "Bundles", icon: ShoppingBag, requiresApproval: true },
  { href: "/dashboard/brochures", label: "Brochures", icon: FileText, requiresApproval: true },
  { href: "/dashboard/sponsored", label: "Sponsored Ads", icon: Megaphone, requiresApproval: true },
  { href: "/dashboard/branches", label: "Branches", icon: GitBranch },
  { href: "/dashboard/store-settings", label: "Vendor Settings", icon: Settings },
];

export function VendorHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { vendor } = useBranch();

  const vendorApproved = vendor?.approved ?? false;

  return (
    <header className="flex-shrink-0 z-20 w-full px-4 py-3 md:px-10 md:py-6 flex items-center justify-between gap-4">
      {/* Left side */}
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile menu toggle */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full bg-white border border-slate-200/60 text-slate-600 shadow-sm hover:bg-slate-50 transition-colors">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 bg-white border-slate-100 text-slate-800 flex flex-col" showCloseButton={false}>
            <SheetHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center">
                <img src="/logo.png" alt="MaDe Market" className="h-6 w-auto" />
              </div>
              <SheetTitle className="sr-only">Vendor Menu</SheetTitle>
              <SheetClose asChild>
                <button className="p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </SheetClose>
            </SheetHeader>

            {/* Branch Switcher in mobile */}
            {vendor && (
              <div className="px-4 py-3 border-b border-slate-100">
                <BranchSwitcher />
              </div>
            )}

            {/* Pending approval notice */}
            {!vendorApproved && vendor && (
              <div className="mx-3 mt-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span className="text-[11px] font-semibold text-amber-800 leading-tight">Account Pending Approval</span>
              </div>
            )}

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-3 py-2">Menu</p>
              {vendorLinks.map((link) => {
                const Icon = link.icon;
                const isActive = link.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(link.href);
                const isRestricted = !vendorApproved && link.requiresApproval;

                if (isRestricted) {
                  return (
                    <div
                      key={link.href}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 cursor-not-allowed"
                    >
                      <Icon className="h-4 w-4 opacity-50" />
                      <span className="flex-1">{link.label}</span>
                      <span className="text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Locked
                      </span>
                    </div>
                  );
                }

                return (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors relative",
                        isActive
                          ? "bg-primary/5 text-slate-900 border border-primary/10"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />}
                      <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-slate-400")} />
                      {link.label}
                    </Link>
                  </SheetClose>
                );
              })}
            </nav>

            {/* Bottom section */}
            <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
              {vendor && (
                <Link
                  href={`/store/${vendor.slug}`}
                  target="_blank"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Live Store
                </Link>
              )}
              {!vendor && (
                <Link
                  href="/dashboard/register-store"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-50 text-amber-700 font-bold text-sm hover:bg-amber-100 transition-colors"
                >
                  <Store className="h-4 w-4" />
                  Register Business
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: window.location.origin + "/login" })}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo (mobile only, when sidebar hidden) */}
        <Link href="/dashboard" className="lg:hidden">
          <img src="/logo.png" alt="MaDe Market" className="h-6 w-auto" />
        </Link>

        {/* Search Bar (desktop) */}
        <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-slate-200/60 shadow-sm w-full max-w-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 shrink-0"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input type="text" placeholder="Search product or task" className="border-none outline-none bg-transparent text-sm w-full text-slate-700 placeholder:text-slate-400" />
          <div className="flex items-center justify-center bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400 shrink-0 gap-0.5">
            <span className="text-[12px] leading-none mb-0.5">&#8984;</span>F
          </div>
        </div>
      </div>

      {/* Right side: Profile */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-3 bg-white px-1.5 py-1.5 sm:pr-4 rounded-full border border-slate-200/60 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors group">
          <div className="h-8 w-8 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center shrink-0">
            {session?.user?.image ? (
              <img src={session.user.image} alt="Vendor avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-blue-700 font-bold text-sm">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "V"}
              </span>
            )}
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors line-clamp-1">{session?.user?.name || "Vendor"}</span>
            <span className="text-[10px] text-slate-500 leading-tight line-clamp-1">{session?.user?.email || "vendor@example.com"}</span>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); signOut({ callbackUrl: window.location.origin + "/login" }); }}
            className="sm:hidden p-1.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
