"use client";

import { useEffect, useState } from "react";
import { useCompare } from "@/hooks/use-compare";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, Search, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreOption {
  id: string;
  name: string;
  logoUrl: string | null;
  productCount: number;
}

export default function ComparePage() {
  const [availableStores, setAvailableStores] = useState<StoreOption[]>([]);
  const [search, setSearch] = useState("");
  const {
    selectedStoreIds,
    results,
    stores: comparedStores,
    loading,
    toggleStore,
    compare,
  } = useCompare();

  useEffect(() => {
    async function fetchStores() {
      try {
        const res = await fetch("/api/stores");
        if (res.ok) setAvailableStores(await res.json());
      } catch {}
    }
    fetchStores();
  }, []);

  function handleCompare() {
    compare(undefined, search || undefined);
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Compare Prices</h1>
        <p className="text-muted-foreground mt-1">
          Select 2-3 stores to compare prices side by side
        </p>
      </div>

      {/* Store selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Select Stores (2-3)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableStores.map((store) => {
              const isSelected = selectedStoreIds.includes(store.id);
              return (
                <button
                  key={store.id}
                  onClick={() => toggleStore(store.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{store.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {store.productCount} products
                    </p>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {availableStores.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No stores available yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Search and compare button */}
      {selectedStoreIds.length >= 2 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for a product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={handleCompare} disabled={loading}>
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            {loading ? "Comparing..." : "Compare Prices"}
          </Button>
        </div>
      )}

      {/* Results table */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Comparison Results ({results.length} products)
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-48">Product</TableHead>
                  <TableHead>Category</TableHead>
                  {comparedStores.map((store) => (
                    <TableHead key={store.id} className="text-center min-w-32">
                      {store.name}
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Savings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => {
                  const prices = result.prices;
                  const minPrice = Math.min(...prices.map((p) => p.price));
                  const maxPrice = Math.max(...prices.map((p) => p.price));
                  const savings = maxPrice - minPrice;

                  return (
                    <TableRow key={result.productId}>
                      <TableCell className="font-medium">
                        {result.productName}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {result.category}
                      </TableCell>
                      {comparedStores.map((store) => {
                        const priceEntry = prices.find(
                          (p) => p.storeId === store.id
                        );
                        return (
                          <TableCell key={store.id} className="text-center">
                            {priceEntry ? (
                              <span
                                className={cn(
                                  "font-semibold",
                                  priceEntry.isCheapest
                                    ? "text-green-600"
                                    : ""
                                )}
                              >
                                ${priceEntry.price.toFixed(2)}
                                {priceEntry.isCheapest && (
                                  <Badge
                                    variant="secondary"
                                    className="ml-1 text-xs bg-green-100 text-green-700"
                                  >
                                    Best
                                  </Badge>
                                )}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                N/A
                              </span>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center">
                        {savings > 0 ? (
                          <Badge className="bg-green-600">
                            Save ${savings.toFixed(2)}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Same price
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedStoreIds.length < 2 && (
        <div className="text-center py-12 text-muted-foreground">
          <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Select at least 2 stores to compare</p>
          <p className="text-sm mt-1">
            You can compare up to 3 stores at once
          </p>
        </div>
      )}
    </div>
  );
}
