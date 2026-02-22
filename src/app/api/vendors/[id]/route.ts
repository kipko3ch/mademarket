import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, branches } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

function normalizeUrl(url: string | undefined | null): string | undefined | null {
  if (!url) return url;
  url = url.trim();
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    return "https://" + url;
  }
  return url;
}

// GET /api/vendors/[id] — Single vendor by UUID or slug (public)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const condition = isUuid ? eq(vendors.id, id) : eq(vendors.slug, id);

    const [vendor] = await db.select().from(vendors).where(condition).limit(1);

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Non-admin can only see approved+active vendors
    if (!vendor.approved || !vendor.active) {
      const session = await auth();
      const isOwner = session?.user?.id === vendor.ownerId;
      const isAdmin = session?.user?.role === "admin";
      if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
      }
    }

    const vendorBranches = await db
      .select()
      .from(branches)
      .where(eq(branches.vendorId, vendor.id))
      .orderBy(branches.createdAt);

    return NextResponse.json({ ...vendor, branches: vendorBranches });
  } catch (error) {
    console.error("Vendor fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch vendor" }, { status: 500 });
  }
}

// PATCH /api/vendors/[id] — Update vendor (owner or admin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id)).limit(1);
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    if (vendor.ownerId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (session.user.role === "admin") {
      if ("approved" in body) updateData.approved = Boolean(body.approved);
      if ("active" in body) updateData.active = Boolean(body.active);
    }

    if ("name" in body && body.name) updateData.name = body.name;
    if ("description" in body) updateData.description = body.description;
    if ("logoUrl" in body) updateData.logoUrl = body.logoUrl;
    if ("bannerUrl" in body) updateData.bannerUrl = body.bannerUrl;
    if ("websiteUrl" in body) updateData.websiteUrl = normalizeUrl(body.websiteUrl);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const [updated] = await db.update(vendors).set(updateData).where(eq(vendors.id, id)).returning();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Vendor update error:", error);
    return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 });
  }
}
