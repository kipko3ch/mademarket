export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { branches, vendors, storeProducts } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// UUID v4 format regex
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/stores/[id] — Get a single branch by ID or slug (backward compat)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Determine whether to look up by UUID or by slug
    const isUuid = UUID_REGEX.test(id);
    const whereCondition = isUuid ? eq(branches.id, id) : eq(branches.slug, id);

    const [result] = await db
      .select({
        id: branches.id,
        name: vendors.name,
        slug: vendors.slug,
        description: vendors.description,
        logoUrl: vendors.logoUrl,
        bannerUrl: vendors.bannerUrl,
        websiteUrl: vendors.websiteUrl,
        whatsappNumber: branches.whatsappNumber,
        address: branches.address,
        region: branches.region,
        city: branches.city,
        area: branches.area,
        town: branches.town,
        branchName: branches.branchName,
        branchSlug: branches.slug,
        approved: vendors.approved,
        active: vendors.active,
        productCount:
          sql<number>`count(${storeProducts.id})`.as("product_count"),
      })
      .from(branches)
      .innerJoin(vendors, eq(branches.vendorId, vendors.id))
      .leftJoin(storeProducts, eq(branches.id, storeProducts.branchId))
      .where(whereCondition)
      .groupBy(branches.id, vendors.id)
      .limit(1);

    if (!result || !result.approved || !result.active) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Store fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch store" },
      { status: 500 }
    );
  }
}
