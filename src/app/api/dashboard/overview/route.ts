import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, branches, storeProducts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user's vendor (brand-level entity)
    const [vendor] = await db
      .select({
        id: vendors.id,
        name: vendors.name,
        slug: vendors.slug,
        description: vendors.description,
        logoUrl: vendors.logoUrl,
        bannerUrl: vendors.bannerUrl,
        websiteUrl: vendors.websiteUrl,
        approved: vendors.approved,
        active: vendors.active,
      })
      .from(vendors)
      .where(eq(vendors.ownerId, session.user.id))
      .limit(1);

    if (!vendor) {
      return NextResponse.json({ vendor: null, branches: [], totalProducts: 0 });
    }

    // Get all branches for this vendor with product counts
    const branchRows = await db
      .select({
        id: branches.id,
        branchName: branches.branchName,
        slug: branches.slug,
        town: branches.town,
        region: branches.region,
        address: branches.address,
        whatsappNumber: branches.whatsappNumber,
        approved: branches.approved,
        active: branches.active,
        showInMarquee: branches.showInMarquee,
        productCount: sql<number>`count(${storeProducts.id})`,
      })
      .from(branches)
      .leftJoin(storeProducts, eq(storeProducts.branchId, branches.id))
      .where(eq(branches.vendorId, vendor.id))
      .groupBy(branches.id)
      .orderBy(branches.branchName);

    // Calculate total products across all branches
    const totalProducts = branchRows.reduce(
      (sum, b) => sum + Number(b.productCount),
      0
    );

    return NextResponse.json({
      vendor,
      branches: branchRows.map((b) => ({
        ...b,
        productCount: Number(b.productCount),
      })),
      totalProducts,
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
