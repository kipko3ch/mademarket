import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, branches, users } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/vendors — List all vendors with branch counts
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await db
      .select({
        id: vendors.id,
        name: vendors.name,
        slug: vendors.slug,
        logoUrl: vendors.logoUrl,
        websiteUrl: vendors.websiteUrl,
        approved: vendors.approved,
        active: vendors.active,
        createdAt: vendors.createdAt,
        ownerName: users.name,
        ownerEmail: users.email,
        branchCount: count(branches.id),
      })
      .from(vendors)
      .innerJoin(users, eq(vendors.ownerId, users.id))
      .leftJoin(branches, eq(vendors.id, branches.vendorId))
      .groupBy(vendors.id, users.name, users.email)
      .orderBy(vendors.createdAt);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin vendors fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }
}
