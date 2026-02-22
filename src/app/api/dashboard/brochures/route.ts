export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, branches, brochures } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const createBrochureSchema = z.object({
  branchId: z.string().uuid("branchId must be a valid UUID"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  bannerImageUrl: z.string().optional(),
  thumbnailImageUrl: z.string().optional(),
  status: z.enum(["draft", "published"]).optional().default("draft"),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
});

// GET /api/dashboard/brochures — Return vendor's own brochures, optionally filtered by branchId
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "vendor" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find vendor
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

      const results = await db
        .select()
        .from(brochures)
        .where(eq(brochures.branchId, branchId))
        .orderBy(desc(brochures.createdAt));

      return NextResponse.json(results);
    }

    // No branchId filter — return all brochures across all vendor branches
    const vendorBranches = await db
      .select({ id: branches.id })
      .from(branches)
      .where(eq(branches.vendorId, vendor.id));

    const vendorBranchIds = vendorBranches.map((b) => b.id);

    if (vendorBranchIds.length === 0) {
      return NextResponse.json([]);
    }

    const allBrochures = [];
    for (const bid of vendorBranchIds) {
      const rows = await db
        .select()
        .from(brochures)
        .where(eq(brochures.branchId, bid))
        .orderBy(desc(brochures.createdAt));

      allBrochures.push(...rows);
    }

    // Sort by createdAt descending
    allBrochures.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(allBrochures);
  } catch (error) {
    console.error("Error fetching vendor brochures:", error);
    return NextResponse.json(
      { error: "Failed to fetch brochures" },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/brochures — Create new brochure for a branch
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "vendor" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find vendor
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
            "Vendor must be approved before publishing brochures. Contact admin: +264818222368",
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
      branchId,
      title,
      description,
      bannerImageUrl,
      thumbnailImageUrl,
      status,
      validFrom,
      validUntil,
    } = parsed.data;

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

    // Generate unique slug from title
    const baseSlug = slugify(title);
    let slug = baseSlug;

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
        branchId,
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
