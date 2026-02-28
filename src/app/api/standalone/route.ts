import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { standaloneListings, standaloneListingImages, categories } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/standalone — Public active standalone listings
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const featuredParam = searchParams.get("featured");

  const conditions = [eq(standaloneListings.active, true)];
  if (featuredParam === "true") {
    conditions.push(eq(standaloneListings.featured, true));
  }

  try {
    const listings = await db
      .select({
        id: standaloneListings.id,
        title: standaloneListings.title,
        slug: standaloneListings.slug,
        description: standaloneListings.description,
        categoryId: standaloneListings.categoryId,
        categoryName: categories.name,
        price: standaloneListings.price,
        checkoutType: standaloneListings.checkoutType,
        whatsappNumber: standaloneListings.whatsappNumber,
        externalUrl: standaloneListings.externalUrl,
        featured: standaloneListings.featured,
        createdAt: standaloneListings.createdAt,
      })
      .from(standaloneListings)
      .leftJoin(categories, eq(standaloneListings.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(standaloneListings.featured), desc(standaloneListings.createdAt));

    // Fetch first image for each listing
    const listingIds = listings.map((l) => l.id);
    const allImages = listingIds.length > 0
      ? await db
          .select({
            listingId: standaloneListingImages.listingId,
            imageUrl: standaloneListingImages.imageUrl,
            sortOrder: standaloneListingImages.sortOrder,
          })
          .from(standaloneListingImages)
          .orderBy(standaloneListingImages.sortOrder)
      : [];

    const firstImageByListing = new Map<string, string>();
    for (const img of allImages) {
      if (!firstImageByListing.has(img.listingId)) {
        firstImageByListing.set(img.listingId, img.imageUrl);
      }
    }

    const result = listings.map((l) => ({
      ...l,
      imageUrl: firstImageByListing.get(l.id) || null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Standalone listings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}
