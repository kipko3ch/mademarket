import { NextResponse } from "next/server";
import { db } from "@/db";
import { standaloneListings, standaloneListingImages, categories } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/standalone/[slug] — Public single standalone listing by slug with images
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const [listing] = await db
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
      .where(
        and(
          eq(standaloneListings.slug, slug),
          eq(standaloneListings.active, true)
        )
      )
      .limit(1);

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const images = await db
      .select({
        id: standaloneListingImages.id,
        imageUrl: standaloneListingImages.imageUrl,
        sortOrder: standaloneListingImages.sortOrder,
      })
      .from(standaloneListingImages)
      .where(eq(standaloneListingImages.listingId, listing.id))
      .orderBy(asc(standaloneListingImages.sortOrder));

    return NextResponse.json({ ...listing, images });
  } catch (error) {
    console.error("Standalone listing by slug error:", error);
    return NextResponse.json({ error: "Failed to fetch listing" }, { status: 500 });
  }
}
