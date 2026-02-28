import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, branches } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/branches — List all branches
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");
    const region = searchParams.get("region");
    const town = searchParams.get("town");

    const conditions = [];
    if (vendorId) conditions.push(eq(branches.vendorId, vendorId));
    if (region) conditions.push(eq(branches.region, region));
    if (town) conditions.push(eq(branches.town, town));

    const result = await db
      .select({
        id: branches.id,
        vendorId: branches.vendorId,
        branchName: branches.branchName,
        slug: branches.slug,
        city: branches.city,
        area: branches.area,
        town: branches.town,
        region: branches.region,
        address: branches.address,
        whatsappNumber: branches.whatsappNumber,
        approved: branches.approved,
        active: branches.active,
        showInMarquee: branches.showInMarquee,
        marqueeOrder: branches.marqueeOrder,
        createdAt: branches.createdAt,
        vendorName: vendors.name,
        vendorSlug: vendors.slug,
        vendorLogoUrl: vendors.logoUrl,
      })
      .from(branches)
      .innerJoin(vendors, eq(branches.vendorId, vendors.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(branches.createdAt);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin branches fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }
}
