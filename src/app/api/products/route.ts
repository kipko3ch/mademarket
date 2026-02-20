import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, storeProducts, stores, categories, searchLogs, sponsoredListings } from "@/db/schema";
import { eq, ilike, and, gte, lte, sql, desc, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

// GET /api/products — List products with filters, pagination, sponsored results
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(url.get("page") || "1"));
  const pageSize = Math.min(50, parseInt(url.get("pageSize") || "20"));
  const search = url.get("search") || "";
  const category = url.get("category") || "";
  const storeId = url.get("storeId") || "";
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

    // Build conditions
    const conditions = [];
    if (search) {
      conditions.push(ilike(products.normalizedName, `%${search.toLowerCase()}%`));
    }
    if (category) {
      conditions.push(eq(products.categoryId, category));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause);

    const total = Number(countResult.count);

    // Get sponsored products for the current results
    const now = new Date();
    const sponsoredResults = await db
      .select({
        productId: sponsoredListings.productId,
        priorityLevel: sponsoredListings.priorityLevel,
        storeName: stores.name,
        storeId: stores.id,
        price: storeProducts.price,
        productName: products.name,
        productImage: products.imageUrl,
        categoryName: categories.name,
      })
      .from(sponsoredListings)
      .innerJoin(products, eq(sponsoredListings.productId, products.id))
      .innerJoin(stores, eq(sponsoredListings.storeId, stores.id))
      .innerJoin(
        storeProducts,
        and(
          eq(storeProducts.storeId, sponsoredListings.storeId),
          eq(storeProducts.productId, sponsoredListings.productId)
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

    // Build join condition for store_products
    const storeJoinCondition = storeId
      ? and(eq(products.id, storeProducts.productId), eq(storeProducts.storeId, storeId))
      : eq(products.id, storeProducts.productId);

    // Main query: products with min price across stores
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
      storeCount: sql<number>`count(distinct ${storeProducts.storeId})`.as("store_count"),
    };

    const groupByFields = [products.id, products.name, products.normalizedName, products.imageUrl, products.unit, products.categoryId, categories.name] as const;

    const productResults = await db
      .select(selectFields)
      .from(products)
      .leftJoin(storeProducts, storeJoinCondition)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(whereClause)
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

// POST /api/products — Create product (vendor/admin only)
const createProductSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().uuid().optional(),
  imageUrl: z.string().optional(),
  unit: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "vendor" && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = createProductSchema.parse(body);

    const [product] = await db
      .insert(products)
      .values({
        name: validated.name,
        normalizedName: validated.name.toLowerCase().trim(),
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
