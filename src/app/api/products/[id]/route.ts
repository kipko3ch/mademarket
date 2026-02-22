export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, storeProducts, stores, categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { normalizeProductName, slugify } from "@/lib/utils";

// GET /api/products/[id] — Return a single product with full details and store prices
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const [productRows, priceRows] = await Promise.all([
      // Product info with category — includes brand, size, description
      db
        .select({
          id: products.id,
          name: products.name,
          imageUrl: products.imageUrl,
          unit: products.unit,
          brand: products.brand,
          size: products.size,
          description: products.description,
          categoryName: categories.name,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(products.id, id))
        .limit(1),

      // Store prices — sorted by lowest first
      db
        .select({
          storeId: stores.id,
          storeName: stores.name,
          storeLogo: stores.logoUrl,
          price: storeProducts.price,
          inStock: storeProducts.inStock,
          externalUrl: storeProducts.externalUrl,
        })
        .from(storeProducts)
        .innerJoin(
          stores,
          and(eq(storeProducts.storeId, stores.id), eq(stores.approved, true))
        )
        .where(eq(storeProducts.productId, id))
        .orderBy(storeProducts.price),
    ]);

    if (productRows.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const storePrices = priceRows.map((r) => ({
      storeId: r.storeId,
      storeName: r.storeName,
      storeLogo: r.storeLogo,
      price: Number(r.price),
      inStock: r.inStock,
      externalUrl: r.externalUrl,
    }));

    const cheapestPrice = storePrices.length > 0 ? storePrices[0].price : null;

    return NextResponse.json({
      ...productRows[0],
      storePrices,
      cheapestPrice,
      storeCount: storePrices.length,
    });
  } catch (error) {
    console.error("Product detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PATCH /api/products/[id] — Update product (vendor/admin only)
const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  imageUrl: z.string().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  unit: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user || (session.user.role !== "vendor" && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify the product exists
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // If vendor, verify they have this product in their store
    if (session.user.role === "vendor") {
      const [hasProduct] = await db
        .select({ id: storeProducts.id })
        .from(storeProducts)
        .innerJoin(stores, eq(storeProducts.storeId, stores.id))
        .where(
          and(
            eq(storeProducts.productId, id),
            eq(stores.ownerId, session.user.id)
          )
        )
        .limit(1);

      if (!hasProduct) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const body = await req.json();
    const validated = updateProductSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    if (validated.name !== undefined) {
      updateData.name = validated.name;
      updateData.normalizedName = normalizeProductName(validated.name);
      updateData.slug = slugify(validated.name);
    }
    if (validated.imageUrl !== undefined) updateData.imageUrl = validated.imageUrl;
    if (validated.categoryId !== undefined) updateData.categoryId = validated.categoryId;
    if (validated.unit !== undefined) updateData.unit = validated.unit;
    if (validated.brand !== undefined) updateData.brand = validated.brand;
    if (validated.size !== undefined) updateData.size = validated.size;
    if (validated.barcode !== undefined) updateData.barcode = validated.barcode;
    if (validated.description !== undefined) updateData.description = validated.description;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const [updated] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Product update error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}
