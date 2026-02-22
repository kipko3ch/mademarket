import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, branches } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET /api/vendors/[id]/branches — List branches for a vendor
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id)).limit(1);
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    const session = await auth();
    const isAdmin = session?.user?.role === "admin";
    const isOwner = session?.user?.id === vendor.ownerId;

    let vendorBranches;
    if (isAdmin || isOwner) {
      vendorBranches = await db.select().from(branches).where(eq(branches.vendorId, vendor.id));
    } else {
      vendorBranches = await db
        .select()
        .from(branches)
        .where(
          and(eq(branches.vendorId, vendor.id), eq(branches.approved, true), eq(branches.active, true))
        );
    }

    return NextResponse.json(vendorBranches);
  } catch (error) {
    console.error("Branches fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }
}

// POST /api/vendors/[id]/branches — Add branch to vendor (owner only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id)).limit(1);
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    if (vendor.ownerId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const branchName = body.branchName || body.town || "Main";
    const slug = slugify(branchName);

    const [branch] = await db
      .insert(branches)
      .values({
        vendorId: vendor.id,
        branchName,
        slug,
        town: body.town || null,
        region: body.region || null,
        address: body.address || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        whatsappNumber: body.whatsappNumber || null,
      })
      .returning();

    return NextResponse.json(branch, { status: 201 });
  } catch (error) {
    console.error("Branch creation error:", error);
    return NextResponse.json({ error: "Failed to create branch" }, { status: 500 });
  }
}
