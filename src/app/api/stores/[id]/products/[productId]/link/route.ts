import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { storeProducts, products, stores } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { normalizeProductName, slugify } from "@/lib/utils";

type RouteParams = { params: Promise<{ id: string; productId: string }> };

// PATCH /api/stores/[id]/products/[productId]/link — Change the linked core product
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id: storeId, productId: storeProductId } = await params;
  const session = await auth();

  if (
    !session?.user ||
    (session.user.role !== "vendor" && session.user.role !== "admin")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify store ownership for vendors
  if (session.user.role === "vendor") {
    const [store] = await db
      .select({ ownerId: stores.ownerId })
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (!store || store.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const body = await req.json();
    const { productId: newCoreProductId } = body;

    if (!newCoreProductId || typeof newCoreProductId !== "string") {
      return NextResponse.json(
        { error: "productId is required and must be a string" },
        { status: 400 }
      );
    }

    // Verify the store product exists and belongs to this store
    const [storeProduct] = await db
      .select({ id: storeProducts.id })
      .from(storeProducts)
      .where(
        and(
          eq(storeProducts.id, storeProductId),
          eq(storeProducts.storeId, storeId)
        )
      )
      .limit(1);

    if (!storeProduct) {
      return NextResponse.json(
        { error: "Store product not found" },
        { status: 404 }
      );
    }

    // Verify the target core product exists
    const [targetProduct] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, newCoreProductId))
      .limit(1);

    if (!targetProduct) {
      return NextResponse.json(
        { error: "Target product not found" },
        { status: 404 }
      );
    }

    // Update the store product to point to the new core product
    const [updated] = await db
      .update(storeProducts)
      .set({
        productId: newCoreProductId,
        matchStatus: "linked",
        updatedAt: new Date(),
      })
      .where(eq(storeProducts.id, storeProductId))
      .returning();

    return NextResponse.json(updated);
  } catch (error: unknown) {
    // Handle unique constraint violation (store already has this product linked)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "23505"
    ) {
      return NextResponse.json(
        { error: "This store already has the target product linked" },
        { status: 409 }
      );
    }

    console.error("Link product error:", error);
    return NextResponse.json(
      { error: "Failed to link product" },
      { status: 500 }
    );
  }
}

// DELETE /api/stores/[id]/products/[productId]/link — Unlink (create standalone copy)
export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams
) {
  const { id: storeId, productId: storeProductId } = await params;
  const session = await auth();

  if (
    !session?.user ||
    (session.user.role !== "vendor" && session.user.role !== "admin")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify store ownership for vendors
  if (session.user.role === "vendor") {
    const [store] = await db
      .select({ ownerId: stores.ownerId })
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (!store || store.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    // Fetch the store product and its linked core product details
    const [storeProduct] = await db
      .select({
        id: storeProducts.id,
        productId: storeProducts.productId,
        storeId: storeProducts.storeId,
      })
      .from(storeProducts)
      .where(
        and(
          eq(storeProducts.id, storeProductId),
          eq(storeProducts.storeId, storeId)
        )
      )
      .limit(1);

    if (!storeProduct) {
      return NextResponse.json(
        { error: "Store product not found" },
        { status: 404 }
      );
    }

    // Fetch the current core product details to copy
    const [coreProduct] = await db
      .select({
        name: products.name,
        brand: products.brand,
        size: products.size,
        barcode: products.barcode,
        description: products.description,
        categoryId: products.categoryId,
        imageUrl: products.imageUrl,
        unit: products.unit,
      })
      .from(products)
      .where(eq(products.id, storeProduct.productId))
      .limit(1);

    if (!coreProduct) {
      return NextResponse.json(
        { error: "Linked product not found" },
        { status: 404 }
      );
    }

    // Create a new standalone product record with the same details
    const [newProduct] = await db
      .insert(products)
      .values({
        name: coreProduct.name,
        normalizedName: normalizeProductName(coreProduct.name),
        slug: slugify(coreProduct.name) + "-" + Date.now(),
        brand: coreProduct.brand,
        size: coreProduct.size,
        barcode: coreProduct.barcode,
        description: coreProduct.description,
        categoryId: coreProduct.categoryId,
        imageUrl: coreProduct.imageUrl,
        unit: coreProduct.unit,
      })
      .returning();

    // Update the store product to point to the new standalone product
    const [updated] = await db
      .update(storeProducts)
      .set({
        productId: newProduct.id,
        matchStatus: "not_linked",
        updatedAt: new Date(),
      })
      .where(eq(storeProducts.id, storeProductId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Unlink product error:", error);
    return NextResponse.json(
      { error: "Failed to unlink product" },
      { status: 500 }
    );
  }
}
