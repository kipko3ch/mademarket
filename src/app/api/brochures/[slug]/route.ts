export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { brochures, branches, vendors, bundles } from "@/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";

// GET /api/brochures/[slug] — Return single brochure by slug with vendor/branch info and related items
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const [result] = await db
      .select({
        id: brochures.id,
        branchId: brochures.branchId,
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
        vendorName: vendors.name,
        vendorSlug: vendors.slug,
        vendorLogo: vendors.logoUrl,
        vendorBanner: vendors.bannerUrl,
        branchTown: branches.town,
      })
      .from(brochures)
      .innerJoin(branches, eq(brochures.branchId, branches.id))
      .innerJoin(vendors, and(eq(branches.vendorId, vendors.id), eq(vendors.approved, true), eq(vendors.active, true)))
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

    // Fetch related brochures (same branch, published, exclude current, limit 4)
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
          eq(brochures.branchId, result.branchId!),
          eq(brochures.status, "published"),
          ne(brochures.id, result.id)
        )
      )
      .orderBy(desc(brochures.createdAt))
      .limit(4);

    // Fetch related bundles (same branch, active, limit 4)
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
        branchId: bundles.branchId,
      })
      .from(bundles)
      .where(
        and(
          eq(bundles.branchId, result.branchId!),
          eq(bundles.active, true)
        )
      )
      .orderBy(desc(bundles.createdAt))
      .limit(4);

    return NextResponse.json({
      ...result,
      // backward-compat aliases
      storeName: result.vendorName,
      storeSlug: result.vendorSlug,
      storeLogo: result.vendorLogo,
      storeBanner: result.vendorBanner,
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
