import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { branches } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// PATCH /api/admin/branches/[id] — Update branch (admin)
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
    if ("showInMarquee" in body) updateData.showInMarquee = Boolean(body.showInMarquee);
    if ("marqueeOrder" in body) updateData.marqueeOrder = Number(body.marqueeOrder);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const [updated] = await db
      .update(branches)
      .set(updateData)
      .where(eq(branches.id, id))
      .returning();

    if (!updated) return NextResponse.json({ error: "Branch not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin branch update error:", error);
    return NextResponse.json({ error: "Failed to update branch" }, { status: 500 });
  }
}

// DELETE /api/admin/branches/[id] — Delete branch (admin)
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
    console.error("Admin branch delete error:", error);
    return NextResponse.json({ error: "Failed to delete branch" }, { status: 500 });
  }
}
