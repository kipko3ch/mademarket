import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { heroBanners } from "@/db/schema";
import { auth } from "@/lib/auth";
import { asc } from "drizzle-orm";

// GET all banners (admin, including inactive)
export async function GET() {
    const session = await auth();
    if (session?.user?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const banners = await db.select().from(heroBanners).orderBy(asc(heroBanners.sortOrder));
    return NextResponse.json(banners);
}

// POST /api/admin/banners — seed default banners if none exist
export async function POST() {
    const session = await auth();
    if (session?.user?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await db.select().from(heroBanners);
    if (existing.length > 0) {
        return NextResponse.json({ message: "Banners already exist", count: existing.length });
    }

    const defaults = [
        {
            title: "Find the Best Grocery Prices in Namibia",
            subtitle: "Stop overpaying. Compare real-time prices from Shoprite, SPAR, Checkers, and more in one place.",
            ctaText: "Browse Deals",
            ctaUrl: "/products",
            imageUrl: "/images/Flag_map_of_Namibia.svg",
            bgColor: "#0f172a",
            active: true,
            sortOrder: 0,
        },
        {
            title: "Save up to 30% Weekly",
            subtitle: "Smart cart auto-picks the cheapest store combination for you.",
            ctaText: "Build Smart Cart",
            ctaUrl: "/cart",
            imageUrl: "/images/save.png",
            bgColor: "#0f172a",
            active: true,
            sortOrder: 1,
        },
        {
            title: "Fresh Deals Every Day",
            subtitle: "Real-time prices updated daily from all major Namibian stores.",
            ctaText: "Browse Deals",
            ctaUrl: "/products",
            imageUrl: "/images/fresh.png",
            bgColor: "#0f172a",
            active: true,
            sortOrder: 2,
        },
    ];

    const inserted = await db.insert(heroBanners).values(defaults).returning();
    return NextResponse.json({ message: "Default banners seeded", count: inserted.length });
}
