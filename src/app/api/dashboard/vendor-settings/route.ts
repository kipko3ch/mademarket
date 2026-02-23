import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

// GET /api/dashboard/vendor-settings — Return vendor settings
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json(vendor);
  } catch (error) {
    console.error("Vendor settings GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor settings" },
      { status: 500 }
    );
  }
}

// PATCH /api/dashboard/vendor-settings — Update vendor settings
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify vendor ownership
    const [vendor] = await db
      .select({ id: vendors.id, ownerId: vendors.ownerId })
      .from(vendors)
      .where(eq(vendors.ownerId, session.user.id))
      .limit(1);

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    if (vendor.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    // Only allow safe fields — never allow approved, active (admin-only)
    if ("name" in body && typeof body.name === "string" && body.name.trim()) {
      updateData.name = body.name.trim();
    }
    if ("description" in body) {
      updateData.description = body.description || null;
    }
    if ("logoUrl" in body) {
      updateData.logoUrl = body.logoUrl || null;
    }
    if ("bannerUrl" in body) {
      updateData.bannerUrl = body.bannerUrl || null;
    }
    if ("websiteUrl" in body) {
      updateData.websiteUrl = normalizeUrl(body.websiteUrl);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(vendors)
      .set(updateData)
      .where(eq(vendors.id, vendor.id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update vendor settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      logoUrl: updated.logoUrl,
      bannerUrl: updated.bannerUrl,
      websiteUrl: updated.websiteUrl,
      approved: updated.approved,
      active: updated.active,
    });
  } catch (error) {
    console.error("Vendor settings PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update vendor settings" },
      { status: 500 }
    );
  }
}
