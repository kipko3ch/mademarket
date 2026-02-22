import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  stores,
  vendors,
  branches,
  storeProducts,
  bundles,
  brochures,
  sponsoredListings,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

// POST /api/admin/migrate-to-branches — Migrate stores → vendors + branches
export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all existing stores
    const allStores = await db.select().from(stores);

    if (allStores.length === 0) {
      return NextResponse.json({
        message: "No stores to migrate",
        migrated: 0,
      });
    }

    const results: {
      storeId: string;
      storeName: string;
      vendorId: string;
      branchId: string;
    }[] = [];

    for (const store of allStores) {
      // 1. Create vendor from store brand-level data
      const branchSlug = slugify(store.city || store.name || "main");

      const [vendor] = await db
        .insert(vendors)
        .values({
          ownerId: store.ownerId,
          name: store.name,
          slug: store.slug,
          description: store.description,
          logoUrl: store.logoUrl,
          bannerUrl: store.bannerUrl,
          websiteUrl: store.websiteUrl,
          approved: store.approved,
          active: !store.suspended,
        })
        .onConflictDoNothing()
        .returning();

      if (!vendor) {
        // Slug conflict — vendor with this slug already exists (duplicate store name)
        // Skip this store
        continue;
      }

      // 2. Create branch from store location-level data
      const [branch] = await db
        .insert(branches)
        .values({
          vendorId: vendor.id,
          branchName: store.city || store.name,
          slug: branchSlug,
          town: store.city,
          region: store.region,
          address: store.address,
          latitude: store.latitude,
          longitude: store.longitude,
          whatsappNumber: store.whatsappNumber,
          approved: store.approved,
          active: !store.suspended,
          showInMarquee: store.showInMarquee,
          marqueeOrder: store.marqueeOrder,
        })
        .returning();

      // 3. Update storeProducts: SET branchId = new branch id WHERE storeId = old store id
      await db
        .update(storeProducts)
        .set({ branchId: branch.id })
        .where(eq(storeProducts.storeId, store.id));

      // 4. Update bundles: SET branchId = new branch id WHERE storeId = old store id
      await db
        .update(bundles)
        .set({ branchId: branch.id })
        .where(eq(bundles.storeId, store.id));

      // 5. Update brochures: SET branchId = new branch id WHERE storeId = old store id
      await db
        .update(brochures)
        .set({ branchId: branch.id })
        .where(eq(brochures.storeId, store.id));

      // 6. Update sponsoredListings: SET vendorId = new vendor id WHERE storeId = old store id
      await db
        .update(sponsoredListings)
        .set({ vendorId: vendor.id })
        .where(eq(sponsoredListings.storeId, store.id));

      results.push({
        storeId: store.id,
        storeName: store.name,
        vendorId: vendor.id,
        branchId: branch.id,
      });
    }

    return NextResponse.json({
      message: `Successfully migrated ${results.length} stores to vendors + branches`,
      migrated: results.length,
      results,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed", details: String(error) },
      { status: 500 }
    );
  }
}
