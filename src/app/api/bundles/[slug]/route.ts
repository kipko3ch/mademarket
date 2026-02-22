export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bundles, stores, brochures } from "@/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";

// GET /api/bundles/[slug] — Return single bundle by slug with store info and related items
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Fetch the bundle with full store info
    const [result] = await db
      .select({
        id: bundles.id,
        storeId: bundles.storeId,
        name: bundles.name,
        slug: bundles.slug,
        description: bundles.description,
        imageUrl: bundles.imageUrl,
        price: bundles.price,
        externalUrl: bundles.externalUrl,
        items: bundles.items,
        active: bundles.active,
        createdAt: bundles.createdAt,
        storeName: stores.name,
        storeSlug: stores.slug,
        storeLogo: stores.logoUrl,
        storeBanner: stores.bannerUrl,
        storeWebsite: stores.websiteUrl,
        storeWhatsapp: stores.whatsappNumber,
      })
      .from(bundles)
      .innerJoin(stores, eq(bundles.storeId, stores.id))
      .where(
        and(
          eq(bundles.slug, slug),
          eq(bundles.active, true)
        )
      )
      .limit(1);

    if (!result) {
      return NextResponse.json(
        { error: "Bundle not found" },
        { status: 404 }
      );
    }

    // Fetch related bundles (same store, active, exclude current, limit 4)
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
          eq(bundles.active, true),
          ne(bundles.id, result.id)
        )
      )
      .orderBy(desc(bundles.createdAt))
      .limit(4);

    // Fetch related brochures (same store, published, limit 4)
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
          eq(brochures.status, "published")
        )
      )
      .orderBy(desc(brochures.createdAt))
      .limit(4);

    return NextResponse.json({
      ...result,
      price: Number(result.price),
      relatedBundles: relatedBundles.map((b) => ({
        ...b,
        price: Number(b.price),
      })),
      relatedBrochures,
    });
  } catch (error) {
    console.error("Error fetching bundle:", error);
    return NextResponse.json(
      { error: "Failed to fetch bundle" },
      { status: 500 }
    );
  }
}
