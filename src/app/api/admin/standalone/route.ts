import { NextResponse } from "next/server";
import { db } from "@/db";
import { standaloneListings, standaloneListingImages, categories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// GET /api/admin/standalone — All standalone listings (admin)
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        active: standaloneListings.active,
        createdAt: standaloneListings.createdAt,
      })
      .from(standaloneListings)
      .leftJoin(categories, eq(standaloneListings.categoryId, categories.id))
      .orderBy(desc(standaloneListings.createdAt));

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Admin standalone GET error:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}

// POST /api/admin/standalone — Create standalone listing
export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    title?: string;
    slug?: string;
    description?: string;
    categoryId?: string;
    price?: string | number;
    checkoutType?: "whatsapp" | "external_url";
    whatsappNumber?: string;
    externalUrl?: string;
    featured?: boolean;
    active?: boolean;
    images?: { imageUrl: string; sortOrder?: number }[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "Listing title is required" }, { status: 400 });
  }

  if (!body.checkoutType || !["whatsapp", "external_url"].includes(body.checkoutType)) {
    return NextResponse.json(
      { error: "checkoutType must be 'whatsapp' or 'external_url'" },
      { status: 400 }
    );
  }

  if (body.checkoutType === "whatsapp" && !body.whatsappNumber) {
    return NextResponse.json(
      { error: "whatsappNumber is required when checkoutType is 'whatsapp'" },
      { status: 400 }
    );
  }

  if (body.checkoutType === "external_url" && !body.externalUrl) {
    return NextResponse.json(
      { error: "externalUrl is required when checkoutType is 'external_url'" },
      { status: 400 }
    );
  }

  const title = body.title.trim();
  const slug = body.slug?.trim() || slugify(title);

  try {
    const [created] = await db
      .insert(standaloneListings)
      .values({
        title,
        slug,
        description: body.description ?? null,
        categoryId: body.categoryId ?? null,
        price: body.price != null ? String(body.price) : null,
        checkoutType: body.checkoutType,
        whatsappNumber: body.whatsappNumber ?? null,
        externalUrl: body.externalUrl ?? null,
        featured: body.featured ?? false,
        active: body.active ?? true,
      })
      .returning();

    // Insert images if provided
    if (Array.isArray(body.images) && body.images.length > 0) {
      const imageValues = body.images.map((img, index) => ({
        listingId: created.id,
        imageUrl: img.imageUrl,
        sortOrder: img.sortOrder ?? index,
      }));
      await db.insert(standaloneListingImages).values(imageValues);
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    console.error("Admin standalone POST error:", error);
    if (
      error instanceof Error &&
      error.message.includes("duplicate key")
    ) {
      return NextResponse.json(
        { error: "A listing with this slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
