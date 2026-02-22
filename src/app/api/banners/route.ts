import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { heroBanners } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";

// GET all active banners (public) — cached for 60s for fast page loads
export async function GET() {
    try {
        const banners = await db
            .select()
            .from(heroBanners)
            .where(eq(heroBanners.active, true))
            .orderBy(asc(heroBanners.sortOrder));
        return NextResponse.json(banners, {
            headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
        });
    } catch {
        return NextResponse.json([], { status: 200 });
    }
}

// POST create new banner (admin only)
export async function POST(req: NextRequest) {
    const session = await auth();
    if (session?.user?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await req.json();
        const [banner] = await db
            .insert(heroBanners)
            .values({
                title: body.title,
                subtitle: body.subtitle,
                ctaText: body.ctaText,
                ctaUrl: body.ctaUrl,
                imageUrl: body.imageUrl,
                bgColor: body.bgColor || "#f0f4ff",
                active: body.active ?? true,
                sortOrder: body.sortOrder ?? 0,
            })
            .returning();
        return NextResponse.json(banner);
    } catch (e) {
        return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
    }
}
