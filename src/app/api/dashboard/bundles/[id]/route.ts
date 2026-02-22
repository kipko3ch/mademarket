export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bundles, stores } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

const patchBundleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
  price: z.number().positive().optional(),
  externalUrl: z.string().url().optional().nullable(),
  items: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

// PATCH /api/dashboard/bundles/[id] — Vendor update bundle (verify ownership)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user || session.user.role !== "vendor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.ownerId, session.user.id))
      .limit(1);

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = patchBundleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};

    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.description !== undefined) updates.description = parsed.data.description;
    if (parsed.data.imageUrl !== undefined) updates.imageUrl = parsed.data.imageUrl;
    if (parsed.data.price !== undefined) updates.price = parsed.data.price.toFixed(2);
    if (parsed.data.externalUrl !== undefined) updates.externalUrl = parsed.data.externalUrl;
    if (parsed.data.items !== undefined) updates.items = parsed.data.items;
    if (parsed.data.active !== undefined) updates.active = parsed.data.active;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(bundles)
      .set(updates)
      .where(and(eq(bundles.id, id), eq(bundles.storeId, store.id)))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Bundle not found or not owned by you" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ...updated, price: Number(updated.price) });
  } catch (error) {
    console.error("Dashboard bundle PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update bundle" },
      { status: 500 }
    );
  }
}

// DELETE /api/dashboard/bundles/[id] — Vendor delete bundle (verify ownership)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user || session.user.role !== "vendor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.ownerId, session.user.id))
      .limit(1);

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    const [deleted] = await db
      .delete(bundles)
      .where(and(eq(bundles.id, id), eq(bundles.storeId, store.id)))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Bundle not found or not owned by you" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Dashboard bundle DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete bundle" },
      { status: 500 }
    );
  }
}
