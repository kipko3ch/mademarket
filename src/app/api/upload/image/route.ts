import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToR2, generateImageKey } from "@/lib/r2";

export const dynamic = "force-dynamic";

// POST /api/upload/image — Upload image via server proxy (no CORS issues)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "vendor" && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate content type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File must be under 5MB" },
        { status: 400 }
      );
    }

    const key = generateImageKey(folder, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    await uploadToR2(key, buffer, file.type);

    const rawUrl = process.env.R2_PUBLIC_URL || "";
    const baseUrl = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
    const publicUrl = process.env.R2_PUBLIC_URL
      ? `${baseUrl}/${key}`
      : key;

    return NextResponse.json({ publicUrl, key });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
