import { NextResponse } from "next/server";
import { db } from "@/db";
import { stores, storeProducts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user's store
    const [store] = await db
      .select({
        id: stores.id,
        name: stores.name,
        approved: stores.approved,
      })
      .from(stores)
      .where(eq(stores.ownerId, session.user.id))
      .limit(1);

    if (!store) {
      return NextResponse.json({ store: null, productCount: 0 });
    }

    // Get product count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(storeProducts)
      .where(eq(storeProducts.storeId, store.id));

    return NextResponse.json({
      store,
      productCount: Number(countResult.count),
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
