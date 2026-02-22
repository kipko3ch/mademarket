export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bundles, stores } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const createBundleSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  price: z.number().positive(),
  externalUrl: z.string().url().optional(),
  items: z.string().optional(),
});

// GET /api/dashboard/bundles — Vendor's bundles
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "vendor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.ownerId, session.user.id))
      .limit(1);

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    const rows = await db
      .select({
        id: bundles.id,
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
      .where(eq(bundles.storeId, store.id))
      .orderBy(desc(bundles.createdAt));

    return NextResponse.json(
      rows.map((r) => ({
        ...r,
        price: Number(r.price),
      }))
    );
  } catch (error) {
    console.error("Dashboard bundles GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bundles" },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/bundles — Vendor create bundle
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "vendor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.ownerId, session.user.id))
      .limit(1);

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    // CRITICAL: Check store is approved before allowing POST
    if (!store.approved) {
      return NextResponse.json(
        {
          error:
            "Store must be approved before you can perform this action. Contact admin: +264818222368",
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

    const { name, description, imageUrl, price, externalUrl, items } =
      parsed.data;

    // Auto-generate slug from name
    const baseSlug = slugify(name);
    let slug = baseSlug;

    // Check if slug exists; if so, append random suffix
    const [existingSlug] = await db
      .select({ id: bundles.id })
      .from(bundles)
      .where(eq(bundles.slug, slug))
      .limit(1);

    if (existingSlug) {
      const suffix = Math.random().toString(36).substring(2, 8);
      slug = `${baseSlug}-${suffix}`;
    }

    const [created] = await db
      .insert(bundles)
      .values({
        storeId: store.id,
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        price: price.toFixed(2),
        externalUrl: externalUrl || null,
        items: items || null,
      })
      .returning();

    return NextResponse.json(
      { ...created, price: Number(created.price) },
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
