import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stores, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// PATCH /api/admin/stores/[id] — Update a store (approve/reject/suspend/settings)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  // Allow admin or vendor (vendors can update their own store)
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "vendor")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    // Admin-only fields
    if (session.user.role === "admin") {
      if ("approved" in body) updateData.approved = Boolean(body.approved);
      if ("suspended" in body) updateData.suspended = Boolean(body.suspended);
      if ("showInMarquee" in body) updateData.showInMarquee = Boolean(body.showInMarquee);
      if ("marqueeOrder" in body) updateData.marqueeOrder = Number(body.marqueeOrder);
    }

    // Fields editable by both admin and vendor
    if ("name" in body) updateData.name = body.name;
    if ("description" in body) updateData.description = body.description || null;
    if ("address" in body) updateData.address = body.address || null;
    if ("whatsappNumber" in body) updateData.whatsappNumber = body.whatsappNumber || null;
    if ("logoUrl" in body) updateData.logoUrl = body.logoUrl || null;
    if ("bannerUrl" in body) updateData.bannerUrl = body.bannerUrl || null;
    if ("websiteUrl" in body) updateData.websiteUrl = body.websiteUrl || null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const [updated] = await db
      .update(stores)
      .set(updateData)
      .where(eq(stores.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Store update error:", error);
    return NextResponse.json({ error: "Failed to update store" }, { status: 500 });
  }
}

// DELETE /api/admin/stores/[id] — Delete a vendor store and all associated data
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
    // Get store info first (for the owner's user ID)
    const [store] = await db
      .select({ id: stores.id, ownerId: stores.ownerId, name: stores.name })
      .from(stores)
      .where(eq(stores.id, id))
      .limit(1);

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Delete the store — all related data (storeProducts, priceHistory,
    // sponsoredListings, bundles, brochures) cascade-deletes automatically
    await db.delete(stores).where(eq(stores.id, id));

    // Downgrade the vendor user back to regular user
    await db
      .update(users)
      .set({ role: "user" })
      .where(eq(users.id, store.ownerId));

    return NextResponse.json({
      success: true,
      message: `Store "${store.name}" and all associated data have been deleted`,
    });
  } catch (error) {
    console.error("Store delete error:", error);
    return NextResponse.json({ error: "Failed to delete store" }, { status: 500 });
  }
}
