export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { featuredProducts, products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  productId: z.string().uuid(),
  priority: z.enum(["premium", "standard"]),
  durationDays: z.number().int().min(1),
});

// GET /api/admin/featured — Return all featured products with product names (admin only)
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await db
      .select({
        id: featuredProducts.id,
        productId: featuredProducts.productId,
        productName: products.name,
        priority: featuredProducts.priority,
        durationDays: featuredProducts.durationDays,
        startsAt: featuredProducts.startsAt,
        expiresAt: featuredProducts.expiresAt,
        active: featuredProducts.active,
        createdAt: featuredProducts.createdAt,
      })
      .from(featuredProducts)
      .innerJoin(products, eq(featuredProducts.productId, products.id))
      .orderBy(desc(featuredProducts.createdAt));

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Admin featured GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured products" },
      { status: 500 }
    );
  }
}

// POST /api/admin/featured — Create a featured product (admin only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { productId, priority, durationDays } = parsed.data;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const [created] = await db
      .insert(featuredProducts)
      .values({
        productId,
        priority,
        durationDays,
        startsAt: now,
        expiresAt,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Admin featured POST error:", error);
    return NextResponse.json(
      { error: "Failed to create featured product" },
      { status: 500 }
    );
  }
}
