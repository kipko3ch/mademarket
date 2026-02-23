import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { storeProducts, products, vendors, branches } from "@/db/schema";
import { inArray, eq, and, isNotNull } from "drizzle-orm";
import { z } from "zod";
import type { CartCalculation, CartBranchBreakdown } from "@/types";

export const dynamic = "force-dynamic";

const cartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive().default(1),
    })
  ).min(1, "Cart must have at least one item"),
});

// POST /api/cart/calculate — Smart Cart Engine
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = cartSchema.parse(body);

    const productIds = items.map((item) => item.productId);
    const quantityMap = new Map(items.map((i) => [i.productId, i.quantity]));
    const totalItemsRequested = productIds.length;

    // Single optimized query: get all branch prices for requested products
    const results = await db
      .select({
        branchId: branches.id,
        branchName: branches.branchName,
        vendorId: vendors.id,
        vendorName: vendors.name,
        vendorSlug: vendors.slug,
        branchSlug: branches.slug,
        town: branches.town,
        vendorLogoUrl: vendors.logoUrl,
        vendorWebsiteUrl: vendors.websiteUrl,
        branchWhatsapp: branches.whatsappNumber,
        productId: storeProducts.productId,
        productName: products.name,
        productImage: products.imageUrl,
        price: storeProducts.price,
        externalUrl: storeProducts.externalUrl,
      })
      .from(storeProducts)
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
      .innerJoin(products, eq(storeProducts.productId, products.id))
      .where(
        and(
          inArray(storeProducts.productId, productIds),
          eq(storeProducts.inStock, true),
          isNotNull(storeProducts.branchId)
        )
      )
      .orderBy(vendors.name, products.name);

    // Group results by branch and calculate totals
    const branchMap = new Map<string, CartBranchBreakdown>();

    for (const row of results) {
      const quantity = quantityMap.get(row.productId) || 1;
      const price = Number(row.price);

      if (!branchMap.has(row.branchId)) {
        branchMap.set(row.branchId, {
          branchId: row.branchId,
          branchName: row.branchName,
          vendorId: row.vendorId,
          vendorName: row.vendorName,
          vendorSlug: row.vendorSlug,
          branchSlug: row.branchSlug,
          town: row.town,
          vendorLogoUrl: row.vendorLogoUrl,
          vendorWebsiteUrl: row.vendorWebsiteUrl,
          branchWhatsapp: row.branchWhatsapp,
          total: 0,
          itemCount: 0,
          totalItems: totalItemsRequested,
          hasAllItems: false,
          items: [],
        });
      }

      const branch = branchMap.get(row.branchId)!;
      branch.items.push({
        productId: row.productId,
        productName: row.productName,
        productImage: row.productImage,
        price,
        quantity,
        externalUrl: row.externalUrl,
      });
      branch.total += price * quantity;
      branch.itemCount = branch.items.length;
    }

    const branchBreakdowns = Array.from(branchMap.values());

    // Mark which branches have all items
    for (const branch of branchBreakdowns) {
      branch.hasAllItems = branch.itemCount === totalItemsRequested;
    }

    // Separate into full-coverage and partial-coverage branches
    const fullBranches = branchBreakdowns.filter((b) => b.hasAllItems);
    const partialBranches = branchBreakdowns.filter((b) => !b.hasAllItems);

    if (branchBreakdowns.length === 0) {
      return NextResponse.json({
        branches: [],
        cheapestBranchId: null,
        cheapestTotal: 0,
        maxSavings: 0,
      });
    }

    // Round totals
    branchBreakdowns.forEach((b) => {
      b.total = Math.round(b.total * 100) / 100;
    });

    // Sort full branches by total ascending, partial branches by coverage then price
    fullBranches.sort((a, b) => a.total - b.total);
    partialBranches.sort((a, b) => b.itemCount - a.itemCount || a.total - b.total);

    // Combined list: full branches first, then partial
    const sortedBranches = [...fullBranches, ...partialBranches];

    // Only calculate savings among full-coverage branches (apples-to-apples comparison)
    let maxSavings = 0;
    let cheapestBranchId = sortedBranches[0]?.branchId ?? null;
    let cheapestTotal = sortedBranches[0]?.total ?? 0;

    if (fullBranches.length >= 2) {
      const cheapestFull = fullBranches[0];
      const mostExpensiveFull = fullBranches[fullBranches.length - 1];
      maxSavings = Math.round((mostExpensiveFull.total - cheapestFull.total) * 100) / 100;
      cheapestBranchId = cheapestFull.branchId;
      cheapestTotal = cheapestFull.total;
    } else if (fullBranches.length === 1) {
      cheapestBranchId = fullBranches[0].branchId;
      cheapestTotal = fullBranches[0].total;
    }

    const response: CartCalculation = {
      branches: sortedBranches,
      cheapestBranchId,
      cheapestTotal,
      maxSavings,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Cart calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate cart" },
      { status: 500 }
    );
  }
}
