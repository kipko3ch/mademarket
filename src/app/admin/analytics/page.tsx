"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3, TrendingUp, Users, Search, Store, GitBranch, Package, MousePointer, Download } from "lucide-react";

interface VendorStat {
  vendorId: string;
  vendorName: string;
  vendorSlug: string;
  approved: boolean;
  active: boolean;
  branchCount: number;
  productCount: number;
  clickCount: number;
  priceUpdateCount: number;
}

interface BranchStat {
  branchId: string;
  branchName: string;
  city: string | null;
  area: string | null;
  town: string | null;
  productCount: number;
}

interface PriceChange {
  productName: string;
  branchName: string;
  vendorName: string;
  oldPrice: string;
  newPrice: string;
  changedAt: string;
}

interface PlatformAnalytics {
  totalUsers: number;
  totalVendors: number;
  totalBranches: number;
  totalProducts: number;
  totalSearches: number;
  topSearches: { query: string; count: number }[];
  recentPriceChanges: PriceChange[];
  vendorStats: VendorStat[];
  vendorDetail: { branchStats: BranchStat[] } | null;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedVendorId) params.set("vendorId", selectedVendorId);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const res = await fetch(`/api/admin/analytics?${params}`);
      if (res.ok) setData(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }, [selectedVendorId, fromDate, toDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  function handleExportCSV() {
    const params = new URLSearchParams();
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    window.open(`/api/admin/reports/export?${params}`, "_blank");
  }

  function handleExportVendorCSV() {
    const params = new URLSearchParams();
    if (selectedVendorId) params.set("vendorId", selectedVendorId);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    window.open(`/api/admin/reports/vendor-export?${params}`, "_blank");
  }

  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Platform Analytics</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Search CSV
          </Button>
          <Button variant="outline" onClick={handleExportVendorCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Vendor Report CSV
          </Button>
        </div>
      </div>

      {/* Date filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs">From</Label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs">To</Label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs">Vendor</Label>
              <Select value={selectedVendorId || "all"} onValueChange={(val) => setSelectedVendorId(val === "all" ? "" : val)}>
                <SelectTrigger><SelectValue placeholder="All Vendors" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {data?.vendorStats?.map((v) => (
                    <SelectItem key={v.vendorId} value={v.vendorId}>{v.vendorName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => { setFromDate(""); setToDate(""); setSelectedVendorId(""); }}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{data?.totalUsers ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium">Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{data?.totalVendors ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium">Branches</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{data?.totalBranches ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{data?.totalProducts ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium">Searches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{data?.totalSearches ?? 0}</div></CardContent>
        </Card>
      </div>

      {/* Vendor Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vendor Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data?.vendorStats && data.vendorStats.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-center">Branches</TableHead>
                  <TableHead className="text-center">Products</TableHead>
                  <TableHead className="text-center">Clicks</TableHead>
                  <TableHead className="text-center">Price Updates</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.vendorStats.map((v) => (
                  <TableRow key={v.vendorId} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedVendorId(v.vendorId)}>
                    <TableCell className="font-medium">{v.vendorName}</TableCell>
                    <TableCell className="text-center">{v.branchCount}</TableCell>
                    <TableCell className="text-center">{v.productCount}</TableCell>
                    <TableCell className="text-center">{v.clickCount}</TableCell>
                    <TableCell className="text-center">{v.priceUpdateCount}</TableCell>
                    <TableCell className="text-center">
                      {v.approved ? (
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-[10px]">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 text-[10px]">Pending</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No vendor data yet</p>
          )}
        </CardContent>
      </Card>

      {/* Vendor Detail (branch breakdown) */}
      {data?.vendorDetail && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Branch Breakdown — {data.vendorStats.find((v) => v.vendorId === selectedVendorId)?.vendorName}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">Products</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.vendorDetail.branchStats.map((b) => (
                  <TableRow key={b.branchId}>
                    <TableCell className="font-medium">{b.branchName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {[b.city || b.town, b.area].filter(Boolean).join(", ") || "—"}
                    </TableCell>
                    <TableCell className="text-center">{b.productCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Searches */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Searches</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.topSearches && data.topSearches.length > 0 ? (
              <ul className="space-y-3">
                {data.topSearches.map((s, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">#{i + 1}</span>
                      <span className="text-sm">{s.query}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{s.count}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No search data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Price Changes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Price Changes</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentPriceChanges && data.recentPriceChanges.length > 0 ? (
              <ul className="space-y-3">
                {data.recentPriceChanges.map((pc, i) => {
                  const dropped = Number(pc.newPrice) < Number(pc.oldPrice);
                  return (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{pc.productName}</p>
                        <p className="text-xs text-muted-foreground">{pc.vendorName} — {pc.branchName}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground line-through mr-2">N${Number(pc.oldPrice).toFixed(2)}</span>
                        <span className={dropped ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                          N${Number(pc.newPrice).toFixed(2)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No price changes recorded yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
