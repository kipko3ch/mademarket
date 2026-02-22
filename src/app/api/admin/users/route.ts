import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc, sql, like, or } from "drizzle-orm";

// GET /api/admin/users — list all users with search & filter
export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") || "20")));

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        like(users.email, `%${search}%`),
        like(users.name, `%${search}%`)
      )
    );
  }
  if (role && ["admin", "vendor", "user"].includes(role)) {
    conditions.push(eq(users.role, role as "admin" | "vendor" | "user"));
  }

  const where = conditions.length > 0
    ? conditions.length === 1 ? conditions[0] : sql`${conditions[0]} AND ${conditions[1]}`
    : undefined;

  const [allUsers, countResult] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(where),
  ]);

  return NextResponse.json({
    data: allUsers,
    total: Number(countResult[0].count),
    page,
    pageSize,
  });
}

// PATCH /api/admin/users — update a user's role
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { userId, role } = body;

  if (!userId || !["admin", "vendor", "user"].includes(role)) {
    return NextResponse.json({ error: "Invalid userId or role" }, { status: 400 });
  }

  // Prevent admin from demoting themselves
  if (userId === session.user.id && role !== "admin") {
    return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
  }

  const [updated] = await db
    .update(users)
    .set({ role })
    .where(eq(users.id, userId))
    .returning({ id: users.id, role: users.role });

  return NextResponse.json(updated);
}
