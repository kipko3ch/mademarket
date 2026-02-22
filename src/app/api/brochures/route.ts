export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { brochures, branches, vendors } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// GET /api/brochures — Return published brochures with vendor/branch info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId") || searchParams.get("storeId");

    const conditions = [
      eq(brochures.status, "published"),
      eq(vendors.approved, true),
      eq(vendors.active, true),
      eq(branches.approved, true),
      eq(branches.active, true),
    ];

    if (branchId) {
      conditions.push(eq(brochures.branchId, branchId));
    }

    const results = await db
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
        createdAt: brochures.createdAt,
        vendorName: vendors.name,
        vendorSlug: vendors.slug,
        vendorLogo: vendors.logoUrl,
        branchTown: branches.town,
      })
      .from(brochures)
      .innerJoin(branches, eq(brochures.branchId, branches.id))
      .innerJoin(vendors, eq(branches.vendorId, vendors.id))
      .where(and(...conditions))
      .orderBy(desc(brochures.createdAt));

    // Map to keep backward-compatible field names for frontend
    const mapped = results.map((r) => ({
      ...r,
      storeName: r.vendorName,
      storeSlug: r.vendorSlug,
      storeLogo: r.vendorLogo,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error fetching brochures:", error);
    return NextResponse.json(
      { error: "Failed to fetch brochures" },
      { status: 500 }
    );
  }
}
