export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  users,
  stores,
  products,
  storeProducts,
  categories,
  searchLogs,
  sponsoredListings,
  heroBanners,
  featuredProducts,
  bundles,
  productClicks,
} from "@/db/schema";
import { count, eq, sql, gte, and } from "drizzle-orm";

export async function GET() {
  // ── Auth check ──────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let overallStatus: "healthy" | "degraded" = "healthy";

  // ── 1. Database status ────────────────────────────────────────────────────
  let database: Record<string, unknown> = {};
  try {
    const start = Date.now();
    await db.execute(sql`SELECT 1`);
    const latencyMs = Date.now() - start;
    database = {
      connected: true,
      latencyMs,
    };
  } catch (error) {
    overallStatus = "degraded";
    database = {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // ── 2. R2 Storage status ──────────────────────────────────────────────────
  let r2Storage: Record<string, unknown> = {};
  try {
    const r2Vars = {
      R2_ACCOUNT_ID: !!process.env.R2_ACCOUNT_ID,
      R2_ACCESS_KEY_ID: !!process.env.R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY: !!process.env.R2_SECRET_ACCESS_KEY,
      R2_BUCKET_NAME: !!process.env.R2_BUCKET_NAME,
    };
    const allConfigured = Object.values(r2Vars).every(Boolean);
    r2Storage = {
      configured: allConfigured,
      envVars: r2Vars,
      publicUrlConfigured: !!process.env.R2_PUBLIC_URL,
    };
  } catch (error) {
    r2Storage = {
      configured: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // ── 3. User stats ────────────────────────────────────────────────────────
  let userStats: Record<string, unknown> = {};
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalResult] = await db.select({ value: count() }).from(users);
    const [adminResult] = await db
      .select({ value: count() })
      .from(users)
      .where(eq(users.role, "admin"));
    const [vendorResult] = await db
      .select({ value: count() })
      .from(users)
      .where(eq(users.role, "vendor"));
    const [regularResult] = await db
      .select({ value: count() })
      .from(users)
      .where(eq(users.role, "user"));
    const [newUsersResult] = await db
      .select({ value: count() })
      .from(users)
      .where(gte(users.createdAt, sevenDaysAgo));

    userStats = {
      total: totalResult.value,
      admins: adminResult.value,
      vendors: vendorResult.value,
      regularUsers: regularResult.value,
      newUsersLast7Days: newUsersResult.value,
    };
  } catch (error) {
    userStats = {
      error: error instanceof Error ? error.message : "Failed to fetch user stats",
    };
  }

  // ── 4. Store stats ───────────────────────────────────────────────────────
  let storeStats: Record<string, unknown> = {};
  try {
    const [totalResult] = await db.select({ value: count() }).from(stores);
    const [approvedResult] = await db
      .select({ value: count() })
      .from(stores)
      .where(eq(stores.approved, true));
    const [pendingResult] = await db
      .select({ value: count() })
      .from(stores)
      .where(eq(stores.approved, false));
    const [withBannersResult] = await db
      .select({ value: count() })
      .from(stores)
      .where(sql`${stores.bannerUrl} IS NOT NULL`);
    const [marqueeResult] = await db
      .select({ value: count() })
      .from(stores)
      .where(eq(stores.showInMarquee, true));

    storeStats = {
      total: totalResult.value,
      approved: approvedResult.value,
      pending: pendingResult.value,
      withBanners: withBannersResult.value,
      inMarquee: marqueeResult.value,
    };
  } catch (error) {
    storeStats = {
      error: error instanceof Error ? error.message : "Failed to fetch store stats",
    };
  }

  // ── 5. Product stats ─────────────────────────────────────────────────────
  let productStats: Record<string, unknown> = {};
  try {
    const [totalResult] = await db.select({ value: count() }).from(products);
    const [withImagesResult] = await db
      .select({ value: count() })
      .from(products)
      .where(sql`${products.imageUrl} IS NOT NULL`);
    const [storeProductsTotal] = await db
      .select({ value: count() })
      .from(storeProducts);
    const [outOfStockResult] = await db
      .select({ value: count() })
      .from(storeProducts)
      .where(eq(storeProducts.inStock, false));

    productStats = {
      totalProducts: totalResult.value,
      productsWithImages: withImagesResult.value,
      totalStoreProductEntries: storeProductsTotal.value,
      outOfStock: outOfStockResult.value,
    };
  } catch (error) {
    productStats = {
      error: error instanceof Error ? error.message : "Failed to fetch product stats",
    };
  }

  // ── 6. Content stats ─────────────────────────────────────────────────────
  let contentStats: Record<string, unknown> = {};
  try {
    const [activeBannersResult] = await db
      .select({ value: count() })
      .from(heroBanners)
      .where(eq(heroBanners.active, true));
    const [categoriesResult] = await db
      .select({ value: count() })
      .from(categories);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [searchLogsTodayResult] = await db
      .select({ value: count() })
      .from(searchLogs)
      .where(gte(searchLogs.createdAt, todayStart));

    const [sponsoredActiveResult] = await db
      .select({ value: count() })
      .from(sponsoredListings)
      .where(
        and(
          eq(sponsoredListings.active, true),
          eq(sponsoredListings.approved, true)
        )
      );

    contentStats = {
      activeBanners: activeBannersResult.value,
      totalCategories: categoriesResult.value,
      searchLogsToday: searchLogsTodayResult.value,
      activeSponsoredListings: sponsoredActiveResult.value,
    };
  } catch (error) {
    contentStats = {
      error: error instanceof Error ? error.message : "Failed to fetch content stats",
    };
  }

  // Featured products (may not exist as a table in the database)
  try {
    const [featuredActiveResult] = await db
      .select({ value: count() })
      .from(featuredProducts)
      .where(eq(featuredProducts.active, true));
    contentStats.activeFeaturedProducts = featuredActiveResult.value;
  } catch {
    contentStats.activeFeaturedProducts = null;
    contentStats.featuredProductsNote = "Table may not exist";
  }

  // Bundles (may not exist as a table in the database)
  try {
    const [bundlesActiveResult] = await db
      .select({ value: count() })
      .from(bundles)
      .where(eq(bundles.active, true));
    contentStats.activeBundles = bundlesActiveResult.value;
  } catch {
    contentStats.activeBundles = null;
    contentStats.bundlesNote = "Table may not exist";
  }

  // Product clicks total (may not exist as a table in the database)
  try {
    const [clicksResult] = await db
      .select({ value: count() })
      .from(productClicks);
    contentStats.totalProductClicks = clicksResult.value;
  } catch {
    contentStats.totalProductClicks = null;
    contentStats.productClicksNote = "Table may not exist";
  }

  // ── 7. System info ───────────────────────────────────────────────────────
  let systemInfo: Record<string, unknown> = {};
  try {
    systemInfo = {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || "unknown",
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    systemInfo = {
      error: error instanceof Error ? error.message : "Failed to fetch system info",
    };
  }

  return NextResponse.json({
    status: overallStatus,
    database,
    r2Storage,
    userStats,
    storeStats,
    productStats,
    contentStats,
    systemInfo,
  });
}
