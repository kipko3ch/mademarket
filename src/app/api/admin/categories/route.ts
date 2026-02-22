import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { auth } from "@/lib/auth";
import { sql } from "drizzle-orm";

const DEFAULT_CATEGORIES = [
  "Dairy & Eggs",
  "Bakery & Bread",
  "Fresh Produce",
  "Meat & Poultry",
  "Seafood & Fish",
  "Frozen Foods",
  "Beverages",
  "Snacks & Confectionery",
  "Canned & Jarred Goods",
  "Cereals & Breakfast",
  "Rice, Pasta & Grains",
  "Cooking Oil & Condiments",
  "Spices & Seasonings",
  "Baby Products",
  "Personal Care",
  "Household & Cleaning",
  "Health & Wellness",
  "Pet Supplies",
  "Alcohol & Spirits",
  "Deli & Prepared Foods",
];

// POST /api/admin/categories — Seed default categories
export async function POST() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await db.select({ count: sql<number>`count(*)` }).from(categories);
  if (Number(existing[0].count) > 0) {
    return NextResponse.json({ error: "Categories already exist" }, { status: 400 });
  }

  const values = DEFAULT_CATEGORIES.map((name) => ({
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  }));

  await db.insert(categories).values(values);

  return NextResponse.json({ message: `Seeded ${values.length} categories` });
}
