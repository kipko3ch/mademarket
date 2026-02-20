import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { priceHistory, storeProducts, products, stores } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/price-history?storeProductId=xxx — Get price history for a store product
export async function GET(req: NextRequest) {
  const storeProductId = req.nextUrl.searchParams.get("storeProductId");

  if (!storeProductId) {
    return NextResponse.json(
      { error: "storeProductId is required" },
      { status: 400 }
    );
  }

  try {
    // Get the store product info
    const [sp] = await db
      .select({
        productName: products.name,
        storeName: stores.name,
        currentPrice: storeProducts.price,
      })
      .from(storeProducts)
      .innerJoin(products, eq(storeProducts.productId, products.id))
      .innerJoin(stores, eq(storeProducts.storeId, stores.id))
      .where(eq(storeProducts.id, storeProductId))
      .limit(1);

    if (!sp) {
      return NextResponse.json(
        { error: "Store product not found" },
        { status: 404 }
      );
    }

    // Get last 30 price changes
    const history = await db
      .select({
        id: priceHistory.id,
        oldPrice: priceHistory.oldPrice,
        newPrice: priceHistory.newPrice,
        changedAt: priceHistory.changedAt,
      })
      .from(priceHistory)
      .where(eq(priceHistory.storeProductId, storeProductId))
      .orderBy(desc(priceHistory.changedAt))
      .limit(30);

    // Determine if price dropped
    const latestChange = history[0];
    const priceDropped = latestChange
      ? Number(latestChange.newPrice) < Number(latestChange.oldPrice)
      : false;

    return NextResponse.json({
      product: sp,
      history: history.reverse(), // chronological order for charts
      priceDropped,
    });
  } catch (error) {
    console.error("Price history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch price history" },
      { status: 500 }
    );
  }
}
