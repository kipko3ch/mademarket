import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const DEFAULT_SECRET = "made-market-admin-setup-2024";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, secretKey } = body;

    // Validate required fields
    if (!email || !password || !name || !secretKey) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, name, secretKey" },
        { status: 400 }
      );
    }

    // Validate secret key
    const expectedSecret = process.env.ADMIN_SEED_SECRET || DEFAULT_SECRET;
    if (secretKey !== expectedSecret) {
      return NextResponse.json(
        { error: "Invalid secret key" },
        { status: 403 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if user already exists
    const [existing] = await db
      .select({ id: users.id, email: users.email, role: users.role })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      // Update existing user: set role to admin and reset password
      await db
        .update(users)
        .set({
          role: "admin",
          password: hashedPassword,
          name,
        })
        .where(eq(users.email, email));

      return NextResponse.json(
        {
          message: "Existing user updated to admin successfully",
          user: { email, name, role: "admin" },
        },
        { status: 200 }
      );
    }

    // Create new admin user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: "admin",
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });

    return NextResponse.json(
      {
        message: "Admin user created successfully",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin seed error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
