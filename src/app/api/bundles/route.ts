export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { bundles, vendors, branches, bundleProducts, bundleImages, products } from "@/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";

// GET /api/bundles — Return active bundles with vendor/branch info, products, and images
export async function GET() {
  try {
    const rows = await db
      .select({
        id: bundles.id,
        name: bundles.name,
        slug: bundles.slug,
        description: bundles.description,
        imageUrl: bundles.imageUrl,
        price: bundles.price,
        externalUrl: bundles.externalUrl,
        items: bundles.items,
        branchId: bundles.branchId,
        branchName: branches.branchName,
        branchSlug: branches.slug,
        branchTown: branches.town,
        vendorId: vendors.id,
        vendorName: vendors.name,
        vendorSlug: vendors.slug,
        vendorLogoUrl: vendors.logoUrl,
        createdAt: bundles.createdAt,
      })
      .from(bundles)
      .innerJoin(branches, and(
        eq(bundles.branchId, branches.id),
        eq(branches.approved, true),
        eq(branches.active, true)
      ))
      .innerJoin(vendors, and(
        eq(branches.vendorId, vendors.id),
        eq(vendors.approved, true),
        eq(vendors.active, true)
      ))
      .where(and(
        eq(bundles.active, true),
        isNotNull(bundles.branchId)
      ))
      .orderBy(bundles.createdAt);

    // Fetch bundle products and images for all bundles
    const bundleIds = rows.map((r) => r.id);

    let allBundleProducts: { bundleId: string; productId: string; productName: string; productImage: string | null; quantity: number }[] = [];
    let allBundleImages: { bundleId: string; imageUrl: string }[] = [];

    if (bundleIds.length > 0) {
      const [bpRows, biRows] = await Promise.all([
        db
          .select({
            bundleId: bundleProducts.bundleId,
            productId: bundleProducts.productId,
            productName: products.name,
            productImage: products.imageUrl,
            quantity: bundleProducts.quantity,
          })
          .from(bundleProducts)
          .innerJoin(products, eq(bundleProducts.productId, products.id)),
        db
          .select({
            bundleId: bundleImages.bundleId,
            imageUrl: bundleImages.imageUrl,
          })
          .from(bundleImages),
      ]);
      allBundleProducts = bpRows;
      allBundleImages = biRows;
    }

    return NextResponse.json(
      rows.map((r) => ({
        ...r,
        price: Number(r.price),
        bundleProducts: allBundleProducts.filter((bp) => bp.bundleId === r.id),
        bundleImages: allBundleImages.filter((bi) => bi.bundleId === r.id),
      }))
    );
  } catch (error) {
    console.error("Bundles fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bundles" },
      { status: 500 }
    );
  }
}
