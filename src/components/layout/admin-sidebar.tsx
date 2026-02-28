"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  ImagePlay,
  Diamond,
  Tags,
  Megaphone,
  BarChart3,
  Users,
  Settings,
  ExternalLink,
  Shield,
  ShoppingBag,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/banners", label: "Hero Banners", icon: ImagePlay },
  { href: "/admin/featured", label: "Featured", icon: Diamond },
  { href: "/admin/stores", label: "Manage Vendors", icon: Store },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/standalone", label: "Marketplace", icon: ShoppingBag },
  { href: "/admin/sponsored", label: "Sponsored", icon: Megaphone },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-[260px] xl:w-[280px] flex-col bg-white text-slate-800 h-full border-r border-slate-100 p-6 relative">
      <Link href="/admin" className="flex items-center gap-3 mb-10 group mt-2 px-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="MaDe Market" className="h-8 w-auto px-1" />
      </Link>

      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-8 scrollbar-hide py-2">
        <div>
          <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider px-2 mb-4">
            Menu
          </p>
          <nav className="space-y-1.5">
            {adminLinks.slice(0, 8).map((link) => {
              const Icon = link.icon;
              const isActive = link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);

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
            {adminLinks.slice(8).map((link) => {
              const Icon = link.icon;
              const isActive = link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);

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
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <h4 className="font-bold text-lg mb-1">Made Admin</h4>
            <p className="text-xs text-white/60 mb-5 leading-relaxed">Manage your market efficiently</p>
            <Link
              href="/"
              target="_blank"
              className="bg-primary hover:bg-primary/90 text-white text-sm font-bold w-full py-2.5 rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Live Site
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
