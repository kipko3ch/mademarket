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
  BarChart3,
  Megaphone,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const vendorLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/upload", label: "Bulk Upload", icon: Upload },
  { href: "/dashboard/bundles", label: "Bundles", icon: ShoppingBag },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/sponsored", label: "Sponsored", icon: Megaphone },
  { href: "/dashboard/store-settings", label: "Settings", icon: Settings },
];

export function VendorHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="flex-shrink-0 z-20 w-full px-6 py-4 md:px-10 md:py-6 flex items-center justify-between gap-4">
      {/* Left side: Search or Mobile Menu */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile menu toggle */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full bg-white border border-slate-200/60 text-slate-600 shadow-sm hover:bg-slate-50 transition-colors">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 bg-white border-slate-100 text-slate-800" showCloseButton={false}>
            <SheetHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="MaDe Market" className="h-6 w-auto" />
              </div>
              <SheetTitle className="sr-only">Vendor Menu</SheetTitle>
              <SheetClose asChild>
                <button className="p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </SheetClose>
            </SheetHeader>
            <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-3 py-2">Menu</p>
              {vendorLinks.map((link) => {
                const isActive = link.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(link.href);
                return (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-2xl text-[15px] font-semibold transition-colors",
                        isActive
                          ? "bg-primary/5 text-slate-900 border border-primary/10"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <link.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-slate-400")} />
                      {link.label}
                    </Link>
                  </SheetClose>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-100 mt-auto bg-slate-50">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Search Bar (desktop) */}
        <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-slate-200/60 shadow-sm w-full max-w-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 shrink-0"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input type="text" placeholder="Search product or task" className="border-none outline-none bg-transparent text-sm w-full text-slate-700 placeholder:text-slate-400" />
          <div className="flex items-center justify-center bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400 shrink-0 gap-0.5">
            <span className="text-[12px] leading-none mb-0.5">⌘</span>F
          </div>
        </div>
      </div>

      {/* Right side: Icons and Profile */}
      <div className="flex items-center gap-3 shrink-0">
        <button className="hidden sm:flex h-11 w-11 items-center justify-center rounded-full bg-white border border-slate-200/60 text-slate-500 shadow-sm hover:bg-slate-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
        </button>
        <button className="hidden sm:flex h-11 w-11 items-center justify-center rounded-full bg-white border border-slate-200/60 text-slate-500 shadow-sm hover:bg-slate-50 transition-colors relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
        </button>

        {/* Profile Dropdown */}
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
            onClick={(e) => { e.stopPropagation(); signOut({ callbackUrl: "/login" }); }}
            className="sm:hidden p-1.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
