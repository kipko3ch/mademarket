import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sponsoredListings, stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSponsoredSchema = z.object({
  storeId: z.string().uuid(),
  productId: z.string().uuid(),
  startDate: z.string(),
  endDate: z.string(),
  priorityLevel: z.number().int().min(1).max(3),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "vendor" && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = createSponsoredSchema.parse(body);

    // Verify store ownership if vendor
    if (session.user.role === "vendor") {
      const [store] = await db
        .select({ ownerId: stores.ownerId })
        .from(stores)
        .where(eq(stores.id, validated.storeId))
        .limit(1);

      if (!store || store.ownerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const [listing] = await db
      .insert(sponsoredListings)
      .values({
        storeId: validated.storeId,
        productId: validated.productId,
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
        priorityLevel: validated.priorityLevel,
        approved: session.user.role === "admin", // Auto-approve if admin
      })
      .returning();

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Sponsored listing error:", error);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
