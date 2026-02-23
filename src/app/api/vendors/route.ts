import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, branches, users } from "@/db/schema";
import { eq, and, sql, ilike, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

// GET /api/vendors - List approved+active vendors (public)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const conditions = [eq(vendors.approved, true), eq(vendors.active, true)];

    if (search) {
      conditions.push(
        or(
          ilike(vendors.name, `%${search}%`),
          ilike(vendors.description, `%${search}%`)
        )!
      );
    }

    const vendorList = await db
      .select({
        id: vendors.id,
        name: vendors.name,
        slug: vendors.slug,
        description: vendors.description,
        logoUrl: vendors.logoUrl,
        bannerUrl: vendors.bannerUrl,
        websiteUrl: vendors.websiteUrl,
        createdAt: vendors.createdAt,
        branchCount: sql<number>`count(${branches.id})`.as("branch_count"),
      })
      .from(vendors)
      .leftJoin(branches, eq(vendors.id, branches.vendorId))
      .where(and(...conditions))
      .groupBy(vendors.id);

    return NextResponse.json(vendorList, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  } catch (error) {
    console.error("Vendors fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }
}

// POST /api/vendors - Register a new vendor (authenticated vendor)
const createVendorSchema = z.object({
  name: z.string().min(2, "Vendor name must be at least 2 characters"),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  // First branch data
  branchName: z.string().min(1, "Branch name is required"),
  town: z.string().optional(),
  region: z.string().optional(),
  address: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  whatsappNumber: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = createVendorSchema.parse(body);

    // Upgrade user to vendor if they are a regular user
    if (session.user.role === "user") {
      await db
        .update(users)
        .set({ role: "vendor" })
        .where(eq(users.id, session.user.id));
    }

    // Check if user already has a vendor
    const [existingVendor] = await db
      .select({ id: vendors.id })
      .from(vendors)
      .where(eq(vendors.ownerId, session.user.id))
      .limit(1);

    if (existingVendor) {
      return NextResponse.json(
        { error: "You already have a registered vendor" },
        { status: 409 }
      );
    }

    // Generate vendor slug
    const vendorSlug = slugify(validated.name);

    // Normalize websiteUrl
    let websiteUrl = validated.websiteUrl || null;
    if (websiteUrl && !websiteUrl.startsWith("http://") && !websiteUrl.startsWith("https://")) {
      websiteUrl = `https://${websiteUrl}`;
    }

    // Create vendor
    const [vendor] = await db
      .insert(vendors)
      .values({
        ownerId: session.user.id,
        name: validated.name,
        slug: vendorSlug,
        description: validated.description || null,
        logoUrl: validated.logoUrl || null,
        bannerUrl: validated.bannerUrl || null,
        websiteUrl,
        approved: false,
      })
      .returning();

    // Create first branch
    const branchSlug = slugify(validated.branchName);

    const [branch] = await db
      .insert(branches)
      .values({
        vendorId: vendor.id,
        branchName: validated.branchName,
        slug: branchSlug,
        town: validated.town || null,
        region: validated.region || null,
        address: validated.address || null,
        latitude: validated.latitude || null,
        longitude: validated.longitude || null,
        whatsappNumber: validated.whatsappNumber || null,
        approved: false,
      })
      .returning();

    return NextResponse.json({ vendor, branch }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Vendor creation error:", error);
    return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 });
  }
}
