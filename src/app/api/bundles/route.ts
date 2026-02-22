export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { bundles, stores } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/bundles — Return active bundles with store name and logo
export async function GET() {
  try {
    const rows = await db
      .select({
        id: bundles.id,
        name: bundles.name,
        slug: bundles.slug,
        description: bundles.description,
        imageUrl: bundles.imageUrl,
        price: bundles.price,
        externalUrl: bundles.externalUrl,
        items: bundles.items,
        storeId: bundles.storeId,
        storeName: stores.name,
        storeLogo: stores.logoUrl,
        storeSlug: stores.slug,
        createdAt: bundles.createdAt,
      })
      .from(bundles)
      .innerJoin(stores, and(eq(bundles.storeId, stores.id), eq(stores.approved, true), eq(stores.suspended, false)))
      .where(eq(bundles.active, true))
      .orderBy(bundles.createdAt);

    return NextResponse.json(
      rows.map((r) => ({
        ...r,
        price: Number(r.price),
      }))
    );
  } catch (error) {
    console.error("Bundles fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bundles" },
      { status: 500 }
    );
  }
}
