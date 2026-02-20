import { NextResponse } from "next/server";
import { db } from "@/db";
import { sponsoredListings, stores, products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const listings = await db
      .select({
        id: sponsoredListings.id,
        storeName: stores.name,
        productName: products.name,
        startDate: sponsoredListings.startDate,
        endDate: sponsoredListings.endDate,
        priorityLevel: sponsoredListings.priorityLevel,
        approved: sponsoredListings.approved,
        active: sponsoredListings.active,
      })
      .from(sponsoredListings)
      .innerJoin(stores, eq(sponsoredListings.storeId, stores.id))
      .innerJoin(products, eq(sponsoredListings.productId, products.id))
      .orderBy(desc(sponsoredListings.createdAt));

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Sponsored listings error:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}
