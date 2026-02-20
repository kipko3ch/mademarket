import { NextResponse } from "next/server";
import { db } from "@/db";
import { stores, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const storeList = await db
      .select({
        id: stores.id,
        name: stores.name,
        approved: stores.approved,
        createdAt: stores.createdAt,
        ownerName: users.name,
        ownerEmail: users.email,
      })
      .from(stores)
      .innerJoin(users, eq(stores.ownerId, users.id))
      .orderBy(stores.createdAt);

    return NextResponse.json(storeList);
  } catch (error) {
    console.error("Admin stores error:", error);
    return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 });
  }
}
