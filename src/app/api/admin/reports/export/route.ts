import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { searchLogs } from "@/db/schema";
import { gte, lte, and, sql, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/reports/export?from=YYYY-MM-DD&to=YYYY-MM-DD
// Returns CSV with aggregated search data
export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const conditions = [];

  if (fromParam) {
    const fromDate = new Date(fromParam);
    if (!isNaN(fromDate.getTime())) {
      fromDate.setUTCHours(0, 0, 0, 0);
      conditions.push(gte(searchLogs.createdAt, fromDate));
    }
  }

  if (toParam) {
    const toDate = new Date(toParam);
    if (!isNaN(toDate.getTime())) {
      toDate.setUTCHours(23, 59, 59, 999);
      conditions.push(lte(searchLogs.createdAt, toDate));
    }
  }

  try {
    const rows = await db
      .select({
        query: searchLogs.query,
        count: sql<number>`cast(count(*) as int)`,
        lastSearched: sql<Date>`max(${searchLogs.createdAt})`,
      })
      .from(searchLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(searchLogs.query)
      .orderBy(desc(sql`count(*)`));

    const csvLines: string[] = ["Search Query,Total Searches,Last Searched"];

    for (const row of rows) {
      const query = `"${String(row.query).replace(/"/g, '""')}"`;
      const count = row.count;
      const lastSearched = new Date(row.lastSearched).toISOString();
      csvLines.push(`${query},${count},${lastSearched}`);
    }

    const csv = csvLines.join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=search-report-${new Date().toISOString().split("T")[0]}.csv`,
      },
    });
  } catch (error) {
    console.error("Search export error:", error);
    return NextResponse.json({ error: "Failed to export search report" }, { status: 500 });
  }
}
