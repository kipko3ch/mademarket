export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stores, storeProducts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// UUID v4 format regex
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/stores/[id] — Get a single store by ID or slug
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Determine whether to look up by UUID or by slug
    const isUuid = UUID_REGEX.test(id);
    const whereCondition = isUuid ? eq(stores.id, id) : eq(stores.slug, id);

    const [store] = await db
      .select({
        id: stores.id,
        name: stores.name,
        slug: stores.slug,
        description: stores.description,
        logoUrl: stores.logoUrl,
        bannerUrl: stores.bannerUrl,
        websiteUrl: stores.websiteUrl,
        whatsappNumber: stores.whatsappNumber,
        address: stores.address,
        approved: stores.approved,
        productCount:
          sql<number>`count(${storeProducts.id})`.as("product_count"),
      })
      .from(stores)
      .leftJoin(storeProducts, eq(stores.id, storeProducts.storeId))
      .where(whereCondition)
      .groupBy(stores.id)
      .limit(1);

    if (!store || !store.approved) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error("Store fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch store" },
      { status: 500 }
    );
  }
}
