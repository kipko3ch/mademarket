import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// PATCH /api/dashboard/store-settings — Vendor updates their own store
export async function PATCH(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // First, verify the vendor owns a store
    const [store] = await db
      .select({ id: stores.id, ownerId: stores.ownerId })
      .from(stores)
      .where(eq(stores.ownerId, session.user.id))
      .limit(1);

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Verify ownership (belt-and-suspenders check)
    if (store.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    // Only allow safe fields — never allow approved, showInMarquee, marqueeOrder
    if ("name" in body && typeof body.name === "string" && body.name.trim()) {
      updateData.name = body.name.trim();
    }
    if ("description" in body) {
      updateData.description = body.description || null;
    }
    if ("address" in body) {
      updateData.address = body.address || null;
    }
    if ("whatsappNumber" in body) {
      updateData.whatsappNumber = body.whatsappNumber || null;
    }
    if ("logoUrl" in body) {
      updateData.logoUrl = body.logoUrl || null;
    }
    if ("bannerUrl" in body) {
      updateData.bannerUrl = body.bannerUrl || null;
    }
    if ("websiteUrl" in body) {
      updateData.websiteUrl = body.websiteUrl || null;
    }
    if ("region" in body) {
      updateData.region = body.region || null;
    }
    if ("city" in body) {
      updateData.city = body.city || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const [updated] = await db
      .update(stores)
      .set(updateData)
      .where(and(eq(stores.id, store.id), eq(stores.ownerId, session.user.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Failed to update store" }, { status: 500 });
    }

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      region: updated.region,
      city: updated.city,
      address: updated.address,
      whatsappNumber: updated.whatsappNumber,
      logoUrl: updated.logoUrl,
      bannerUrl: updated.bannerUrl,
      websiteUrl: updated.websiteUrl,
      approved: updated.approved,
    });
  } catch (error) {
    console.error("Vendor store settings update error:", error);
    return NextResponse.json({ error: "Failed to update store settings" }, { status: 500 });
  }
}
