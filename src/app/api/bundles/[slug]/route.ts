export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bundles, vendors, branches, brochures, bundleProducts, bundleImages, products } from "@/db/schema";
import { eq, and, ne, desc, isNotNull } from "drizzle-orm";

// GET /api/bundles/[slug] — Return single bundle by slug with vendor/branch info and related items
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Fetch the bundle with full vendor/branch info
    const [result] = await db
      .select({
        id: bundles.id,
        branchId: bundles.branchId,
        name: bundles.name,
        slug: bundles.slug,
        description: bundles.description,
        imageUrl: bundles.imageUrl,
        price: bundles.price,
        externalUrl: bundles.externalUrl,
        items: bundles.items,
        active: bundles.active,
        createdAt: bundles.createdAt,
        branchName: branches.branchName,
        branchSlug: branches.slug,
        branchTown: branches.town,
        branchWhatsapp: branches.whatsappNumber,
        vendorId: vendors.id,
        vendorName: vendors.name,
        vendorSlug: vendors.slug,
        vendorLogoUrl: vendors.logoUrl,
        vendorBannerUrl: vendors.bannerUrl,
        vendorWebsiteUrl: vendors.websiteUrl,
      })
      .from(bundles)
      .innerJoin(branches, eq(bundles.branchId, branches.id))
      .innerJoin(vendors, and(
        eq(branches.vendorId, vendors.id),
        eq(vendors.approved, true),
        eq(vendors.active, true)
      ))
      .where(
        and(
          eq(bundles.slug, slug),
          eq(bundles.active, true),
          isNotNull(bundles.branchId)
        )
      )
      .limit(1);

    if (!result) {
      return NextResponse.json(
        { error: "Bundle not found" },
        { status: 404 }
      );
    }

    // Fetch related items with full image/product previews
    const [bundleProductRows, bundleImageRows, relatedBundles, relatedBrochures] = await Promise.all([
      db
        .select({
          productId: bundleProducts.productId,
          productName: products.name,
          productImage: products.imageUrl,
          quantity: bundleProducts.quantity,
        })
        .from(bundleProducts)
        .innerJoin(products, eq(bundleProducts.productId, products.id))
        .where(eq(bundleProducts.bundleId, result.id)),

      db
        .select({
          id: bundleImages.id,
          imageUrl: bundleImages.imageUrl,
        })
        .from(bundleImages)
        .where(eq(bundleImages.bundleId, result.id)),

      db.query.bundles.findMany({
        where: and(
          eq(bundles.branchId, result.branchId!),
          eq(bundles.active, true),
          ne(bundles.id, result.id)
        ),
        with: {
          bundleImages: true,
          bundleProducts: {
            with: {
              product: true
            }
          }
        },
        orderBy: [desc(bundles.createdAt)],
        limit: 4,
      }),

      db
        .select({
          id: brochures.id,
          title: brochures.title,
          slug: brochures.slug,
          thumbnailImageUrl: brochures.thumbnailImageUrl,
          validFrom: brochures.validFrom,
          validUntil: brochures.validUntil,
        })
        .from(brochures)
        .where(
          and(
            eq(brochures.branchId, result.branchId!),
            eq(brochures.status, "published")
          )
        )
        .limit(4),
    ]);

    return NextResponse.json({
      bundle: {
        ...result,
        price: Number(result.price),
        storeName: result.vendorName,
        storeSlug: result.vendorSlug,
        storeLogo: result.vendorLogoUrl,
        storeBanner: result.vendorBannerUrl,
        storeWebsite: result.vendorWebsiteUrl,
        storeWhatsapp: result.branchWhatsapp,
        bundleProducts: bundleProductRows,
        bundleImagesRaw: bundleImageRows,
        // formatted for BundleCard compatibility
        productImages: bundleProductRows.map(p => p.productImage).filter(Boolean),
        bundleImages: bundleImageRows.map(i => i.imageUrl),
      },
      relatedBundles: relatedBundles.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        description: b.description,
        imageUrl: b.imageUrl,
        price: Number(b.price),
        vendorName: result.vendorName,
        vendorSlug: result.vendorSlug,
        vendorLogoUrl: result.vendorLogoUrl,
        bundleImages: b.bundleImages.map(bi => bi.imageUrl),
        productImages: b.bundleProducts.map(bp => bp.product.imageUrl).filter(Boolean) as string[],
      })),
      relatedBrochures,
    });
  } catch (error) {
    console.error("Error fetching bundle:", error);
    return NextResponse.json(
      { error: "Failed to fetch bundle" },
      { status: 500 }
    );
  }
}
