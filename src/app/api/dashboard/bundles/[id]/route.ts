export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  vendors,
  branches,
  bundles,
  bundleProducts,
  bundleImages,
  products,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

const patchBundleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  price: z.number().positive().optional(),
  externalUrl: z.string().optional().nullable(),
  items: z.string().optional().nullable(),
  active: z.boolean().optional(),
  products: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive().default(1),
      })
    )
    .min(1, "At least one product is required")
    .optional(),
  images: z.array(z.string().url()).optional(),
});

/** Helper: find vendor for current user, and verify bundle ownership via branch */
async function getVendorAndVerifyBundle(
  userId: string,
  bundleId: string
) {
  const [vendor] = await db
    .select({ id: vendors.id })
    .from(vendors)
    .where(eq(vendors.ownerId, userId))
    .limit(1);

  if (!vendor) return { vendor: null, bundle: null };

  // Get all branch IDs for this vendor
  const vendorBranches = await db
    .select({ id: branches.id })
    .from(branches)
    .where(eq(branches.vendorId, vendor.id));

  const vendorBranchIds = vendorBranches.map((b) => b.id);

  if (vendorBranchIds.length === 0) return { vendor, bundle: null };

  // Find the bundle and verify it belongs to one of vendor's branches
  const [bundle] = await db
    .select()
    .from(bundles)
    .where(eq(bundles.id, bundleId))
    .limit(1);

  if (!bundle || !bundle.branchId || !vendorBranchIds.includes(bundle.branchId)) {
    return { vendor, bundle: null };
  }

  return { vendor, bundle };
}

// GET /api/dashboard/bundles/[id] — Return bundle with bundleProducts and bundleImages
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user || session.user.role !== "vendor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { vendor, bundle } = await getVendorAndVerifyBundle(
      session.user.id,
      id
    );

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    if (!bundle) {
      return NextResponse.json(
        { error: "Bundle not found or not owned by you" },
        { status: 404 }
      );
    }

    // Fetch bundle products with product details
    const bProducts = await db
      .select({
        productId: bundleProducts.productId,
        quantity: bundleProducts.quantity,
        productName: products.name,
        productSlug: products.slug,
        productImageUrl: products.imageUrl,
        productBrand: products.brand,
        productSize: products.size,
      })
      .from(bundleProducts)
      .leftJoin(products, eq(products.id, bundleProducts.productId))
      .where(eq(bundleProducts.bundleId, bundle.id));

    // Fetch bundle images
    const bImages = await db
      .select({
        id: bundleImages.id,
        imageUrl: bundleImages.imageUrl,
      })
      .from(bundleImages)
      .where(eq(bundleImages.bundleId, bundle.id));

    return NextResponse.json({
      ...bundle,
      price: Number(bundle.price),
      bundleProducts: bProducts,
      bundleImages: bImages,
    });
  } catch (error) {
    console.error("Dashboard bundle GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bundle" },
      { status: 500 }
    );
  }
}

// PATCH /api/dashboard/bundles/[id] — Update bundle, can update bundleProducts and bundleImages
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user || session.user.role !== "vendor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { vendor, bundle } = await getVendorAndVerifyBundle(
      session.user.id,
      id
    );

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    if (!bundle) {
      return NextResponse.json(
        { error: "Bundle not found or not owned by you" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = patchBundleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Build bundle field updates
    const updates: Record<string, unknown> = {};

    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.description !== undefined)
      updates.description = parsed.data.description;
    if (parsed.data.imageUrl !== undefined)
      updates.imageUrl = parsed.data.imageUrl;
    if (parsed.data.price !== undefined)
      updates.price = parsed.data.price.toFixed(2);
    if (parsed.data.externalUrl !== undefined)
      updates.externalUrl = normalizeUrl(parsed.data.externalUrl);
    if (parsed.data.items !== undefined) updates.items = parsed.data.items;
    if (parsed.data.active !== undefined) updates.active = parsed.data.active;

    // Update bundle fields if any
    if (Object.keys(updates).length > 0) {
      await db
        .update(bundles)
        .set(updates)
        .where(eq(bundles.id, id));
    }

    // Update bundleProducts if provided — replace all
    if (parsed.data.products !== undefined) {
      // Delete existing bundleProducts
      await db
        .delete(bundleProducts)
        .where(eq(bundleProducts.bundleId, id));

      // Insert new ones
      for (const bp of parsed.data.products) {
        await db.insert(bundleProducts).values({
          bundleId: id,
          productId: bp.productId,
          quantity: bp.quantity,
        });
      }
    }

    // Update bundleImages if provided — replace all
    if (parsed.data.images !== undefined) {
      // Delete existing bundleImages
      await db
        .delete(bundleImages)
        .where(eq(bundleImages.bundleId, id));

      // Insert new ones
      for (const imgUrl of parsed.data.images) {
        await db.insert(bundleImages).values({
          bundleId: id,
          imageUrl: imgUrl,
        });
      }
    }

    // Fetch updated bundle
    const [updatedBundle] = await db
      .select()
      .from(bundles)
      .where(eq(bundles.id, id))
      .limit(1);

    const bProducts = await db
      .select({
        productId: bundleProducts.productId,
        quantity: bundleProducts.quantity,
        productName: products.name,
        productSlug: products.slug,
        productImageUrl: products.imageUrl,
      })
      .from(bundleProducts)
      .leftJoin(products, eq(products.id, bundleProducts.productId))
      .where(eq(bundleProducts.bundleId, id));

    const bImages = await db
      .select({
        id: bundleImages.id,
        imageUrl: bundleImages.imageUrl,
      })
      .from(bundleImages)
      .where(eq(bundleImages.bundleId, id));

    return NextResponse.json({
      ...updatedBundle,
      price: Number(updatedBundle.price),
      bundleProducts: bProducts,
      bundleImages: bImages,
    });
  } catch (error) {
    console.error("Dashboard bundle PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update bundle" },
      { status: 500 }
    );
  }
}

// DELETE /api/dashboard/bundles/[id] — Delete bundle (cascades to bundleProducts and bundleImages)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user || session.user.role !== "vendor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { vendor, bundle } = await getVendorAndVerifyBundle(
      session.user.id,
      id
    );

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    if (!bundle) {
      return NextResponse.json(
        { error: "Bundle not found or not owned by you" },
        { status: 404 }
      );
    }

    // Delete bundle — bundleProducts and bundleImages cascade via FK onDelete
    await db.delete(bundles).where(eq(bundles.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Dashboard bundle DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete bundle" },
      { status: 500 }
    );
  }
}
