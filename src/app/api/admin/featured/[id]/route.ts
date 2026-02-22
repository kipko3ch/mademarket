export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { featuredProducts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

const patchSchema = z.object({
  active: z.boolean().optional(),
  priority: z.enum(["premium", "standard"]).optional(),
  durationDays: z.number().int().min(1).optional(),
  expiresAt: z.string().datetime().optional(),
});

// PATCH /api/admin/featured/[id] — Update a featured product (admin only)
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
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};

    if (parsed.data.active !== undefined) updates.active = parsed.data.active;
    if (parsed.data.priority !== undefined) updates.priority = parsed.data.priority;
    if (parsed.data.durationDays !== undefined) updates.durationDays = parsed.data.durationDays;
    if (parsed.data.expiresAt !== undefined) updates.expiresAt = new Date(parsed.data.expiresAt);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(featuredProducts)
      .set(updates)
      .where(eq(featuredProducts.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Featured product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin featured PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update featured product" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/featured/[id] — Delete a featured product (admin only)
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
    const [deleted] = await db
      .delete(featuredProducts)
      .where(eq(featuredProducts.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Featured product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin featured DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete featured product" },
      { status: 500 }
    );
  }
}
