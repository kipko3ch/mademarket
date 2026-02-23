export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, branches, brochures } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const updateBrochureSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  bannerImageUrl: z.string().optional().nullable(),
  thumbnailImageUrl: z.string().optional().nullable(),
  status: z.enum(["draft", "published"]).optional(),
  validFrom: z.string().optional().nullable(),
  validUntil: z.string().optional().nullable(),
});

/** Helper: verify that a brochure belongs to one of the vendor's branches */
async function getVendorAndVerifyBrochure(userId: string, brochureId: string) {
  const [vendor] = await db
    .select({ id: vendors.id })
    .from(vendors)
    .where(eq(vendors.ownerId, userId))
    .limit(1);

  if (!vendor) return { vendor: null, brochure: null };

  // Get all branch IDs for this vendor
  const vendorBranches = await db
    .select({ id: branches.id })
    .from(branches)
    .where(eq(branches.vendorId, vendor.id));

  const vendorBranchIds = vendorBranches.map((b) => b.id);

  if (vendorBranchIds.length === 0) return { vendor, brochure: null };

  // Find the brochure and verify it belongs to one of vendor's branches
  const [brochure] = await db
    .select()
    .from(brochures)
    .where(eq(brochures.id, brochureId))
    .limit(1);

  if (
    !brochure ||
    !brochure.branchId ||
    !vendorBranchIds.includes(brochure.branchId)
  ) {
    return { vendor, brochure: null };
  }

  return { vendor, brochure };
}

// PATCH /api/dashboard/brochures/[id] — Update brochure (verify ownership via branch)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "vendor" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { vendor, brochure } = await getVendorAndVerifyBrochure(
      session.user.id,
      id
    );

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    if (!brochure) {
      return NextResponse.json(
        { error: "Brochure not found or not owned by you" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = updateBrochureSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};

    if (parsed.data.title !== undefined) {
      updates.title = parsed.data.title;

      // If title changed, update slug too
      const baseSlug = slugify(parsed.data.title);
      let slug = baseSlug;

      const [existingSlug] = await db
        .select({ id: brochures.id })
        .from(brochures)
        .where(eq(brochures.slug, slug))
        .limit(1);

      // If slug is taken by a different brochure, append random suffix
      if (existingSlug && existingSlug.id !== id) {
        const suffix = Math.random().toString(36).substring(2, 8);
        slug = `${baseSlug}-${suffix}`;
      }

      updates.slug = slug;
    }

    if (parsed.data.description !== undefined)
      updates.description = parsed.data.description;
    if (parsed.data.bannerImageUrl !== undefined)
      updates.bannerImageUrl = parsed.data.bannerImageUrl;
    if (parsed.data.thumbnailImageUrl !== undefined)
      updates.thumbnailImageUrl = parsed.data.thumbnailImageUrl;
    if (parsed.data.status !== undefined) updates.status = parsed.data.status;
    if (parsed.data.validFrom !== undefined)
      updates.validFrom = parsed.data.validFrom
        ? new Date(parsed.data.validFrom)
        : null;
    if (parsed.data.validUntil !== undefined)
      updates.validUntil = parsed.data.validUntil
        ? new Date(parsed.data.validUntil)
        : null;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(brochures)
      .set(updates)
      .where(eq(brochures.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update brochure" },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Dashboard brochure PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update brochure" },
      { status: 500 }
    );
  }
}

// DELETE /api/dashboard/brochures/[id] — Delete brochure (verify ownership via branch)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "vendor" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { vendor, brochure } = await getVendorAndVerifyBrochure(
      session.user.id,
      id
    );

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    if (!brochure) {
      return NextResponse.json(
        { error: "Brochure not found or not owned by you" },
        { status: 404 }
      );
    }

    await db.delete(brochures).where(eq(brochures.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Dashboard brochure DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete brochure" },
      { status: 500 }
    );
  }
}
