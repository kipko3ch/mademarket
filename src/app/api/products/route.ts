import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, storeProducts, vendors, branches, categories, searchLogs, sponsoredListings } from "@/db/schema";
import { eq, ilike, and, gte, lte, sql, desc, asc, or, isNotNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { normalizeProductName, extractProductMeta, slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET /api/products — List products with filters, pagination, sponsored results
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(url.get("page") || "1"));
  const pageSize = Math.min(50, parseInt(url.get("pageSize") || "20"));
  const search = url.get("search") || "";
  const category = url.get("category") || "";
  const vendorId = url.get("vendorId") || "";
  const branchId = url.get("branchId") || "";
  const minPrice = url.get("minPrice") || "";
  const maxPrice = url.get("maxPrice") || "";
  const sortBy = url.get("sortBy") || "name"; // name | price_asc | price_desc
  const offset = (page - 1) * pageSize;

  try {
    // Log search query
    if (search) {
      const session = await auth();
      db.insert(searchLogs)
        .values({ query: search, userId: session?.user?.id || null })
        .execute()
        .catch(() => {}); // fire and forget
    }

    // Build conditions — search with enhanced normalization
    const conditions = [];
    if (search) {
      const normalizedSearch = normalizeProductName(search);
      conditions.push(
        or(
          ilike(products.normalizedName, `%${normalizedSearch}%`),
          ilike(products.name, `%${search}%`),
          ilike(products.brand, `%${search}%`)
        )
      );
    }
    if (category) {
      conditions.push(eq(products.categoryId, category));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count — only products with at least one active seller
    const countConditions = whereClause ? [whereClause] : [];
    const [countResult] = await db
      .select({ count: sql<number>`count(distinct ${products.id})` })
      .from(products)
      .innerJoin(storeProducts, and(
        eq(products.id, storeProducts.productId),
        isNotNull(storeProducts.branchId)
      ))
      .innerJoin(branches, and(
        eq(storeProducts.branchId, branches.id),
        eq(branches.approved, true),
        eq(branches.active, true)
      ))
      .innerJoin(vendors, and(
        eq(branches.vendorId, vendors.id),
        eq(vendors.approved, true),
        eq(vendors.active, true)
      ))
      .where(countConditions.length > 0 ? and(...countConditions) : undefined);

    const total = Number(countResult.count);

    // Get sponsored products for the current results
    const now = new Date();
    const sponsoredResults = await db
      .select({
        productId: sponsoredListings.productId,
        priorityLevel: sponsoredListings.priorityLevel,
        vendorName: vendors.name,
        vendorId: vendors.id,
        vendorSlug: vendors.slug,
        vendorLogoUrl: vendors.logoUrl,
        price: storeProducts.price,
        productName: products.name,
        productImage: products.imageUrl,
        categoryName: categories.name,
      })
      .from(sponsoredListings)
      .innerJoin(products, eq(sponsoredListings.productId, products.id))
      .innerJoin(vendors, and(
        eq(sponsoredListings.vendorId, vendors.id),
        eq(vendors.approved, true),
        eq(vendors.active, true)
      ))
      .innerJoin(branches, and(
        eq(branches.vendorId, vendors.id),
        eq(branches.approved, true),
        eq(branches.active, true)
      ))
      .innerJoin(
        storeProducts,
        and(
          eq(storeProducts.branchId, branches.id),
          eq(storeProducts.productId, sponsoredListings.productId),
          isNotNull(storeProducts.branchId)
        )
      )
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(sponsoredListings.approved, true),
          eq(sponsoredListings.active, true),
          lte(sponsoredListings.startDate, now),
          gte(sponsoredListings.endDate, now)
        )
      )
      .orderBy(desc(sponsoredListings.priorityLevel))
      .limit(3);

    // Build join condition for store_products → branches → vendors
    const branchJoinConditions = [
      eq(products.id, storeProducts.productId),
      isNotNull(storeProducts.branchId),
    ];
    if (branchId) {
      branchJoinConditions.push(eq(storeProducts.branchId, branchId));
    }

    // Main query: products with min price across approved+active branches/vendors only
    const selectFields = {
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
    };

    const groupByFields = [products.id, products.name, products.normalizedName, products.imageUrl, products.unit, products.categoryId, categories.name] as const;

    // Build the full where clause including vendorId filter
    const fullWhereConditions = whereClause ? [whereClause] : [];
    if (vendorId) {
      fullWhereConditions.push(eq(vendors.id, vendorId));
    }
    const fullWhere = fullWhereConditions.length > 0 ? and(...fullWhereConditions) : undefined;

    const productResults = await db
      .select(selectFields)
      .from(products)
      .innerJoin(storeProducts, and(...branchJoinConditions))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(branches, and(
        eq(storeProducts.branchId, branches.id),
        eq(branches.approved, true),
        eq(branches.active, true)
      ))
      .innerJoin(vendors, and(
        eq(branches.vendorId, vendors.id),
        eq(vendors.approved, true),
        eq(vendors.active, true)
      ))
      .where(fullWhere)
      .groupBy(...groupByFields)
      .limit(pageSize)
      .offset(offset);

    // Filter by price range if specified
    let filtered = productResults;
    if (minPrice) {
      filtered = filtered.filter((p) => Number(p.minPrice) >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((p) => Number(p.minPrice) <= Number(maxPrice));
    }

    // Sort
    if (sortBy === "price_asc") {
      filtered.sort((a, b) => Number(a.minPrice) - Number(b.minPrice));
    } else if (sortBy === "price_desc") {
      filtered.sort((a, b) => Number(b.minPrice) - Number(a.minPrice));
    }

    return NextResponse.json({
      data: filtered,
      sponsored: sponsoredResults,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products — Find or create product (vendor/admin only)
// Uses enhanced normalization to match products like "TOPSCORE 10KG" = "Top Score 10 kg" = "topscore 10kg"
// This ensures multiple vendors selling the same item share one product record for price comparison.
const createProductSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().uuid().optional(),
  imageUrl: z.string().optional(),
  unit: z.string().optional(),
  brand: z.string().optional(),
  size: z.string().optional(),
  barcode: z.string().optional(),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "vendor" && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check vendor approval (skip for admins)
  if (session.user.role === "vendor") {
    const [vendor] = await db
      .select({ id: vendors.id, approved: vendors.approved })
      .from(vendors)
      .where(eq(vendors.ownerId, session.user.id))
      .limit(1);

    if (!vendor) {
      return NextResponse.json({ error: "No vendor found" }, { status: 404 });
    }

    if (!vendor.approved) {
      return NextResponse.json(
        { error: "Vendor must be approved before you can perform this action. Contact admin: +264818222368" },
        { status: 403 }
      );
    }
  }

  try {
    const body = await req.json();
    const validated = createProductSchema.parse(body);

    const normalized = normalizeProductName(validated.name);
    const meta = extractProductMeta(validated.name);
    const slug = slugify(validated.name);

    // Multi-strategy matching — try in order of confidence:
    // 1. Exact barcode match (highest confidence)
    // 2. Exact normalized name match
    // 3. Slug match
    let existing = null;

    if (validated.barcode) {
      const [byBarcode] = await db
        .select()
        .from(products)
        .where(eq(products.barcode, validated.barcode))
        .limit(1);
      if (byBarcode) existing = byBarcode;
    }

    if (!existing) {
      // Try exact normalized match, or slug match
      const [byName] = await db
        .select()
        .from(products)
        .where(or(
          eq(products.normalizedName, normalized),
          eq(products.slug, slug)
        ))
        .limit(1);
      if (byName) existing = byName;
    }

    if (existing) {
      // Update missing fields if we have them
      const updates: Record<string, unknown> = {};
      if (!existing.imageUrl && validated.imageUrl) updates.imageUrl = validated.imageUrl;
      if (!existing.categoryId && validated.categoryId) updates.categoryId = validated.categoryId;
      if (!existing.unit && validated.unit) updates.unit = validated.unit;
      if (!existing.brand && (validated.brand || meta.brand)) updates.brand = validated.brand || meta.brand;
      if (!existing.size && (validated.size || meta.size)) updates.size = validated.size || meta.size;
      if (!existing.barcode && validated.barcode) updates.barcode = validated.barcode;
      if (!existing.description && validated.description) updates.description = validated.description;
      if (!existing.slug) updates.slug = slug;

      if (Object.keys(updates).length > 0) {
        const [updated] = await db
          .update(products)
          .set(updates)
          .where(eq(products.id, existing.id))
          .returning();
        return NextResponse.json(updated);
      }

      return NextResponse.json(existing);
    }

    // Create new product if none exists
    const [product] = await db
      .insert(products)
      .values({
        name: validated.name,
        normalizedName: normalized,
        slug,
        brand: validated.brand || meta.brand || null,
        size: validated.size || meta.size || null,
        barcode: validated.barcode || null,
        description: validated.description || null,
        categoryId: validated.categoryId || null,
        imageUrl: validated.imageUrl || null,
        unit: validated.unit || null,
      })
      .returning();

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Product creation error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
