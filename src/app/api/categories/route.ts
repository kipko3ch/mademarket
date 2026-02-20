import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

// GET /api/categories — List all categories
export async function GET() {
  try {
    const list = await db
      .select()
      .from(categories)
      .orderBy(categories.name);

    return NextResponse.json(list);
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST /api/categories — Create category (admin only)
const createCategorySchema = z.object({
  name: z.string().min(1),
  imageUrl: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = createCategorySchema.parse(body);

    const slug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const [category] = await db
      .insert(categories)
      .values({
        name: validated.name,
        slug,
        imageUrl: validated.imageUrl || null,
      })
      .returning();

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Category creation error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
