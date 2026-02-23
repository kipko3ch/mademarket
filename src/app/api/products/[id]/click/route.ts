export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { productClicks } from "@/db/schema";

// POST /api/products/[id]/click — Log a product click (fire and forget)
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Fire and forget — always return 200
  db.insert(productClicks)
    .values({ productId: id })
    .execute()
    .catch((err) => {
      console.error("Product click logging error:", err);
    });

  return NextResponse.json({ success: true });
}
