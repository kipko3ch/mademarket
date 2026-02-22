import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, storeProducts, stores, categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/products/[id]/prices — Get product info + all store prices in ONE query
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Parallel: product info + store prices
    const [productRows, priceRows] = await Promise.all([
      db
        .select({
          id: products.id,
          name: products.name,
          imageUrl: products.imageUrl,
          unit: products.unit,
          brand: products.brand,
          size: products.size,
          description: products.description,
          categoryName: categories.name,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(products.id, id))
        .limit(1),

      db
        .select({
          storeId: stores.id,
          storeName: stores.name,
          storeLogo: stores.logoUrl,
          storeAddress: stores.address,
          storeWebsite: stores.websiteUrl,
          price: storeProducts.price,
          inStock: storeProducts.inStock,
          externalUrl: storeProducts.externalUrl,
        })
        .from(storeProducts)
        .innerJoin(stores, and(eq(storeProducts.storeId, stores.id), eq(stores.approved, true)))
        .where(eq(storeProducts.productId, id))
        .orderBy(storeProducts.price),
    ]);

    if (productRows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const prices = priceRows.map((r) => ({
      ...r,
      price: Number(r.price),
    }));

    const cheapestPrice = prices.length > 0 ? prices[0].price : null;

    return NextResponse.json({
      product: productRows[0],
      prices,
      cheapestPrice,
      storeCount: prices.length,
    });
  } catch (error) {
    console.error("Product prices fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch product prices" }, { status: 500 });
  }
}
