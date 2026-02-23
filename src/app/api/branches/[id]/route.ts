import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, branches } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/branches/[id] — Single branch with vendor info
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const result = await db
      .select({
        branch: branches,
        vendorName: vendors.name,
        vendorSlug: vendors.slug,
        vendorLogoUrl: vendors.logoUrl,
      })
      .from(branches)
      .innerJoin(vendors, eq(branches.vendorId, vendors.id))
      .where(eq(branches.id, id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    const row = result[0];
    return NextResponse.json({
      ...row.branch,
      vendorName: row.vendorName,
      vendorSlug: row.vendorSlug,
      vendorLogoUrl: row.vendorLogoUrl,
    });
  } catch (error) {
    console.error("Branch fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch branch" }, { status: 500 });
  }
}

// PATCH /api/branches/[id] — Update branch (owner or admin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [branch] = await db.select().from(branches).where(eq(branches.id, id)).limit(1);
    if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 404 });

    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, branch.vendorId)).limit(1);
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    if (vendor.ownerId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (session.user.role === "admin") {
      if ("approved" in body) updateData.approved = Boolean(body.approved);
      if ("active" in body) updateData.active = Boolean(body.active);
      if ("showInMarquee" in body) updateData.showInMarquee = Boolean(body.showInMarquee);
      if ("marqueeOrder" in body) updateData.marqueeOrder = Number(body.marqueeOrder);
    }

    if ("branchName" in body) updateData.branchName = body.branchName;
    if ("town" in body) updateData.town = body.town;
    if ("region" in body) updateData.region = body.region;
    if ("address" in body) updateData.address = body.address;
    if ("latitude" in body) updateData.latitude = body.latitude;
    if ("longitude" in body) updateData.longitude = body.longitude;
    if ("whatsappNumber" in body) updateData.whatsappNumber = body.whatsappNumber;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const [updated] = await db.update(branches).set(updateData).where(eq(branches.id, id)).returning();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Branch update error:", error);
    return NextResponse.json({ error: "Failed to update branch" }, { status: 500 });
  }
}

// DELETE /api/branches/[id] — Delete branch (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db.delete(branches).where(eq(branches.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Branch delete error:", error);
    return NextResponse.json({ error: "Failed to delete branch" }, { status: 500 });
  }
}
