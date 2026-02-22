export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { brochures, stores, bundles } from "@/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";

// GET /api/brochures/[slug] — Return single brochure by slug with store info and related items
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Fetch the brochure with full store info
    const [result] = await db
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
        createdBy: brochures.createdBy,
        createdAt: brochures.createdAt,
        storeName: stores.name,
        storeSlug: stores.slug,
        storeLogo: stores.logoUrl,
        storeBanner: stores.bannerUrl,
      })
      .from(brochures)
      .innerJoin(stores, eq(brochures.storeId, stores.id))
      .where(
        and(
          eq(brochures.slug, slug),
          eq(brochures.status, "published")
        )
      )
      .limit(1);

    if (!result) {
      return NextResponse.json(
        { error: "Brochure not found" },
        { status: 404 }
      );
    }

    // Fetch related brochures (same store, published, exclude current, limit 4)
    const relatedBrochures = await db
      .select({
        id: brochures.id,
        title: brochures.title,
        slug: brochures.slug,
        description: brochures.description,
        bannerImageUrl: brochures.bannerImageUrl,
        thumbnailImageUrl: brochures.thumbnailImageUrl,
        validFrom: brochures.validFrom,
        validUntil: brochures.validUntil,
        createdAt: brochures.createdAt,
      })
      .from(brochures)
      .where(
        and(
          eq(brochures.storeId, result.storeId),
          eq(brochures.status, "published"),
          ne(brochures.id, result.id)
        )
      )
      .orderBy(desc(brochures.createdAt))
      .limit(4);

    // Fetch related bundles (same store, active, limit 4)
    const relatedBundles = await db
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
      })
      .from(bundles)
      .where(
        and(
          eq(bundles.storeId, result.storeId),
          eq(bundles.active, true)
        )
      )
      .orderBy(desc(bundles.createdAt))
      .limit(4);

    return NextResponse.json({
      ...result,
      relatedBrochures,
      relatedBundles: relatedBundles.map((b) => ({
        ...b,
        price: Number(b.price),
      })),
    });
  } catch (error) {
    console.error("Error fetching brochure:", error);
    return NextResponse.json(
      { error: "Failed to fetch brochure" },
      { status: 500 }
    );
  }
}
