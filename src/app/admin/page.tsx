"use client";

import { useEffect, useState } from "react";
import {
  Store, Users, Package, Search, Diamond, Megaphone, ImagePlay,
  Activity, Database, HardDrive, CheckCircle2, AlertTriangle, XCircle,
  ShieldCheck, UserCheck, Eye, Loader2, GitBranch,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AdminStats {
  totalUsers: number;
  totalVendors: number;
  totalBranches: number;
  pendingVendors: number;
  pendingBranches: number;
  totalProducts: number;
  topSearches: { query: string; count: number }[];
}

interface HealthData {
  status: "healthy" | "degraded";
  database: { connected: boolean; latencyMs?: number; error?: string };
  r2Storage: { configured: boolean; publicUrlConfigured?: boolean };
  userStats: {
    total: number;
    admins: number;
    vendors: number;
    regularUsers: number;
    newUsersLast7Days: number;
  };
  vendorStats?: {
    total: number;
    approved: number;
    pending: number;
  };
  branchStats?: {
    total: number;
    approved: number;
    pending: number;
    withBanners: number;
    inMarquee: number;
  };
  storeStats?: {
    total: number;
    approved: number;
    pending: number;
    withBanners: number;
    inMarquee: number;
  };
  productStats: {
    totalProducts: number;
    productsWithImages: number;
    totalStoreProductEntries: number;
    outOfStock: number;
  };
  contentStats: {
    activeBanners: number;
    totalCategories: number;
    searchLogsToday: number;
    activeFeaturedProducts: number | null;
    activeBundles: number | null;
  };
  systemInfo: {
    nodeVersion: string;
    environment: string;
    uptime: string;
  };
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) setStats(await res.json());
      } catch { } finally {
        setLoading(false);
      }
    }
    async function fetchHealth() {
      try {
        const res = await fetch("/api/admin/health");
        if (res.ok) setHealth(await res.json());
      } catch { } finally {
        setHealthLoading(false);
      }
    }
    fetchStats();
    fetchHealth();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      isPrimary: true,
    },
    {
      label: "Total Vendors",
      value: stats?.totalVendors ?? 0,
      icon: Store,
      isPrimary: false,
      sub: (stats?.pendingVendors ?? 0) > 0 ? `${stats?.pendingVendors} pending` : undefined,
    },
    {
      label: "Total Branches",
      value: stats?.totalBranches ?? 0,
      icon: GitBranch,
      isPrimary: false,
      sub: (stats?.pendingBranches ?? 0) > 0 ? `${stats?.pendingBranches} pending` : undefined,
    },
    {
      label: "Products",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      isPrimary: false,
    },
    {
      label: "Searches Today",
      value: stats?.topSearches?.reduce((sum, s) => sum + s.count, 0) ?? 0,
      icon: Search,
      isPrimary: false,
    },
  ];

  const quickActions = [
    { label: "Manage Vendors", href: "/admin/stores", icon: Store, desc: "Approve or manage vendors & branches" },
    { label: "Featured Products", href: "/admin/featured", icon: Diamond, desc: "Control homepage featured" },
    { label: "Hero Banners", href: "/admin/banners", icon: ImagePlay, desc: "Edit homepage carousel" },
    { label: "Sponsored Ads", href: "/admin/sponsored", icon: Megaphone, desc: "Review ad listings" },
  ];

  function StatusIcon({ ok }: { ok: boolean }) {
    return ok
      ? <CheckCircle2 className="h-4 w-4 text-green-500" />
      : <XCircle className="h-4 w-4 text-red-500" />;
  }

  // Support both old storeStats and new vendorStats/branchStats from the health API
  const vendorStatsData = health?.vendorStats;
  const branchStatsData = health?.branchStats ?? health?.storeStats;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Plan, prioritize, and accomplish your tasks with ease.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {statCards.map((card) => {
          return (
            <div
              key={card.label}
              className={cn(
                "rounded-[28px] p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden transition-all shadow-sm border",
                card.isPrimary ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-900 border-slate-100 hover:border-slate-200"
              )}
            >
              <div className="flex justify-between items-start relative z-10 w-full mb-6">
                <span className={cn("text-base font-semibold", card.isPrimary ? "text-white/90" : "text-slate-600")}>
                  {card.label}
                </span>
              </div>
              <div className="relative z-10">
                <div className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
                  {card.value}
                </div>
                {card.sub ? (
                  <p className={cn("text-xs font-semibold flex items-center gap-1.5", card.isPrimary ? "text-blue-200" : "text-amber-600")}>
                    {card.sub}
                  </p>
                ) : (
                  <div className={cn("text-xs flex items-center gap-1.5", card.isPrimary ? "text-blue-100" : "text-slate-400")}>
                    <div className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold", card.isPrimary ? "bg-blue-100 text-blue-700" : "bg-blue-50 text-blue-600")}>
                      ↑ Active
                    </div>
                    Updated just now
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* System Health */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">System Health</h2>
        {healthLoading ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400 mr-2" />
            <span className="text-sm text-slate-400">Checking system health...</span>
          </div>
        ) : health ? (
          <div className="space-y-4">
            {/* Overall Status Banner */}
            <div className={`rounded-2xl p-4 flex items-center gap-3 ${health.status === "healthy" ? "bg-green-50 border border-green-200" :
              health.status === "degraded" ? "bg-amber-50 border border-amber-200" :
                "bg-red-50 border border-red-200"
              }`}>
              {health.status === "healthy" ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : health.status === "degraded" ? (
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <div>
                <p className={`font-bold text-sm ${health.status === "healthy" ? "text-green-800" :
                  health.status === "degraded" ? "text-amber-800" :
                    "text-red-800"
                  }`}>
                  System {health.status === "healthy" ? "Healthy" : health.status === "degraded" ? "Degraded" : "Error"}
                </p>
                <p className={`text-xs ${health.status === "healthy" ? "text-green-600" :
                  health.status === "degraded" ? "text-amber-600" :
                    "text-red-600"
                  }`}>
                  {health.status === "healthy"
                    ? "All systems operational"
                    : "Some components need attention"}
                </p>
              </div>
            </div>

            {/* Health Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Database */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-700">Database</span>
                  </div>
                  <StatusIcon ok={health.database.connected} />
                </div>
                <p className="text-xs text-slate-500">
                  {health.database.connected ? "Connected" : "Disconnected"}
                  {health.database.latencyMs != null && ` • ${health.database.latencyMs}ms`}
                </p>
              </div>

              {/* R2 Storage */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-700">R2 Storage</span>
                  </div>
                  <StatusIcon ok={health.r2Storage.configured} />
                </div>
                <p className="text-xs text-slate-500">
                  {health.r2Storage.configured
                    ? `Configured${health.r2Storage.publicUrlConfigured ? " • Public URL set" : ""}`
                    : "Not configured — check env vars"}
                </p>
              </div>

              {/* Environment */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-700">Environment</span>
                  </div>
                  <ShieldCheck className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-xs text-slate-500">
                  Node {health.systemInfo.nodeVersion} • {health.systemInfo.environment} • Up {health.systemInfo.uptime}
                </p>
              </div>

              {/* Users Breakdown */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <UserCheck className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">Users</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Admins</span>
                    <span className="font-bold text-slate-700">{health.userStats.admins}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Vendors</span>
                    <span className="font-bold text-slate-700">{health.userStats.vendors}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Regular</span>
                    <span className="font-bold text-slate-700">{health.userStats.regularUsers}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-slate-50 pt-1.5 mt-1.5">
                    <span className="text-slate-500">New this week</span>
                    <span className="font-bold text-green-600">+{health.userStats.newUsersLast7Days}</span>
                  </div>
                </div>
              </div>

              {/* Vendors & Branches Breakdown */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Store className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">Vendors & Branches</span>
                </div>
                <div className="space-y-1.5">
                  {vendorStatsData ? (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Vendors Approved</span>
                        <span className="font-bold text-green-600">{vendorStatsData.approved}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Vendors Pending</span>
                        <span className="font-bold text-amber-600">{vendorStatsData.pending}</span>
                      </div>
                    </>
                  ) : null}
                  {branchStatsData ? (
                    <>
                      <div className="flex justify-between text-xs border-t border-slate-50 pt-1.5 mt-1.5">
                        <span className="text-slate-500">Branches Approved</span>
                        <span className="font-bold text-green-600">{branchStatsData.approved}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Branches Pending</span>
                        <span className="font-bold text-amber-600">{branchStatsData.pending}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">In Marquee</span>
                        <span className="font-bold text-slate-700">{branchStatsData.inMarquee}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">With Banners</span>
                        <span className="font-bold text-slate-700">{branchStatsData.withBanners}</span>
                      </div>
                    </>
                  ) : null}
                  {!vendorStatsData && !branchStatsData && (
                    <p className="text-xs text-slate-400">No data available</p>
                  )}
                </div>
              </div>

              {/* Content Status */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">Content</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Active Banners</span>
                    <span className="font-bold text-slate-700">{health.contentStats.activeBanners}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Categories</span>
                    <span className="font-bold text-slate-700">{health.contentStats.totalCategories}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Featured Products</span>
                    <span className="font-bold text-slate-700">{health.contentStats.activeFeaturedProducts ?? "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Active Bundles</span>
                    <span className="font-bold text-slate-700">{health.contentStats.activeBundles ?? "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Products w/ images</span>
                    <span className="font-bold text-slate-700">
                      {health.productStats.productsWithImages}/{health.productStats.totalProducts}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
            <p className="text-sm text-slate-500">Failed to load health data</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-4 hover:border-primary/20 hover:shadow-md transition-all group"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                  <p className="text-[10px] text-slate-400">{action.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Top Searches */}
      {stats?.topSearches && stats.topSearches.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Top Searches</h2>
          <div className="bg-white border border-slate-100 rounded-2xl p-4">
            <div className="space-y-2">
              {stats.topSearches.slice(0, 8).map((s, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-300 w-5 text-center">{i + 1}</span>
                    <span className="text-sm text-slate-700 font-medium">{s.query}</span>
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
