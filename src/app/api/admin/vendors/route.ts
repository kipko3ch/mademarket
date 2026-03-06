import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, branches, users } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";

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

// POST /api/admin/vendors — Admin creates a vendor (owned by the admin)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const name = (body.name || "").trim();
    const branchName = (body.branchName || "").trim();

    if (!name) return NextResponse.json({ error: "Vendor name is required" }, { status: 400 });
    if (!branchName) return NextResponse.json({ error: "Branch name is required" }, { status: 400 });

    const vendorSlug = slugify(name);

    let websiteUrl = (body.websiteUrl || "").trim() || null;
    if (websiteUrl && !websiteUrl.startsWith("http://") && !websiteUrl.startsWith("https://")) {
      websiteUrl = `https://${websiteUrl}`;
    }

    const [vendor] = await db
      .insert(vendors)
      .values({
        ownerId: session.user.id,
        name,
        slug: vendorSlug,
        description: (body.description || "").trim() || null,
        logoUrl: (body.logoUrl || "").trim() || null,
        websiteUrl,
        approved: true,
        active: true,
      })
      .returning();

    const branchSlug = slugify(branchName);
    const [branch] = await db
      .insert(branches)
      .values({
        vendorId: vendor.id,
        branchName,
        slug: branchSlug,
        city: (body.city || "").trim() || null,
        area: (body.area || "").trim() || null,
        address: (body.address || "").trim() || null,
        whatsappNumber: (body.whatsappNumber || "").trim() || null,
        approved: true,
        active: true,
      })
      .returning();

    return NextResponse.json({ vendor, branch }, { status: 201 });
  } catch (error) {
    console.error("Admin vendor creation error:", error);
    return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 });
  }
}
