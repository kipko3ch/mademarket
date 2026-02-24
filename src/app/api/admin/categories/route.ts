import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq, count, asc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/categories — List all categories with product count
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        imageUrl: categories.imageUrl,
        sortOrder: categories.sortOrder,
        active: categories.active,
        createdAt: categories.createdAt,
        productCount: count(products.id),
      })
      .from(categories)
      .leftJoin(products, eq(products.categoryId, categories.id))
      .groupBy(categories.id)
      .orderBy(asc(categories.sortOrder), asc(categories.name));

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Admin categories GET error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST /api/admin/categories — Create a new category
export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    name?: string;
    slug?: string;
    imageUrl?: string;
    sortOrder?: number;
    active?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }

  const name = body.name.trim();
  const slug =
    body.slug?.trim() ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  // Check for uniqueness
  const [existing] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(sql`${categories.slug} = ${slug} OR ${categories.name} = ${name}`)
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: "A category with this name or slug already exists" },
      { status: 409 }
    );
  }

  try {
    const [created] = await db
      .insert(categories)
      .values({
        name,
        slug,
        imageUrl: body.imageUrl ?? null,
        sortOrder: body.sortOrder ?? 0,
        active: body.active ?? true,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Admin categories POST error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
