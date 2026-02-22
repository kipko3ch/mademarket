import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, branches, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const vendorList = await db
      .select({
        id: vendors.id,
        name: vendors.name,
        slug: vendors.slug,
        logoUrl: vendors.logoUrl,
        bannerUrl: vendors.bannerUrl,
        websiteUrl: vendors.websiteUrl,
        approved: vendors.approved,
        active: vendors.active,
        createdAt: vendors.createdAt,
        ownerName: users.name,
        ownerEmail: users.email,
        branchCount: sql<number>`(
          SELECT count(*) FROM branches WHERE branches.vendor_id = ${vendors.id}
        )`.as("branch_count"),
      })
      .from(vendors)
      .innerJoin(users, eq(vendors.ownerId, users.id))
      .orderBy(vendors.createdAt);

    return NextResponse.json(vendorList);
  } catch (error) {
    console.error("Admin vendors error:", error);
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }
}
