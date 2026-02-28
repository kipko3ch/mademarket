import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, branches, storeProducts, products, productClicks, priceHistory } from "@/db/schema";
import { sql, eq, and, desc, gte, lte } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/reports/vendor-export?vendorId=&from=&to=
// Returns CSV with detailed vendor report
export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const vendorId = searchParams.get("vendorId");
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  try {
    // Build date conditions for price history
    const priceDateConds = [];
    if (fromParam) {
      const d = new Date(fromParam);
      if (!isNaN(d.getTime())) { d.setUTCHours(0, 0, 0, 0); priceDateConds.push(gte(priceHistory.changedAt, d)); }
    }
    if (toParam) {
      const d = new Date(toParam);
      if (!isNaN(d.getTime())) { d.setUTCHours(23, 59, 59, 999); priceDateConds.push(lte(priceHistory.changedAt, d)); }
    }

    // Vendor condition
    const vendorCond = vendorId ? eq(vendors.id, vendorId) : undefined;

    // Get vendor stats with branch/product/click counts
    const vendorRows = await db
      .select({
        vendorId: vendors.id,
        vendorName: vendors.name,
        approved: vendors.approved,
        active: vendors.active,
      })
      .from(vendors)
      .where(vendorCond)
      .orderBy(vendors.name);

    const csvLines: string[] = [
      "Vendor,Branch,City,Area,Products,Clicks,Price Updates,Status",
    ];

    for (const v of vendorRows) {
      // Get branch-level data for this vendor
      const branchRows = await db
        .select({
          branchId: branches.id,
          branchName: branches.branchName,
          city: branches.city,
          area: branches.area,
          town: branches.town,
          approved: branches.approved,
          active: branches.active,
          productCount: sql<number>`cast(count(distinct ${storeProducts.id}) as int)`,
        })
        .from(branches)
        .leftJoin(storeProducts, eq(storeProducts.branchId, branches.id))
        .where(eq(branches.vendorId, v.vendorId))
        .groupBy(branches.id, branches.branchName, branches.city, branches.area, branches.town, branches.approved, branches.active)
        .orderBy(branches.branchName);

      for (const b of branchRows) {
        // Click count for this branch
        const [clickRow] = await db
          .select({ count: sql<number>`cast(count(*) as int)` })
          .from(productClicks)
          .innerJoin(storeProducts, and(
            eq(productClicks.productId, storeProducts.productId),
            eq(storeProducts.branchId, b.branchId)
          ));

        // Price update count
        const priceUpdateConds = [eq(storeProducts.branchId, b.branchId)];
        const [priceRow] = await db
          .select({ count: sql<number>`cast(count(*) as int)` })
          .from(priceHistory)
          .innerJoin(storeProducts, eq(priceHistory.storeProductId, storeProducts.id))
          .where(and(...priceUpdateConds, ...priceDateConds));

        const esc = (s: string | null) => s ? `"${s.replace(/"/g, '""')}"` : "";
        const status = !b.active ? "Inactive" : b.approved ? "Active" : "Pending";

        csvLines.push(
          `${esc(v.vendorName)},${esc(b.branchName)},${esc(b.city || b.town)},${esc(b.area)},${b.productCount},${clickRow?.count || 0},${priceRow?.count || 0},${status}`
        );
      }
    }

    const csv = csvLines.join("\n");
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=vendor-report-${new Date().toISOString().split("T")[0]}.csv`,
      },
    });
  } catch (error) {
    console.error("Vendor export error:", error);
    return NextResponse.json({ error: "Failed to export vendor report" }, { status: 500 });
  }
}
