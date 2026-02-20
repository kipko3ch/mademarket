"use client";

import { useEffect, useState, use } from "react";
import { Store, Package, MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/products/product-card";
import { generateWhatsAppLink } from "@/lib/whatsapp";

interface StoreData {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  whatsappNumber: string | null;
  address: string | null;
  productCount: number;
}

interface StoreProductData {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  unit: string | null;
  price: string;
  bundleInfo: string | null;
  inStock: boolean;
}

export default function StoreProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<StoreProductData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStore() {
      try {
        const [storeRes, productsRes] = await Promise.all([
          fetch(`/api/stores`),
          fetch(`/api/stores/${id}/products`),
        ]);

        if (storeRes.ok) {
          const stores = await storeRes.json();
          const found = stores.find((s: StoreData) => s.id === id);
          setStore(found || null);
        }

        if (productsRes.ok) {
          setProducts(await productsRes.json());
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchStore();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16 text-center">
        <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Store not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Store header */}
      <Card className="mb-8">
        <CardContent className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6">
          <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Store className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{store.name}</h1>
            {store.description && (
              <p className="text-muted-foreground mt-1">{store.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <Badge variant="secondary">
                <Package className="h-3 w-3 mr-1" />
                {products.length} Products
              </Badge>
              {store.address && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {store.address}
                </span>
              )}
            </div>
          </div>
          {store.whatsappNumber && (
            <Button
              onClick={() => {
                const link = generateWhatsAppLink(
                  store.whatsappNumber!,
                  `Hi ${store.name}, I found your store on MaDe Market!`
                );
                window.open(link, "_blank");
              }}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Products */}
      <h2 className="text-xl font-semibold mb-4">Products</h2>
      {products.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No products listed yet
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.productId}
              name={p.productName}
              imageUrl={p.productImage}
              categoryName={null}
              unit={p.unit}
              minPrice={Number(p.price)}
              maxPrice={null}
              storeCount={1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
