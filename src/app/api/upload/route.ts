import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { storeProducts, products, stores, priceHistory } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

// POST /api/upload — Excel bulk upload for store products
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "vendor" && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const storeId = formData.get("storeId") as string;

    if (!file || !storeId) {
      return NextResponse.json(
        { error: "File and storeId are required" },
        { status: 400 }
      );
    }

    // Verify store ownership
    if (session.user.role === "vendor") {
      const [store] = await db
        .select({ ownerId: stores.ownerId })
        .from(stores)
        .where(eq(stores.id, storeId))
        .limit(1);

      if (!store || store.ownerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Parse Excel file
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<{
      product_name: string;
      price: number;
      bundle_info?: string;
      unit?: string;
    }>(sheet);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Excel file is empty" },
        { status: 400 }
      );
    }

    if (rows.length > 500) {
      return NextResponse.json(
        { error: "Maximum 500 rows per upload" },
        { status: 400 }
      );
    }

    const results = {
      total: rows.length,
      created: 0,
      updated: 0,
      errors: [] as { row: number; error: string }[],
    };

    // Process in batches of 50
    const batchSize = 50;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);

      for (let j = 0; j < batch.length; j++) {
        const row = batch[j];
        const rowNum = i + j + 2; // +2 for 1-indexed + header row

        // Validate row
        if (!row.product_name || typeof row.product_name !== "string") {
          results.errors.push({ row: rowNum, error: "Missing product_name" });
          continue;
        }
        if (!row.price || isNaN(Number(row.price)) || Number(row.price) <= 0) {
          results.errors.push({ row: rowNum, error: "Invalid price" });
          continue;
        }

        try {
          const normalizedName = row.product_name.toLowerCase().trim();

          // Find or create product
          let [product] = await db
            .select({ id: products.id })
            .from(products)
            .where(eq(products.normalizedName, normalizedName))
            .limit(1);

          if (!product) {
            [product] = await db
              .insert(products)
              .values({
                name: row.product_name.trim(),
                normalizedName,
                unit: row.unit || null,
              })
              .returning({ id: products.id });
          }

          // Check for existing store product
          const [existing] = await db
            .select({ id: storeProducts.id, price: storeProducts.price })
            .from(storeProducts)
            .where(
              and(
                eq(storeProducts.storeId, storeId),
                eq(storeProducts.productId, product.id)
              )
            )
            .limit(1);

          if (existing) {
            const oldPrice = Number(existing.price);
            const newPrice = Number(row.price);

            await db
              .update(storeProducts)
              .set({
                price: String(newPrice),
                bundleInfo: row.bundle_info || null,
                updatedAt: new Date(),
              })
              .where(eq(storeProducts.id, existing.id));

            if (oldPrice !== newPrice) {
              await db.insert(priceHistory).values({
                storeProductId: existing.id,
                oldPrice: String(oldPrice),
                newPrice: String(newPrice),
              });
            }

            results.updated++;
          } else {
            await db.insert(storeProducts).values({
              storeId,
              productId: product.id,
              price: String(row.price),
              bundleInfo: row.bundle_info || null,
            });

            results.created++;
          }
        } catch (err) {
          results.errors.push({
            row: rowNum,
            error: `Processing failed: ${(err as Error).message}`,
          });
        }
      }
    }

    return NextResponse.json({
      message: "Upload complete",
      results,
    });
  } catch (error) {
    console.error("Excel upload error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}
