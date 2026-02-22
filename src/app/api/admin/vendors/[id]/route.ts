import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// PATCH /api/admin/vendors/[id] — Approve/suspend vendor
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if ("approved" in body) updateData.approved = Boolean(body.approved);
    if ("active" in body) updateData.active = Boolean(body.active);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const [updated] = await db.update(vendors).set(updateData).where(eq(vendors.id, id)).returning();
    if (!updated) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin vendor update error:", error);
    return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 });
  }
}

// DELETE /api/admin/vendors/[id] — Delete vendor (cascade)
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
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id)).limit(1);
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    await db.delete(vendors).where(eq(vendors.id, id));

    // Downgrade user role if no other vendors
    const remaining = await db.select().from(vendors).where(eq(vendors.ownerId, vendor.ownerId));
    if (remaining.length === 0) {
      await db.update(users).set({ role: "user" }).where(eq(users.id, vendor.ownerId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin vendor delete error:", error);
    return NextResponse.json({ error: "Failed to delete vendor" }, { status: 500 });
  }
}
