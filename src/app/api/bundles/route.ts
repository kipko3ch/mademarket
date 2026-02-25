export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bundles, vendors, branches, bundleProducts, bundleImages, products } from "@/db/schema";
import { eq, and, isNotNull, sql } from "drizzle-orm";

// GET /api/bundles — Return active bundles with vendor/branch info, products, and images
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");

    const whereConditions = [
      eq(bundles.active, true),
      isNotNull(bundles.branchId)
    ];

    if (vendorId) {
      whereConditions.push(eq(vendors.id, vendorId));
    }

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
      .where(and(...whereConditions))
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
          .innerJoin(products, eq(bundleProducts.productId, products.id))
          .where(sql`${bundleProducts.bundleId} IN (${sql.join(bundleIds.map(id => sql`${id}`), sql`, `)})`),
        db
          .select({
            bundleId: bundleImages.bundleId,
            imageUrl: bundleImages.imageUrl,
          })
          .from(bundleImages)
          .where(sql`${bundleImages.bundleId} IN (${sql.join(bundleIds.map(id => sql`${id}`), sql`, `)})`),
      ]);
      allBundleProducts = bpRows;
      allBundleImages = biRows;
    }

    return NextResponse.json(
      rows.map((r) => {
        const bImages = allBundleImages.filter((bi) => bi.bundleId === r.id).map(bi => bi.imageUrl);
        const pImages = allBundleProducts.filter((bp) => bp.bundleId === r.id).map(bp => bp.productImage).filter(Boolean) as string[];

        return {
          ...r,
          price: Number(r.price),
          bundleImages: bImages,
          productImages: pImages,
          bundleProducts: allBundleProducts.filter((bp) => bp.bundleId === r.id),
        }
      })
    );
  } catch (error) {
    console.error("Bundles fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bundles" },
      { status: 500 }
    );
  }
}
