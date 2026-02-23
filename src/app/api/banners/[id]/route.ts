import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { heroBanners } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

// PATCH update banner
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (session?.user?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json();
    const [updated] = await db
        .update(heroBanners)
        .set({ ...body })
        .where(eq(heroBanners.id, id))
        .returning();
    return NextResponse.json(updated);
}

// DELETE banner
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (session?.user?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await db.delete(heroBanners).where(eq(heroBanners.id, id));
    return NextResponse.json({ ok: true });
}
