import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, branches } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/dashboard/branches/[id] — Get single branch (must belong to current vendor)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const [branch] = await db
      .select({
        id: branches.id,
        branchName: branches.branchName,
        slug: branches.slug,
        town: branches.town,
        region: branches.region,
        address: branches.address,
        latitude: branches.latitude,
        longitude: branches.longitude,
        whatsappNumber: branches.whatsappNumber,
        approved: branches.approved,
        active: branches.active,
        showInMarquee: branches.showInMarquee,
        createdAt: branches.createdAt,
      })
      .from(branches)
      .where(and(eq(branches.id, id), eq(branches.vendorId, vendor.id)))
      .limit(1);

    if (!branch) {
      return NextResponse.json(
        { error: "Branch not found or not owned by you" },
        { status: 404 }
      );
    }

    return NextResponse.json(branch);
  } catch (error) {
    console.error("Dashboard branch GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch branch" },
      { status: 500 }
    );
  }
}

// PATCH /api/dashboard/branches/[id] — Update branch settings
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if ("branchName" in body && typeof body.branchName === "string" && body.branchName.trim()) {
      updateData.branchName = body.branchName.trim();
    }
    if ("town" in body) {
      updateData.town = body.town || null;
    }
    if ("region" in body) {
      updateData.region = body.region || null;
    }
    if ("address" in body) {
      updateData.address = body.address || null;
    }
    if ("lat" in body || "latitude" in body) {
      updateData.latitude = body.lat || body.latitude || null;
    }
    if ("lng" in body || "longitude" in body) {
      updateData.longitude = body.lng || body.longitude || null;
    }
    if ("whatsappNumber" in body) {
      updateData.whatsappNumber = body.whatsappNumber || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(branches)
      .set(updateData)
      .where(and(eq(branches.id, id), eq(branches.vendorId, vendor.id)))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Branch not found or not owned by you" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Dashboard branch PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update branch" },
      { status: 500 }
    );
  }
}

// DELETE /api/dashboard/branches/[id] — Delete branch (cannot delete last branch)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    // Count branches for this vendor — cannot delete the last one
    const allBranches = await db
      .select({ id: branches.id })
      .from(branches)
      .where(eq(branches.vendorId, vendor.id));

    if (allBranches.length <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the last branch. A vendor must have at least one branch." },
        { status: 400 }
      );
    }

    const [deleted] = await db
      .delete(branches)
      .where(and(eq(branches.id, id), eq(branches.vendorId, vendor.id)))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Branch not found or not owned by you" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Dashboard branch DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete branch" },
      { status: 500 }
    );
  }
}
