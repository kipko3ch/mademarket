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

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { approved } = await req.json();

    const [updated] = await db
      .update(stores)
      .set({ approved: Boolean(approved) })
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
