import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { standaloneListings, standaloneListingImages, categories } from "@/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/standalone — Public active standalone listings
// Optional query: ?featured=true
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
        categorySlug: categories.slug,
        price: standaloneListings.price,
        checkoutType: standaloneListings.checkoutType,
        whatsappNumber: standaloneListings.whatsappNumber,
        externalUrl: standaloneListings.externalUrl,
        featured: standaloneListings.featured,
        active: standaloneListings.active,
        createdAt: standaloneListings.createdAt,
      })
      .from(standaloneListings)
      .leftJoin(categories, eq(standaloneListings.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(standaloneListings.featured), desc(standaloneListings.createdAt));

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Standalone listings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}
