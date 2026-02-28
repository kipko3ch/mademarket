import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendorReports, vendors } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/reports/vendor?vendorId= — List vendor reports
export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vendorId = req.nextUrl.searchParams.get("vendorId");

  try {
    const conditions = vendorId ? eq(vendorReports.vendorId, vendorId) : undefined;

    const reports = await db
      .select({
        id: vendorReports.id,
        vendorId: vendorReports.vendorId,
        vendorName: vendors.name,
        title: vendorReports.title,
        fileUrl: vendorReports.fileUrl,
        uploadedAt: vendorReports.uploadedAt,
      })
      .from(vendorReports)
      .innerJoin(vendors, eq(vendorReports.vendorId, vendors.id))
      .where(conditions)
      .orderBy(desc(vendorReports.uploadedAt));

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Vendor reports GET error:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

// POST /api/admin/reports/vendor — Upload a vendor report
export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body.vendorId || !body.title || !body.fileUrl) {
      return NextResponse.json({ error: "vendorId, title, and fileUrl are required" }, { status: 400 });
    }

    // Verify vendor exists
    const [vendor] = await db.select({ id: vendors.id }).from(vendors).where(eq(vendors.id, body.vendorId)).limit(1);
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const [report] = await db
      .insert(vendorReports)
      .values({
        vendorId: body.vendorId,
        title: body.title.trim(),
        fileUrl: body.fileUrl,
      })
      .returning();

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Vendor report POST error:", error);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}
