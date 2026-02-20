import { NextResponse } from "next/server";
import { db } from "@/db";
import { stores, storeProducts, priceHistory } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [store] = await db
      .select({ id: stores.id })
      .from(stores)
      .where(eq(stores.ownerId, session.user.id))
      .limit(1);

    if (!store) {
      return NextResponse.json({
        totalProducts: 0,
        totalViews: 0,
        priceChanges: 0,
        avgPrice: 0,
      });
    }

    // Total products
    const [prodCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(storeProducts)
      .where(eq(storeProducts.storeId, store.id));

    // Average price
    const [avgResult] = await db
      .select({ avg: sql<number>`coalesce(avg(${storeProducts.price}::numeric), 0)` })
      .from(storeProducts)
      .where(eq(storeProducts.storeId, store.id));

    // Price changes count
    const [changeCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(priceHistory)
      .innerJoin(storeProducts, eq(priceHistory.storeProductId, storeProducts.id))
      .where(eq(storeProducts.storeId, store.id));

    return NextResponse.json({
      totalProducts: Number(prodCount.count),
      totalViews: 0, // Placeholder for future implementation
      priceChanges: Number(changeCount.count),
      avgPrice: Number(avgResult.avg),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
