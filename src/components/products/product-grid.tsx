"use client";

import { ProductCard } from "./product-card";
import { Package } from "lucide-react";

interface ProductData {
  id: string;
  name: string;
  imageUrl: string | null;
  categoryName: string | null;
  unit: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  storeCount: number;
}

interface SponsoredData {
  productId: string;
  productName: string;
  productImage: string | null;
  categoryName: string | null;
  price: string;
  storeName: string;
}

interface ProductGridProps {
  products: ProductData[];
  sponsored?: SponsoredData[];
}

export function ProductGrid({ products, sponsored = [] }: ProductGridProps) {
  if (products.length === 0 && sponsored.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Package className="h-10 w-10 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium">No products found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {/* Sponsored products first */}
      {sponsored.map((item) => (
        <ProductCard
          key={`sponsored-${item.productId}`}
          id={item.productId}
          name={item.productName}
          imageUrl={item.productImage}
          categoryName={item.categoryName}
          unit={null}
          minPrice={Number(item.price)}
          maxPrice={null}
          storeCount={1}
          sponsored
          storeName={item.storeName}
        />
      ))}
      {/* Organic results */}
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          imageUrl={product.imageUrl}
          categoryName={product.categoryName}
          unit={product.unit}
          minPrice={product.minPrice}
          maxPrice={product.maxPrice}
          storeCount={product.storeCount}
        />
      ))}
    </div>
  );
}
