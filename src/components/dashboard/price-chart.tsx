"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp } from "lucide-react";

interface PriceChartProps {
  storeProductId: string;
}

interface PricePoint {
  oldPrice: string;
  newPrice: string;
  changedAt: string;
}

export function PriceChart({ storeProductId }: PriceChartProps) {
  const [data, setData] = useState<{
    product: { productName: string; storeName: string; currentPrice: string };
    history: PricePoint[];
    priceDropped: boolean;
  } | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(
          `/api/price-history?storeProductId=${storeProductId}`
        );
        if (res.ok) setData(await res.json());
      } catch {}
    }
    fetchHistory();
  }, [storeProductId]);

  if (!data || data.history.length === 0) {
    return null;
  }

  const chartData = data.history.map((point) => ({
    date: new Date(point.changedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    price: Number(point.newPrice),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{data.product.productName}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {data.product.storeName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">
              ${Number(data.product.currentPrice).toFixed(2)}
            </span>
            {data.priceDropped ? (
              <Badge className="bg-green-100 text-green-700">
                <TrendingDown className="h-3 w-3 mr-1" />
                Price Dropped
              </Badge>
            ) : (
              <Badge variant="secondary">
                <TrendingUp className="h-3 w-3 mr-1" />
                Price Increased
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
