"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3, TrendingUp, Users, Search, Download, Calendar } from "lucide-react";
import { toast } from "sonner";

interface PlatformAnalytics {
  totalUsers: number;
  totalStores: number;
  totalProducts: number;
  totalSearches: number;
  topSearches: { query: string; count: number }[];
  recentPriceChanges: {
    productName: string;
    storeName: string;
    oldPrice: string;
    newPrice: string;
    changedAt: string;
  }[];
}

interface SearchReportRow {
  query: string;
  count: number;
  date: string;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const [reportFrom, setReportFrom] = useState("");
  const [reportTo, setReportTo] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [reportSearches, setReportSearches] = useState<SearchReportRow[] | null>(null);
  const [reportFetchLoading, setReportFetchLoading] = useState(false);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/admin/analytics");
        if (res.ok) setData(await res.json());
      } catch {} finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  async function handleFetchReport() {
    setReportFetchLoading(true);
    try {
      const params = new URLSearchParams();
      if (reportFrom) params.set("from", reportFrom);
      if (reportTo) params.set("to", reportTo);
      const res = await fetch(`/api/admin/reports/searches/export?${params.toString()}`);
      if (res.ok) {
        const rows: SearchReportRow[] = await res.json();
        setReportSearches(rows);
      } else {
        toast.error("Failed to fetch search report");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setReportFetchLoading(false);
    }
  }

  async function handleExportCSV() {
    setExportLoading(true);
    try {
      const params = new URLSearchParams();
      if (reportFrom) params.set("from", reportFrom);
      if (reportTo) params.set("to", reportTo);
      const res = await fetch(`/api/admin/reports/searches/export?${params.toString()}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "search-report.csv";
        a.click();
        URL.revokeObjectURL(url);
      } else {
        toast.error("Failed to export CSV");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setExportLoading(false);
    }
  }

  if (loading) {
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
      <h1 className="text-2xl font-bold">Platform Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalUsers ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalProducts ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalSearches ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Stores</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalStores ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most searched */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Searched Products</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.topSearches && data.topSearches.length > 0 ? (
              <ul className="space-y-3">
                {data.topSearches.map((s, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">
                        #{i + 1}
                      </span>
                      <span className="text-sm">{s.query}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {s.count} searches
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No search data yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent price changes */}
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
                        <p className="text-xs text-muted-foreground">{pc.storeName}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground line-through mr-2">
                          ${Number(pc.oldPrice).toFixed(2)}
                        </span>
                        <span className={dropped ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                          ${Number(pc.newPrice).toFixed(2)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No price changes recorded yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search Report */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Search Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">From</label>
              <Input
                type="date"
                value={reportFrom}
                onChange={(e) => setReportFrom(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">To</label>
              <Input
                type="date"
                value={reportTo}
                onChange={(e) => setReportTo(e.target.value)}
                className="w-40"
              />
            </div>
            <Button onClick={handleFetchReport} disabled={reportFetchLoading} variant="secondary">
              {reportFetchLoading ? "Loading…" : "View Report"}
            </Button>
            <Button onClick={handleExportCSV} disabled={exportLoading} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {exportLoading ? "Exporting…" : "Export CSV"}
            </Button>
          </div>

          {reportSearches !== null && (
            reportSearches.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No search data for the selected range.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Query</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Count</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportSearches.map((row, i) => (
                      <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900">{row.query}</td>
                        <td className="px-4 py-3 text-slate-600">{row.count}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
