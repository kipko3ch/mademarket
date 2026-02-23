import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { storeProducts, products, vendors, branches, categories } from "@/db/schema";
import { eq, and, inArray, ilike, or, isNotNull } from "drizzle-orm";
import { normalizeProductName } from "@/lib/utils";
import type { CompareResult } from "@/types";

export const dynamic = "force-dynamic";

// GET /api/compare?branchIds=id1,id2,id3&category=cat&search=query
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams;
  const branchIdsParam = url.get("branchIds") || "";
  const category = url.get("category") || "";
  const search = url.get("search") || "";

  const branchIds = branchIdsParam.split(",").filter(Boolean);

  if (branchIds.length < 2 || branchIds.length > 3) {
    return NextResponse.json(
      { error: "Select 2 or 3 branches to compare" },
      { status: 400 }
    );
  }

  try {
    // Build conditions
    const conditions = [
      inArray(storeProducts.branchId, branchIds),
      isNotNull(storeProducts.branchId),
      eq(storeProducts.inStock, true),
    ];

    if (search) {
      const normalizedSearch = normalizeProductName(search);
      conditions.push(
        or(
          ilike(products.normalizedName, `%${normalizedSearch}%`),
          ilike(products.name, `%${search}%`)
        )!
      );
    }

    if (category) {
      conditions.push(eq(products.categoryId, category));
    }

    // Single query: get all prices for selected branches
    const rows = await db
      .select({
        productId: products.id,
        productName: products.name,
        productImage: products.imageUrl,
        categoryName: categories.name,
        branchId: branches.id,
        vendorName: vendors.name,
        branchTown: branches.town,
        vendorSlug: vendors.slug,
        branchSlug: branches.slug,
        price: storeProducts.price,
      })
      .from(storeProducts)
      .innerJoin(products, eq(storeProducts.productId, products.id))
      .innerJoin(branches, and(
        eq(storeProducts.branchId, branches.id),
        eq(branches.approved, true),
        eq(branches.active, true)
      ))
      .innerJoin(vendors, and(
        eq(branches.vendorId, vendors.id),
        eq(vendors.approved, true),
        eq(vendors.active, true)
      ))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(products.name, vendors.name);

    // Group by product — since products table is the canonical source,
    // products with the same ID are guaranteed to be the same real-world item
    const productMap = new Map<string, CompareResult>();

    for (const row of rows) {
      if (!productMap.has(row.productId)) {
        productMap.set(row.productId, {
          productId: row.productId,
          productName: row.productName,
          productImage: row.productImage,
          category: row.categoryName || "Uncategorized",
          prices: [],
        });
      }

      productMap.get(row.productId)!.prices.push({
        branchId: row.branchId,
        vendorName: row.vendorName,
        branchTown: row.branchTown,
        vendorSlug: row.vendorSlug,
        branchSlug: row.branchSlug,
        price: Number(row.price),
        isCheapest: false,
        difference: 0,
      });
    }

    // Calculate cheapest and differences
    const results: CompareResult[] = [];

    for (const product of productMap.values()) {
      if (product.prices.length < 2) continue; // Only include products in 2+ branches

      const minPrice = Math.min(...product.prices.map((p) => p.price));

      product.prices.forEach((p) => {
        p.isCheapest = p.price === minPrice;
        p.difference = Math.round((p.price - minPrice) * 100) / 100;
      });

      results.push(product);
    }

    // Sort by savings (highest difference first)
    results.sort((a, b) => {
      const aMax = Math.max(...a.prices.map(p => p.difference));
      const bMax = Math.max(...b.prices.map(p => p.difference));
      return bMax - aMax;
    });

    // Get branch info for the selected branches
    const selectedBranches = await db
      .select({
        id: branches.id,
        branchName: branches.branchName,
        town: branches.town,
        vendorName: vendors.name,
        vendorSlug: vendors.slug,
        branchSlug: branches.slug,
        vendorLogoUrl: vendors.logoUrl,
      })
      .from(branches)
      .innerJoin(vendors, eq(branches.vendorId, vendors.id))
      .where(inArray(branches.id, branchIds));

    return NextResponse.json({
      results,
      branches: selectedBranches,
      totalProducts: results.length,
    });
  } catch (error) {
    console.error("Comparison error:", error);
    return NextResponse.json(
      { error: "Failed to compare prices" },
      { status: 500 }
    );
  }
}
