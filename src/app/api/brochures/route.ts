export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { brochures, stores } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// GET /api/brochures — Return published brochures with store name/logo/slug
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    const conditions = [
      eq(brochures.status, "published"),
      eq(stores.approved, true),
    ];

    if (storeId) {
      conditions.push(eq(brochures.storeId, storeId));
    }

    const results = await db
      .select({
        id: brochures.id,
        storeId: brochures.storeId,
        title: brochures.title,
        slug: brochures.slug,
        description: brochures.description,
        bannerImageUrl: brochures.bannerImageUrl,
        thumbnailImageUrl: brochures.thumbnailImageUrl,
        status: brochures.status,
        validFrom: brochures.validFrom,
        validUntil: brochures.validUntil,
        createdAt: brochures.createdAt,
        storeName: stores.name,
        storeSlug: stores.slug,
        storeLogo: stores.logoUrl,
      })
      .from(brochures)
      .innerJoin(stores, eq(brochures.storeId, stores.id))
      .where(and(...conditions))
      .orderBy(desc(brochures.createdAt));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching brochures:", error);
    return NextResponse.json(
      { error: "Failed to fetch brochures" },
      { status: 500 }
    );
  }
}
