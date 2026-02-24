import { NextResponse } from "next/server";
import { db } from "@/db";
import { standaloneListings, standaloneListingImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// PATCH /api/admin/standalone/[id] — Update standalone listing
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: {
    title?: string;
    slug?: string;
    description?: string;
    categoryId?: string | null;
    price?: string | number | null;
    checkoutType?: "whatsapp" | "external_url";
    whatsappNumber?: string | null;
    externalUrl?: string | null;
    featured?: boolean;
    active?: boolean;
    images?: { imageUrl: string; sortOrder?: number }[];
    replaceImages?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const [existing] = await db
    .select({ id: standaloneListings.id })
    .from(standaloneListings)
    .where(eq(standaloneListings.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const updates: Partial<{
    title: string;
    slug: string;
    description: string | null;
    categoryId: string | null;
    price: string | null;
    checkoutType: "whatsapp" | "external_url";
    whatsappNumber: string | null;
    externalUrl: string | null;
    featured: boolean;
    active: boolean;
  }> = {};

  if (body.title !== undefined) {
    updates.title = body.title.trim();
    // Auto-update slug if title changes and no explicit slug given
    if (!body.slug) {
      updates.slug = slugify(body.title.trim());
    }
  }
  if (body.slug !== undefined) updates.slug = body.slug.trim();
  if (body.description !== undefined) updates.description = body.description;
  if (body.categoryId !== undefined) updates.categoryId = body.categoryId;
  if (body.price !== undefined) updates.price = body.price != null ? String(body.price) : null;
  if (body.checkoutType !== undefined) updates.checkoutType = body.checkoutType;
  if (body.whatsappNumber !== undefined) updates.whatsappNumber = body.whatsappNumber;
  if (body.externalUrl !== undefined) updates.externalUrl = body.externalUrl;
  if (body.featured !== undefined) updates.featured = body.featured;
  if (body.active !== undefined) updates.active = body.active;

  try {
    let updated = existing;

    if (Object.keys(updates).length > 0) {
      const [result] = await db
        .update(standaloneListings)
        .set(updates)
        .where(eq(standaloneListings.id, id))
        .returning();
      updated = result;
    }

    // Handle image replacement if provided
    if (Array.isArray(body.images)) {
      if (body.replaceImages !== false) {
        // Default: replace all images
        await db
          .delete(standaloneListingImages)
          .where(eq(standaloneListingImages.listingId, id));
      }

      if (body.images.length > 0) {
        const imageValues = body.images.map((img, index) => ({
          listingId: id,
          imageUrl: img.imageUrl,
          sortOrder: img.sortOrder ?? index,
        }));
        await db.insert(standaloneListingImages).values(imageValues);
      }
    }

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("Admin standalone PATCH error:", error);
    if (
      error instanceof Error &&
      error.message.includes("duplicate key")
    ) {
      return NextResponse.json(
        { error: "A listing with this slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

// DELETE /api/admin/standalone/[id] — Delete standalone listing (images cascade via FK)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [existing] = await db
    .select({ id: standaloneListings.id })
    .from(standaloneListings)
    .where(eq(standaloneListings.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  try {
    await db.delete(standaloneListings).where(eq(standaloneListings.id, id));
    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Admin standalone DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}
