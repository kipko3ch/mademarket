"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Upload,
  Megaphone,
  Store,
  Settings,
  ShoppingBag,
  FileText,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ElementType;
  requiresApproval?: boolean;
}

const vendorLinks: SidebarLink[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package, requiresApproval: true },
  { href: "/dashboard/upload", label: "Bulk Upload", icon: Upload, requiresApproval: true },
  { href: "/dashboard/bundles", label: "Bundles", icon: ShoppingBag, requiresApproval: true },
  { href: "/dashboard/brochures", label: "Brochures", icon: FileText, requiresApproval: true },
  { href: "/dashboard/sponsored", label: "Sponsored Ads", icon: Megaphone, requiresApproval: true },
  { href: "/dashboard/store-settings", label: "Store Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeApproved, setStoreApproved] = useState<boolean>(true);

  useEffect(() => {
    async function fetchStore() {
      try {
        const res = await fetch("/api/dashboard/overview");
        if (res.ok) {
          const data = await res.json();
          if (data.store?.id) {
            setStoreId(data.store.id);
            setStoreApproved(data.store.approved ?? false);
          }
        }
      } catch { }
    }
    if (session?.user?.role === "vendor") fetchStore();
  }, [session?.user?.role]);

  return (
    <aside className="hidden lg:flex w-[260px] xl:w-[280px] flex-col bg-white text-slate-800 h-full border-r border-slate-100 p-6 relative">
      <Link href="/dashboard" className="flex items-center gap-3 mb-10 group mt-2 px-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="MaDe Market" className="h-8 w-auto px-1" />
      </Link>

      {/* Pending approval notice in sidebar */}
      {!storeApproved && storeId && (
        <div className="mx-2 mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <span className="text-xs font-semibold text-amber-800 leading-tight">Account Pending Approval</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-8 scrollbar-hide py-2">
        <div>
          <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider px-2 mb-4">
            Menu
          </p>
          <nav className="space-y-1.5">
            {vendorLinks.slice(0, 4).map((link) => {
              const Icon = link.icon;
              const isActive = link.href === "/dashboard"
                ? pathname === link.href
                : pathname.startsWith(link.href);
              const isRestricted = !storeApproved && link.requiresApproval;

              if (isRestricted) {
                return (
                  <div
                    key={link.href}
                    className="flex items-center gap-4 px-4 py-3 rounded-2xl text-[15px] font-semibold text-slate-300 cursor-not-allowed group/link relative"
                  >
                    <Icon className="h-5 w-5 opacity-50 text-slate-300" />
                    <span className="flex-1">{link.label}</span>
                    <span className="text-[9px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Locked
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-2xl text-[15px] font-semibold transition-all relative overflow-hidden group/link",
                    isActive
                      ? "text-slate-900 bg-primary/5 border border-primary/10 shadow-sm"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full" />}
                  <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-slate-400 group-hover/link:text-slate-600")} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider px-2 mb-4">
            General
          </p>
          <nav className="space-y-1.5">
            {vendorLinks.slice(4).map((link) => {
              const Icon = link.icon;
              const isActive = link.href === "/dashboard"
                ? pathname === link.href
                : pathname.startsWith(link.href);
              const isRestricted = !storeApproved && link.requiresApproval;

              if (isRestricted) {
                return (
                  <div
                    key={link.href}
                    className="flex items-center gap-4 px-4 py-3 rounded-2xl text-[15px] font-semibold text-slate-300 cursor-not-allowed group/link relative"
                  >
                    <Icon className="h-5 w-5 opacity-50 text-slate-300" />
                    <span className="flex-1">{link.label}</span>
                    <span className="text-[9px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Locked
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-2xl text-[15px] font-semibold transition-all relative group/link",
                    isActive
                      ? "text-slate-900 bg-primary/5 border border-primary/10 shadow-sm"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full" />}
                  <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-slate-400 group-hover/link:text-slate-600")} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="mt-6">
        <div className="bg-blue-950 rounded-3xl p-6 text-white text-center relative overflow-hidden group shadow-lg shadow-slate-200">
          <div className="absolute inset-0 z-0 opacity-20 group-hover:scale-110 transition-transform duration-700 bg-[url('/images/namibia.svg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/80 to-transparent" />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white/10 p-2.5 rounded-full mb-3 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Store className="h-6 w-6 text-blue-400" />
            </div>
            <h4 className="font-bold text-lg mb-1 line-clamp-1">{session?.user?.name || "Vendor Store"}</h4>
            <p className="text-xs text-white/60 mb-5 leading-relaxed line-clamp-1">{session?.user?.email || "Manage your store"}</p>

            {storeId ? (
              <Link
                href={`/store/${storeId}`}
                target="_blank"
                className="bg-primary hover:bg-primary/90 text-white text-sm font-bold w-full py-2.5 rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Live Store
              </Link>
            ) : (
              <Link
                href="/dashboard/register-store"
                className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold w-full py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <Store className="h-4 w-4" />
                Settings
              </Link>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
