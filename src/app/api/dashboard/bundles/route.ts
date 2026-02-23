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
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { slugify } from "@/lib/utils";

function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

const createBundleSchema = z.object({
  branchId: z.string().uuid("branchId must be a valid UUID"),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  externalUrl: z.string().optional(),
  items: z.string().optional(), // legacy field
  products: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive().default(1),
      })
    )
    .optional()
    .default([]),
  images: z.array(z.string().url()).optional(),
});

// GET /api/dashboard/bundles — Vendor's bundles, optionally filtered by branchId
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "vendor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [vendor] = await db
      .select({ id: vendors.id })
      .from(vendors)
      .where(eq(vendors.ownerId, session.user.id))
      .limit(1);

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Get branchId from query params (optional filter)
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId");

    // If branchId is provided, verify it belongs to this vendor
    if (branchId) {
      const [branch] = await db
        .select({ id: branches.id })
        .from(branches)
        .where(and(eq(branches.id, branchId), eq(branches.vendorId, vendor.id)))
        .limit(1);

      if (!branch) {
        return NextResponse.json(
          { error: "Branch not found or not owned by you" },
          { status: 404 }
        );
      }
    }

    // Get all vendor branch IDs for filtering
    const vendorBranches = await db
      .select({ id: branches.id })
      .from(branches)
      .where(eq(branches.vendorId, vendor.id));

    const vendorBranchIds = vendorBranches.map((b) => b.id);

    if (vendorBranchIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch bundles — filter by specific branch or all vendor branches
    const targetBranchIds = branchId ? [branchId] : vendorBranchIds;

    const allBundles = [];
    for (const bid of targetBranchIds) {
      const rows = await db
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
        })
        .from(bundles)
        .where(eq(bundles.branchId, bid))
        .orderBy(desc(bundles.createdAt));

      allBundles.push(...rows);
    }

    // For each bundle, fetch bundleProducts and bundleImages
    const result = await Promise.all(
      allBundles.map(async (bundle) => {
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
          .where(eq(bundleProducts.bundleId, bundle.id));

        const bImages = await db
          .select({
            id: bundleImages.id,
            imageUrl: bundleImages.imageUrl,
          })
          .from(bundleImages)
          .where(eq(bundleImages.bundleId, bundle.id));

        return {
          ...bundle,
          price: Number(bundle.price),
          bundleProducts: bProducts,
          bundleImages: bImages,
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Dashboard bundles GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bundles" },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/bundles — Create bundle with branchId, bundleProducts, and optional bundleImages
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "vendor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [vendor] = await db
      .select({ id: vendors.id, approved: vendors.approved })
      .from(vendors)
      .where(eq(vendors.ownerId, session.user.id))
      .limit(1);

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    if (!vendor.approved) {
      return NextResponse.json(
        {
          error:
            "Vendor must be approved before you can perform this action. Contact admin: +264818222368",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createBundleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { branchId, name, description, price, externalUrl, items, images } =
      parsed.data;
    const bundleProductsList = parsed.data.products;

    // Verify branch belongs to this vendor
    const [branch] = await db
      .select({ id: branches.id })
      .from(branches)
      .where(and(eq(branches.id, branchId), eq(branches.vendorId, vendor.id)))
      .limit(1);

    if (!branch) {
      return NextResponse.json(
        { error: "Branch not found or not owned by you" },
        { status: 404 }
      );
    }

    // Auto-generate slug from name
    const baseSlug = slugify(name);
    let slug = baseSlug;

    const [existingSlug] = await db
      .select({ id: bundles.id })
      .from(bundles)
      .where(eq(bundles.slug, slug))
      .limit(1);

    if (existingSlug) {
      const suffix = Math.random().toString(36).substring(2, 8);
      slug = `${baseSlug}-${suffix}`;
    }

    // Create the bundle
    const [created] = await db
      .insert(bundles)
      .values({
        branchId,
        name,
        slug,
        description: description || null,
        price: price.toFixed(2),
        externalUrl: normalizeUrl(externalUrl),
        items: items || null,
      })
      .returning();

    // Create bundleProducts entries
    for (const bp of bundleProductsList) {
      await db.insert(bundleProducts).values({
        bundleId: created.id,
        productId: bp.productId,
        quantity: bp.quantity,
      });
    }

    // Create bundleImages entries (optional)
    if (images && images.length > 0) {
      for (const imgUrl of images) {
        await db.insert(bundleImages).values({
          bundleId: created.id,
          imageUrl: imgUrl,
        });
      }
    }

    // Fetch the created bundle with its products and images
    const bProducts = await db
      .select({
        productId: bundleProducts.productId,
        quantity: bundleProducts.quantity,
        productName: products.name,
      })
      .from(bundleProducts)
      .leftJoin(products, eq(products.id, bundleProducts.productId))
      .where(eq(bundleProducts.bundleId, created.id));

    const bImages = await db
      .select({
        id: bundleImages.id,
        imageUrl: bundleImages.imageUrl,
      })
      .from(bundleImages)
      .where(eq(bundleImages.bundleId, created.id));

    return NextResponse.json(
      {
        ...created,
        price: Number(created.price),
        bundleProducts: bProducts,
        bundleImages: bImages,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Dashboard bundles POST error:", error);
    return NextResponse.json(
      { error: "Failed to create bundle" },
      { status: 500 }
    );
  }
}
