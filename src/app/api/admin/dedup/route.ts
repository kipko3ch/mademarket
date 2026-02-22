import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, storeProducts, featuredProducts, productClicks, sponsoredListings } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { normalizeProductName, extractProductMeta, slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET /api/admin/dedup — Preview duplicate groups (dry run)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all products
    const allProducts = await db
      .select({
        id: products.id,
        name: products.name,
        normalizedName: products.normalizedName,
        imageUrl: products.imageUrl,
        categoryId: products.categoryId,
        unit: products.unit,
        brand: products.brand,
        size: products.size,
        barcode: products.barcode,
        storeCount: sql<number>`(select count(*) from store_products where store_products.product_id = ${products.id})`.as("store_count"),
      })
      .from(products)
      .orderBy(products.name);

    // Group by enhanced normalized name
    const groups = new Map<string, typeof allProducts>();

    for (const p of allProducts) {
      const key = normalizeProductName(p.name);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(p);
    }

    // Only return groups with duplicates
    const duplicateGroups = Array.from(groups.entries())
      .filter(([, items]) => items.length > 1)
      .map(([normalizedKey, items]) => ({
        normalizedKey,
        count: items.length,
        products: items.map((p) => ({
          id: p.id,
          name: p.name,
          normalizedName: p.normalizedName,
          imageUrl: p.imageUrl,
          storeCount: Number(p.storeCount),
        })),
      }));

    return NextResponse.json({
      totalProducts: allProducts.length,
      duplicateGroups: duplicateGroups.length,
      totalDuplicates: duplicateGroups.reduce((sum, g) => sum + g.count - 1, 0),
      groups: duplicateGroups,
    });
  } catch (error) {
    console.error("Dedup preview error:", error);
    return NextResponse.json({ error: "Failed to analyze duplicates" }, { status: 500 });
  }
}

// POST /api/admin/dedup — Execute deduplication (merge duplicates)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all products
    const allProducts = await db
      .select()
      .from(products)
      .orderBy(products.createdAt);

    // Group by enhanced normalized name
    const groups = new Map<string, (typeof allProducts)>();

    for (const p of allProducts) {
      const key = normalizeProductName(p.name);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(p);
    }

    let mergedCount = 0;
    let deletedCount = 0;

    for (const [normalizedKey, items] of groups) {
      if (items.length <= 1) continue;

      // Pick the "canonical" product: prefer one with image, most complete data, oldest
      const canonical = items.reduce((best, current) => {
        // Score each product by data completeness
        const score = (p: typeof current) =>
          (p.imageUrl ? 4 : 0) +
          (p.categoryId ? 2 : 0) +
          (p.brand ? 1 : 0) +
          (p.size ? 1 : 0) +
          (p.barcode ? 1 : 0) +
          (p.description ? 1 : 0);

        return score(current) > score(best) ? current : best;
      });

      const duplicateIds = items.filter((p) => p.id !== canonical.id).map((p) => p.id);

      // Merge data: fill missing fields from duplicates
      const updates: Record<string, unknown> = {};
      if (!canonical.imageUrl) {
        const withImage = items.find((p) => p.imageUrl && p.id !== canonical.id);
        if (withImage) updates.imageUrl = withImage.imageUrl;
      }
      if (!canonical.categoryId) {
        const withCat = items.find((p) => p.categoryId && p.id !== canonical.id);
        if (withCat) updates.categoryId = withCat.categoryId;
      }
      if (!canonical.brand) {
        const meta = extractProductMeta(canonical.name);
        updates.brand = meta.brand;
      }
      if (!canonical.size) {
        const meta = extractProductMeta(canonical.name);
        updates.size = meta.size;
      }
      if (!canonical.slug) {
        updates.slug = slugify(canonical.name);
      }
      // Always update normalizedName with enhanced version
      updates.normalizedName = normalizedKey;

      // Update canonical product
      if (Object.keys(updates).length > 0) {
        await db.update(products).set(updates).where(eq(products.id, canonical.id));
      }

      // Reassign all store_products from duplicates to canonical
      for (const dupId of duplicateIds) {
        // Check for conflicts: if canonical already has this store's product
        const dupStoreProducts = await db
          .select()
          .from(storeProducts)
          .where(eq(storeProducts.productId, dupId));

        for (const sp of dupStoreProducts) {
          // Check if canonical already has an entry for this store
          const [existingEntry] = await db
            .select({ id: storeProducts.id })
            .from(storeProducts)
            .where(
              sql`${storeProducts.storeId} = ${sp.storeId} AND ${storeProducts.productId} = ${canonical.id}`
            )
            .limit(1);

          if (existingEntry) {
            // Duplicate entry for same store — delete the dup's entry
            await db.delete(storeProducts).where(eq(storeProducts.id, sp.id));
          } else {
            // Reassign to canonical
            await db
              .update(storeProducts)
              .set({ productId: canonical.id })
              .where(eq(storeProducts.id, sp.id));
          }
        }

        // Reassign featured products references
        await db
          .update(featuredProducts)
          .set({ productId: canonical.id })
          .where(eq(featuredProducts.productId, dupId))
          .catch(() => {});

        // Reassign product clicks
        await db
          .update(productClicks)
          .set({ productId: canonical.id })
          .where(eq(productClicks.productId, dupId))
          .catch(() => {});

        // Reassign sponsored listings
        await db
          .update(sponsoredListings)
          .set({ productId: canonical.id })
          .where(eq(sponsoredListings.productId, dupId))
          .catch(() => {});

        // Delete the duplicate product
        await db.delete(products).where(eq(products.id, dupId));
        deletedCount++;
      }

      mergedCount++;
    }

    // Re-normalize ALL remaining products with the enhanced function
    const remaining = await db.select({ id: products.id, name: products.name }).from(products);
    for (const p of remaining) {
      const normalized = normalizeProductName(p.name);
      const slug = slugify(p.name);
      const meta = extractProductMeta(p.name);
      await db
        .update(products)
        .set({
          normalizedName: normalized,
          slug,
          brand: meta.brand,
          size: meta.size,
        })
        .where(eq(products.id, p.id));
    }

    return NextResponse.json({
      success: true,
      mergedGroups: mergedCount,
      deletedProducts: deletedCount,
      remainingProducts: remaining.length,
    });
  } catch (error) {
    console.error("Dedup execution error:", error);
    return NextResponse.json({ error: "Failed to deduplicate products" }, { status: 500 });
  }
}
