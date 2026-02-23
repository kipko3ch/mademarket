import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// PATCH /api/admin/stores/[id] — Update a vendor (approve/reject/deactivate/settings)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  // Allow admin or vendor (vendors can update their own vendor profile)
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "vendor")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    // Admin-only fields
    if (session.user.role === "admin") {
      if ("approved" in body) updateData.approved = Boolean(body.approved);
      if ("active" in body) updateData.active = Boolean(body.active);
    }

    // Fields editable by both admin and vendor
    if ("name" in body) updateData.name = body.name;
    if ("description" in body) updateData.description = body.description || null;
    if ("logoUrl" in body) updateData.logoUrl = body.logoUrl || null;
    if ("bannerUrl" in body) updateData.bannerUrl = body.bannerUrl || null;
    if ("websiteUrl" in body) updateData.websiteUrl = body.websiteUrl || null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const [updated] = await db
      .update(vendors)
      .set(updateData)
      .where(eq(vendors.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Vendor update error:", error);
    return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 });
  }
}

// DELETE /api/admin/stores/[id] — Delete a vendor and all associated data (branches cascade)
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
    // Get vendor info first (for the owner's user ID)
    const [vendor] = await db
      .select({ id: vendors.id, ownerId: vendors.ownerId, name: vendors.name })
      .from(vendors)
      .where(eq(vendors.id, id))
      .limit(1);

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Delete the vendor — all related data (branches, storeProducts, priceHistory,
    // sponsoredListings, bundles, brochures) cascade-deletes automatically
    await db.delete(vendors).where(eq(vendors.id, id));

    // Downgrade the vendor user back to regular user
    await db
      .update(users)
      .set({ role: "user" })
      .where(eq(users.id, vendor.ownerId));

    return NextResponse.json({
      success: true,
      message: `Vendor "${vendor.name}" and all associated data have been deleted`,
    });
  } catch (error) {
    console.error("Vendor delete error:", error);
    return NextResponse.json({ error: "Failed to delete vendor" }, { status: 500 });
  }
}
