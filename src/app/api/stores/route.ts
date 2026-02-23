import { NextResponse } from "next/server";
import { db } from "@/db";
import { branches, vendors, storeProducts } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/stores — List approved branches (backward compat — returns branch-as-store format)
export async function GET() {
  try {
    const branchList = await db
      .select({
        id: branches.id,
        name: sql<string>`${vendors.name} || ' – ' || coalesce(${branches.town}, ${branches.branchName})`.as("name"),
        slug: vendors.slug,
        description: vendors.description,
        logoUrl: vendors.logoUrl,
        whatsappNumber: branches.whatsappNumber,
        address: branches.address,
        region: branches.region,
        city: branches.town,
        productCount: sql<number>`count(${storeProducts.id})`.as("product_count"),
      })
      .from(branches)
      .innerJoin(vendors, eq(branches.vendorId, vendors.id))
      .leftJoin(storeProducts, eq(branches.id, storeProducts.branchId))
      .where(
        and(
          eq(vendors.approved, true),
          eq(vendors.active, true),
          eq(branches.approved, true),
          eq(branches.active, true)
        )
      )
      .groupBy(branches.id, vendors.id);

    return NextResponse.json(branchList, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  } catch (error) {
    console.error("Stores fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 });
  }
}
