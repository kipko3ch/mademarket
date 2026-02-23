import "dotenv/config";
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "mademarket13@gmail.com";
const ADMIN_PASSWORD = "Mademarket@2026";
const ADMIN_NAME = "Platform Admin";

async function seedAdmin() {
  console.log("Seeding admin user...");

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  // Check if user already exists
  const [existing] = await db
    .select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL))
    .limit(1);

  if (existing) {
    // Update existing user to admin with new password
    await db
      .update(users)
      .set({
        role: "admin",
        password: hashedPassword,
        name: ADMIN_NAME,
      })
      .where(eq(users.email, ADMIN_EMAIL));

    console.log(`Updated existing user "${ADMIN_EMAIL}" to admin role.`);
  } else {
    // Create new admin user
    await db
      .insert(users)
      .values({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
      });

    console.log(`Created new admin user "${ADMIN_EMAIL}".`);
  }

  console.log("Admin seed complete!");
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log(`  Role:     admin`);

  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error("Failed to seed admin:", error);
  process.exit(1);
});
