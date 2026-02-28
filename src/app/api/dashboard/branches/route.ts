import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, branches } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET /api/dashboard/branches — List all branches for the current vendor
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [vendor] = await db
      .select({ id: vendors.id })
      .from(vendors)
      .where(eq(vendors.ownerId, session.user.id))
      .limit(1);

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const rows = await db
      .select({
        id: branches.id,
        branchName: branches.branchName,
        slug: branches.slug,
        city: branches.city,
        area: branches.area,
        town: branches.town,
        region: branches.region,
        address: branches.address,
        latitude: branches.latitude,
        longitude: branches.longitude,
        whatsappNumber: branches.whatsappNumber,
        logoUrl: branches.logoUrl,
        approved: branches.approved,
        active: branches.active,
        showInMarquee: branches.showInMarquee,
        createdAt: branches.createdAt,
      })
      .from(branches)
      .where(eq(branches.vendorId, vendor.id))
      .orderBy(branches.branchName);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Dashboard branches GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch branches" },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/branches — Create a new branch for the current vendor
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [vendor] = await db
      .select({ id: vendors.id, approved: vendors.approved })
      .from(vendors)
      .where(eq(vendors.ownerId, session.user.id))
      .limit(1);

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    if (!vendor.approved) {
      return NextResponse.json(
        {
          error:
            "Vendor must be approved before you can create branches. Contact admin: +264818222368",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (!body.branchName || typeof body.branchName !== "string" || !body.branchName.trim()) {
      return NextResponse.json(
        { error: "branchName is required" },
        { status: 400 }
      );
    }

    // Generate slug: prefer area-based slug for location identity
    const slugSource = body.area || body.branchName;
    const baseSlug = slugify(slugSource);
    let slug = baseSlug;

    // Check if slug already exists for this vendor
    const [existingSlug] = await db
      .select({ id: branches.id })
      .from(branches)
      .where(eq(branches.slug, slug))
      .limit(1);

    if (existingSlug) {
      const suffix = Math.random().toString(36).substring(2, 8);
      slug = `${baseSlug}-${suffix}`;
    }

    // Map city/area to legacy town/region for backwards compat
    const city = body.city || body.town || null;
    const area = body.area || null;

    const [created] = await db
      .insert(branches)
      .values({
        vendorId: vendor.id,
        branchName: body.branchName.trim(),
        slug,
        city,
        area,
        town: city,              // legacy fallback
        region: body.region || null,
        address: body.address || null,
        latitude: body.lat || body.latitude || null,
        longitude: body.lng || body.longitude || null,
        whatsappNumber: body.whatsappNumber || null,
        logoUrl: body.logoUrl || null,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Dashboard branches POST error:", error);
    return NextResponse.json(
      { error: "Failed to create branch" },
      { status: 500 }
    );
  }
}
