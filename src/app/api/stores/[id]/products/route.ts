import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { storeProducts, products, stores, priceHistory } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

// GET /api/stores/[id]/products — Get all products for a store
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: storeId } = await params;

  try {
    const storeProductList = await db
      .select({
        id: storeProducts.id,
        productId: storeProducts.productId,
        productName: products.name,
        productImage: products.imageUrl,
        unit: products.unit,
        price: storeProducts.price,
        bundleInfo: storeProducts.bundleInfo,
        brochureUrl: storeProducts.brochureUrl,
        inStock: storeProducts.inStock,
        updatedAt: storeProducts.updatedAt,
      })
      .from(storeProducts)
      .innerJoin(products, eq(storeProducts.productId, products.id))
      .where(eq(storeProducts.storeId, storeId))
      .orderBy(products.name);

    return NextResponse.json(storeProductList);
  } catch (error) {
    console.error("Store products fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch store products" },
      { status: 500 }
    );
  }
}

// POST /api/stores/[id]/products — Add or update product price for a store
const addProductSchema = z.object({
  productId: z.string().uuid(),
  price: z.number().positive("Price must be positive"),
  bundleInfo: z.string().optional(),
  brochureUrl: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: storeId } = await params;
  const session = await auth();

  if (!session?.user || (session.user.role !== "vendor" && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify store ownership and approval
  if (session.user.role === "vendor") {
    const [store] = await db
      .select({ ownerId: stores.ownerId, approved: stores.approved })
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (!store || store.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!store.approved) {
      return NextResponse.json(
        { error: "Store must be approved before you can perform this action. Contact admin: +264818222368" },
        { status: 403 }
      );
    }
  }

  try {
    const body = await req.json();
    const validated = addProductSchema.parse(body);

    // Check if store product exists (for price update)
    const [existing] = await db
      .select({ id: storeProducts.id, price: storeProducts.price })
      .from(storeProducts)
      .where(
        and(
          eq(storeProducts.storeId, storeId),
          eq(storeProducts.productId, validated.productId)
        )
      )
      .limit(1);

    if (existing) {
      const oldPrice = Number(existing.price);
      const newPrice = validated.price;

      // Update price
      const [updated] = await db
        .update(storeProducts)
        .set({
          price: String(newPrice),
          bundleInfo: validated.bundleInfo || null,
          brochureUrl: validated.brochureUrl || null,
          updatedAt: new Date(),
        })
        .where(eq(storeProducts.id, existing.id))
        .returning();

      // Track price change if different
      if (oldPrice !== newPrice) {
        await db.insert(priceHistory).values({
          storeProductId: existing.id,
          oldPrice: String(oldPrice),
          newPrice: String(newPrice),
        });
      }

      return NextResponse.json(updated);
    }

    // Create new store product
    const [created] = await db
      .insert(storeProducts)
      .values({
        storeId,
        productId: validated.productId,
        price: String(validated.price),
        bundleInfo: validated.bundleInfo || null,
        brochureUrl: validated.brochureUrl || null,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Store product error:", error);
    return NextResponse.json(
      { error: "Failed to add/update product" },
      { status: 500 }
    );
  }
}
