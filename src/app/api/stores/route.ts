import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stores, users, storeProducts } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

// GET /api/stores — List approved stores
export async function GET() {
  try {
    const storeList = await db
      .select({
        id: stores.id,
        name: stores.name,
        slug: stores.slug,
        description: stores.description,
        logoUrl: stores.logoUrl,
        whatsappNumber: stores.whatsappNumber,
        address: stores.address,
        region: stores.region,
        city: stores.city,
        productCount: sql<number>`count(${storeProducts.id})`.as("product_count"),
      })
      .from(stores)
      .leftJoin(storeProducts, eq(stores.id, storeProducts.storeId))
      .where(and(eq(stores.approved, true), eq(stores.suspended, false)))
      .groupBy(stores.id);

    return NextResponse.json(storeList, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  } catch (error) {
    console.error("Stores fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 });
  }
}

// POST /api/stores — Register a new store (vendor only)
const createStoreSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters"),
  description: z.string().optional(),
  region: z.string().min(1, "Region is required"),
  city: z.string().min(1, "City is required"),
  whatsappNumber: z.string().optional(),
  address: z.string().optional(),
  logoUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = createStoreSchema.parse(body);

    // Upgrade user to vendor if they are a regular user
    if (session.user.role === "user") {
      await db
        .update(users)
        .set({ role: "vendor" })
        .where(eq(users.id, session.user.id));
    }

    // Check if user already has a store
    const [existingStore] = await db
      .select({ id: stores.id })
      .from(stores)
      .where(eq(stores.ownerId, session.user.id))
      .limit(1);

    if (existingStore) {
      return NextResponse.json(
        { error: "You already have a registered store" },
        { status: 409 }
      );
    }

    // Generate slug
    const slug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const [store] = await db
      .insert(stores)
      .values({
        ownerId: session.user.id,
        name: validated.name,
        slug,
        description: validated.description || null,
        region: validated.region,
        city: validated.city,
        whatsappNumber: validated.whatsappNumber || null,
        address: validated.address || null,
        logoUrl: validated.logoUrl || null,
        websiteUrl: validated.websiteUrl || null,
        bannerUrl: validated.bannerUrl || null,
        approved: false, // requires admin approval
      })
      .returning();

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Store creation error:", error);
    return NextResponse.json({ error: "Failed to create store" }, { status: 500 });
  }
}
