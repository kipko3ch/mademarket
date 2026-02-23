import { db } from "@/db";
import { heroBanners, vendors, branches, stores, products, storeProducts, categories, featuredProducts, productClicks, bundles, searchLogs } from "@/db/schema";
import { eq, sql, asc, desc, and, gte } from "drizzle-orm";
import { HomeClient } from "@/components/home-client";

// Revalidate every 60 seconds — always fast, always fresh
export const revalidate = 60;

export default async function HomePage() {
  const now = new Date();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Parallel server-side data fetching — all at once, zero waterfall
  const [banners, marqueeBranches, productRows, featuredRows, popularRows, bundleRows] = await Promise.all([
    // 1. Hero banners
    db
      .select()
      .from(heroBanners)
      .where(eq(heroBanners.active, true))
      .orderBy(asc(heroBanners.sortOrder))
      .catch(() => []),

    // 2. Branches for marquee — join branches → vendors
    db
      .select({
        id: branches.id,
        vendorName: vendors.name,
        vendorSlug: vendors.slug,
        vendorLogoUrl: vendors.logoUrl,
        vendorDescription: vendors.description,
        branchName: branches.branchName,
        branchSlug: branches.slug,
        branchTown: branches.town,
        branchRegion: branches.region,
        productCount: sql<number>`count(${storeProducts.id})`.as("product_count"),
      })
      .from(branches)
      .innerJoin(vendors, eq(branches.vendorId, vendors.id))
      .leftJoin(storeProducts, eq(branches.id, storeProducts.branchId))
      .where(
        and(
          eq(vendors.approved, true),
          eq(vendors.active, true),
          eq(branches.approved, true),
          eq(branches.active, true),
          eq(branches.showInMarquee, true)
        )
      )
      .groupBy(branches.id, vendors.name, vendors.slug, vendors.logoUrl, vendors.description, branches.branchName, branches.slug, branches.town, branches.region)
      .orderBy(asc(branches.marqueeOrder))
      .catch(() => []),

    // 3. Products with prices (general listing)
    db
      .select({
        id: products.id,
        name: products.name,
        normalizedName: products.normalizedName,
        imageUrl: products.imageUrl,
        unit: products.unit,
        categoryId: products.categoryId,
        categoryName: categories.name,
        minPrice: sql<number>`min(${storeProducts.price})`.as("min_price"),
        maxPrice: sql<number>`max(${storeProducts.price})`.as("max_price"),
        storeCount: sql<number>`count(distinct ${storeProducts.branchId})`.as("store_count"),
      })
      .from(products)
      .leftJoin(storeProducts, eq(products.id, storeProducts.productId))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .groupBy(products.id, products.name, products.normalizedName, products.imageUrl, products.unit, products.categoryId, categories.name)
      .limit(12)
      .catch(() => []),

    // 4. Featured products (admin-controlled)
    db
      .select({
        id: products.id,
        name: products.name,
        normalizedName: products.normalizedName,
        imageUrl: products.imageUrl,
        unit: products.unit,
        categoryId: products.categoryId,
        categoryName: categories.name,
        minPrice: sql<number>`min(${storeProducts.price})`.as("min_price"),
        maxPrice: sql<number>`max(${storeProducts.price})`.as("max_price"),
        storeCount: sql<number>`count(distinct ${storeProducts.branchId})`.as("store_count"),
        priority: featuredProducts.priority,
      })
      .from(featuredProducts)
      .innerJoin(products, eq(featuredProducts.productId, products.id))
      .leftJoin(storeProducts, eq(products.id, storeProducts.productId))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(featuredProducts.active, true),
          gte(featuredProducts.expiresAt, now)
        )
      )
      .groupBy(products.id, products.name, products.normalizedName, products.imageUrl, products.unit, products.categoryId, categories.name, featuredProducts.priority, featuredProducts.startsAt)
      .orderBy(desc(sql`case when ${featuredProducts.priority} = 'premium' then 1 else 0 end`), asc(featuredProducts.startsAt))
      .limit(8)
      .catch(() => []),

    // 5. Popular products (by click count in last 30 days)
    db
      .select({
        id: products.id,
        name: products.name,
        normalizedName: products.normalizedName,
        imageUrl: products.imageUrl,
        unit: products.unit,
        categoryId: products.categoryId,
        categoryName: categories.name,
        minPrice: sql<number>`min(${storeProducts.price})`.as("min_price"),
        maxPrice: sql<number>`max(${storeProducts.price})`.as("max_price"),
        storeCount: sql<number>`count(distinct ${storeProducts.branchId})`.as("store_count"),
        clickCount: sql<number>`count(${productClicks.id})`.as("click_count"),
      })
      .from(productClicks)
      .innerJoin(products, eq(productClicks.productId, products.id))
      .leftJoin(storeProducts, eq(products.id, storeProducts.productId))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(gte(productClicks.createdAt, thirtyDaysAgo))
      .groupBy(products.id, products.name, products.normalizedName, products.imageUrl, products.unit, products.categoryId, categories.name)
      .orderBy(desc(sql`count(${productClicks.id})`))
      .limit(10)
      .catch(() => []),

    // 6. Active bundles — join branches → vendors instead of stores
    db
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
        vendorName: vendors.name,
        vendorLogoUrl: vendors.logoUrl,
        vendorSlug: vendors.slug,
      })
      .from(bundles)
      .innerJoin(branches, eq(bundles.branchId, branches.id))
      .innerJoin(vendors, eq(branches.vendorId, vendors.id))
      .where(eq(bundles.active, true))
      .orderBy(desc(bundles.createdAt))
      .limit(8)
      .catch(() => []),
  ]);

  // Fallback: if no marquee branches configured, show all approved active branches with products
  let displayBranches = marqueeBranches;
  if (marqueeBranches.length === 0) {
    displayBranches = await db
      .select({
        id: branches.id,
        vendorName: vendors.name,
        vendorSlug: vendors.slug,
        vendorLogoUrl: vendors.logoUrl,
        vendorDescription: vendors.description,
        branchName: branches.branchName,
        branchSlug: branches.slug,
        branchTown: branches.town,
        branchRegion: branches.region,
        productCount: sql<number>`count(${storeProducts.id})`.as("product_count"),
      })
      .from(branches)
      .innerJoin(vendors, eq(branches.vendorId, vendors.id))
      .leftJoin(storeProducts, eq(branches.id, storeProducts.branchId))
      .where(
        and(
          eq(vendors.approved, true),
          eq(vendors.active, true),
          eq(branches.approved, true),
          eq(branches.active, true)
        )
      )
      .groupBy(branches.id, vendors.name, vendors.slug, vendors.logoUrl, vendors.description, branches.branchName, branches.slug, branches.town, branches.region)
      .orderBy(asc(vendors.name))
      .catch(() => []);
  }

  return (
    <HomeClient
      banners={banners}
      stores={displayBranches}
      products={productRows}
      featuredProducts={featuredRows}
      popularProducts={popularRows}
      bundles={bundleRows}
    />
  );
}
