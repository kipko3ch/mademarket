import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// PATCH /api/admin/stores/[id] — Approve/reject a store
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
