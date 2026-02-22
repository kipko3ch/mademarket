export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { brochures, stores } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const createBrochureSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  bannerImageUrl: z.string().optional(),
  thumbnailImageUrl: z.string().optional(),
  status: z.enum(["draft", "published"]).optional().default("draft"),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
});

// GET /api/dashboard/brochures — Return vendor's own brochures
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role: vendor or admin
    if (session.user.role !== "vendor" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find vendor's store
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.ownerId, session.user.id))
      .limit(1);

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const results = await db
      .select()
      .from(brochures)
      .where(eq(brochures.storeId, store.id))
      .orderBy(desc(brochures.createdAt));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching vendor brochures:", error);
    return NextResponse.json(
      { error: "Failed to fetch brochures" },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/brochures — Create new brochure
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role: vendor or admin
    if (session.user.role !== "vendor" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find vendor's store
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.ownerId, session.user.id))
      .limit(1);

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // CRITICAL: Check store is approved before allowing POST
    if (!store.approved) {
      return NextResponse.json(
        {
          error:
            "Store must be approved before publishing brochures. Contact admin: +264818222368",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createBrochureSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      bannerImageUrl,
      thumbnailImageUrl,
      status,
      validFrom,
      validUntil,
    } = parsed.data;

    // Generate unique slug from title
    const baseSlug = slugify(title);
    let slug = baseSlug;

    // Check if slug exists; if so, append random suffix
    const [existingSlug] = await db
      .select({ id: brochures.id })
      .from(brochures)
      .where(eq(brochures.slug, slug))
      .limit(1);

    if (existingSlug) {
      const suffix = Math.random().toString(36).substring(2, 8);
      slug = `${baseSlug}-${suffix}`;
    }

    const [newBrochure] = await db
      .insert(brochures)
      .values({
        storeId: store.id,
        title,
        slug,
        description: description ?? null,
        bannerImageUrl: bannerImageUrl ?? null,
        thumbnailImageUrl: thumbnailImageUrl ?? null,
        status,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        createdBy: session.user.id,
      })
      .returning();

    return NextResponse.json(newBrochure, { status: 201 });
  } catch (error) {
    console.error("Error creating brochure:", error);
    return NextResponse.json(
      { error: "Failed to create brochure" },
      { status: 500 }
    );
  }
}
