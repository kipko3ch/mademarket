"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Search } from "lucide-react";

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

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

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
    </div>
  );
}
