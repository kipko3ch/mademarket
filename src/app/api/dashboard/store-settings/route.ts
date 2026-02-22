import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Legacy route — replaced by /api/dashboard/vendor-settings
export async function PATCH() {
  return NextResponse.json(
    { error: "This endpoint has been replaced. Use /api/dashboard/vendor-settings instead." },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: "This endpoint has been replaced. Use /api/dashboard/vendor-settings instead." },
    { status: 410 }
  );
}
