"use client";

import { ProductCard } from "./product-card";

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
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No products found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
