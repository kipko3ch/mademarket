/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Shield,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/stores", label: "Stores" },
  { href: "/admin/featured", label: "Featured" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/sponsored", label: "Sponsored" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
              <SheetTitle className="sr-only">Admin Menu</SheetTitle>
              <SheetClose asChild>
                <button className="p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </SheetClose>
            </SheetHeader>
            <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-3 py-2">Menu</p>
              {adminLinks.map((link) => {
                const isActive = link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);
                return (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "block px-4 py-3 rounded-2xl text-[15px] font-semibold transition-colors",
                        isActive
                          ? "bg-primary/5 text-slate-900 border border-primary/10"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-100 mt-auto bg-slate-50">
              <button
                onClick={() => signOut({ callbackUrl: window.location.origin + "/login" })}
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
          <input
            type="text"
            placeholder="Search stores, products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                router.push(`/admin/stores?search=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            className="border-none outline-none bg-transparent text-sm w-full text-slate-700 placeholder:text-slate-400"
          />
          <div className="flex items-center justify-center bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400 shrink-0 gap-0.5">
            <span className="text-[12px] leading-none mb-0.5">⌘</span>F
          </div>
        </div>
      </div>

      {/* Right side: Profile */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-3 bg-white px-1.5 py-1.5 sm:pr-4 rounded-full border border-slate-200/60 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors group">
          <div className="h-8 w-8 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center shrink-0">
            {session?.user?.image ? (
              <img src={session.user.image} alt="User avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-blue-700 font-bold text-sm">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"}
              </span>
            )}
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors">{session?.user?.name || "Admin"}</span>
            <span className="text-[10px] text-slate-500 leading-tight">{session?.user?.email || "admin@example.com"}</span>
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
