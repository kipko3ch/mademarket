import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendorReports } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// DELETE /api/admin/reports/uploads/[id] — Delete a vendor report
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const [deleted] = await db
      .delete(vendorReports)
      .where(eq(vendorReports.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Vendor report DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}
