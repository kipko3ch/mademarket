"use client";

import Image from "next/image";
import { ShoppingCart, TrendingDown, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";

interface ProductCardProps {
  id: string;
  name: string;
  imageUrl: string | null;
  categoryName: string | null;
  unit: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  storeCount: number;
  sponsored?: boolean;
}

export function ProductCard({
  id,
  name,
  imageUrl,
  categoryName,
  unit,
  minPrice,
  maxPrice,
  storeCount,
  sponsored,
}: ProductCardProps) {
  const addItem = useCart((s) => s.addItem);

  const hasPriceRange = minPrice && maxPrice && minPrice !== maxPrice;

  return (
    <Card className="group overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-square bg-muted/50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Store className="h-12 w-12" />
          </div>
        )}
        {sponsored && (
          <Badge className="absolute top-2 left-2 bg-yellow-500 text-white text-xs">
            Sponsored
          </Badge>
        )}
        {hasPriceRange && (
          <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
            <TrendingDown className="h-3 w-3 mr-1" />
            Compare
          </Badge>
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        {categoryName && (
          <p className="text-xs text-muted-foreground">{categoryName}</p>
        )}
        <h3 className="font-medium text-sm line-clamp-2">{name}</h3>
        {unit && <p className="text-xs text-muted-foreground">per {unit}</p>}

        <div className="flex items-center justify-between pt-1">
          <div>
            {minPrice ? (
              <div>
                <span className="text-lg font-bold">${Number(minPrice).toFixed(2)}</span>
                {hasPriceRange && (
                  <span className="text-xs text-muted-foreground ml-1">
                    — ${Number(maxPrice).toFixed(2)}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No price listed</span>
            )}
            <p className="text-xs text-muted-foreground">
              {storeCount} {storeCount === 1 ? "store" : "stores"}
            </p>
          </div>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={() => addItem(id)}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
