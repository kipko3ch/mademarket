import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { storeProducts, products, branches, vendors, priceHistory } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

// UUID v4 format regex
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/stores/[id]/products — Get all products for a branch (accepts UUID or slug)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Resolve slug to UUID if needed
    let branchId = id;
    if (!UUID_REGEX.test(id)) {
      const [found] = await db
        .select({ id: branches.id })
        .from(branches)
        .where(eq(branches.slug, id))
        .limit(1);
      if (!found) {
        return NextResponse.json([], { status: 200 });
      }
      branchId = found.id;
    }

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
        matchStatus: storeProducts.matchStatus,
        updatedAt: storeProducts.updatedAt,
      })
      .from(storeProducts)
      .innerJoin(products, eq(storeProducts.productId, products.id))
      .where(eq(storeProducts.branchId, branchId))
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

// POST /api/stores/[id]/products — Add or update product price for a branch
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
  const { id: branchId } = await params;
  const session = await auth();

  if (!session?.user || (session.user.role !== "vendor" && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify branch ownership and vendor approval
  if (session.user.role === "vendor") {
    const [branch] = await db
      .select({ id: branches.id, vendorId: branches.vendorId })
      .from(branches)
      .where(eq(branches.id, branchId))
      .limit(1);

    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    const [vendor] = await db
      .select({ ownerId: vendors.ownerId, approved: vendors.approved })
      .from(vendors)
      .where(eq(vendors.id, branch.vendorId))
      .limit(1);

    if (!vendor || vendor.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!vendor.approved) {
      return NextResponse.json(
        { error: "Vendor must be approved before you can perform this action. Contact admin: +264818222368" },
        { status: 403 }
      );
    }
  }

  try {
    const body = await req.json();
    const validated = addProductSchema.parse(body);

    // Check if branch product exists (for price update)
    const [existing] = await db
      .select({ id: storeProducts.id, price: storeProducts.price })
      .from(storeProducts)
      .where(
        and(
          eq(storeProducts.branchId, branchId),
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

    // Create new branch product
    const [created] = await db
      .insert(storeProducts)
      .values({
        branchId,
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

// DELETE /api/stores/[id]/products — Permanently remove a listing from this branch
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: branchId } = await params;
  const session = await auth();

  if (!session?.user || (session.user.role !== "vendor" && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { storeProductId } = body as { storeProductId: string };

    if (!storeProductId) {
      return NextResponse.json({ error: "storeProductId is required" }, { status: 400 });
    }

    // Verify the store product exists and belongs to this branch
    const [sp] = await db
      .select({ id: storeProducts.id, branchId: storeProducts.branchId })
      .from(storeProducts)
      .where(and(eq(storeProducts.id, storeProductId), eq(storeProducts.branchId, branchId)))
      .limit(1);

    if (!sp) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // For vendors, verify they own this branch
    if (session.user.role === "vendor") {
      const [branch] = await db
        .select({ vendorId: branches.vendorId })
        .from(branches)
        .where(eq(branches.id, branchId))
        .limit(1);

      if (!branch) {
        return NextResponse.json({ error: "Branch not found" }, { status: 404 });
      }

      const [vendor] = await db
        .select({ ownerId: vendors.ownerId })
        .from(vendors)
        .where(eq(vendors.id, branch.vendorId))
        .limit(1);

      if (!vendor || vendor.ownerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Delete — priceHistory cascades via FK
    await db.delete(storeProducts).where(eq(storeProducts.id, storeProductId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete listing error:", error);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}
