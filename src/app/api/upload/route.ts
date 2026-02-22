import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  storeProducts,
  products,
  vendors,
  branches,
  priceHistory,
} from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {
  normalizeProductName,
  extractProductMeta,
  slugify,
} from "@/lib/utils";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

// POST /api/upload — Excel bulk upload for branch products (multi-branch)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "vendor" && session.user.role !== "admin")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const branchIdsRaw = formData.get("branchIds") as string;

    if (!file || !branchIdsRaw) {
      return NextResponse.json(
        { error: "File and branchIds are required" },
        { status: 400 }
      );
    }

    // Parse branchIds — expect JSON array of UUID strings
    let branchIds: string[];
    try {
      branchIds = JSON.parse(branchIdsRaw);
      if (!Array.isArray(branchIds) || branchIds.length === 0) {
        return NextResponse.json(
          { error: "branchIds must be a non-empty array of UUIDs" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "branchIds must be a valid JSON array" },
        { status: 400 }
      );
    }

    // Find vendor for current user
    const [vendor] = await db
      .select({ id: vendors.id })
      .from(vendors)
      .where(eq(vendors.ownerId, session.user.id))
      .limit(1);

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Verify all branches belong to this vendor
    const vendorBranches = await db
      .select({ id: branches.id })
      .from(branches)
      .where(eq(branches.vendorId, vendor.id));

    const vendorBranchIds = new Set(vendorBranches.map((b) => b.id));

    for (const bid of branchIds) {
      if (!vendorBranchIds.has(bid)) {
        return NextResponse.json(
          {
            error: `Branch ${bid} not found or does not belong to your vendor`,
          },
          { status: 403 }
        );
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
      barcode?: string;
      brand?: string;
      size?: string;
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
      autoMatched: 0,
      newProducts: 0,
      branchesProcessed: branchIds.length,
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
        if (
          !row.price ||
          isNaN(Number(row.price)) ||
          Number(row.price) <= 0
        ) {
          results.errors.push({ row: rowNum, error: "Invalid price" });
          continue;
        }

        try {
          const normalized = normalizeProductName(row.product_name);
          const meta = extractProductMeta(row.product_name);
          const slug = slugify(row.product_name);
          const rowBarcode = row.barcode ? String(row.barcode).trim() : null;

          // Multi-strategy matching — same pattern as POST /api/products:
          // 1. Exact barcode match (highest confidence)
          // 2. Exact normalized name match OR slug match
          let existing = null;
          let matchStatus: "linked" | "auto_matched" | "not_linked" =
            "not_linked";

          if (rowBarcode) {
            const [byBarcode] = await db
              .select()
              .from(products)
              .where(eq(products.barcode, rowBarcode))
              .limit(1);
            if (byBarcode) {
              existing = byBarcode;
              matchStatus = "linked";
            }
          }

          if (!existing) {
            const [byNameOrSlug] = await db
              .select()
              .from(products)
              .where(
                or(
                  eq(products.normalizedName, normalized),
                  eq(products.slug, slug)
                )
              )
              .limit(1);
            if (byNameOrSlug) {
              existing = byNameOrSlug;
              matchStatus = "auto_matched";
            }
          }

          let productId: string;

          if (existing) {
            productId = existing.id;

            // Update missing fields on the core product if we have them
            const updates: Record<string, unknown> = {};
            if (!existing.brand && (row.brand || meta.brand))
              updates.brand = row.brand || meta.brand;
            if (!existing.size && (row.size || meta.size))
              updates.size = row.size || meta.size;
            if (!existing.barcode && rowBarcode) updates.barcode = rowBarcode;
            if (!existing.slug) updates.slug = slug;
            if (!existing.unit && row.unit) updates.unit = row.unit;

            if (Object.keys(updates).length > 0) {
              await db
                .update(products)
                .set(updates)
                .where(eq(products.id, existing.id));
            }

            results.autoMatched++;
          } else {
            // Create new product with full normalized data
            const [newProduct] = await db
              .insert(products)
              .values({
                name: row.product_name.trim(),
                normalizedName: normalized,
                slug,
                brand: row.brand || meta.brand || null,
                size: row.size || meta.size || null,
                barcode: rowBarcode,
                unit: row.unit || null,
              })
              .returning({ id: products.id });

            productId = newProduct.id;
            matchStatus = "not_linked";
            results.newProducts++;
          }

          // Create/update store products for ALL selected branches
          for (const branchId of branchIds) {
            // Check for existing store product for this branch
            const [existingStoreProduct] = await db
              .select({
                id: storeProducts.id,
                price: storeProducts.price,
              })
              .from(storeProducts)
              .where(
                and(
                  eq(storeProducts.branchId, branchId),
                  eq(storeProducts.productId, productId)
                )
              )
              .limit(1);

            if (existingStoreProduct) {
              const oldPrice = Number(existingStoreProduct.price);
              const newPrice = Number(row.price);

              await db
                .update(storeProducts)
                .set({
                  price: String(newPrice),
                  bundleInfo: row.bundle_info || null,
                  matchStatus,
                  updatedAt: new Date(),
                })
                .where(eq(storeProducts.id, existingStoreProduct.id));

              if (oldPrice !== newPrice) {
                await db.insert(priceHistory).values({
                  storeProductId: existingStoreProduct.id,
                  oldPrice: String(oldPrice),
                  newPrice: String(newPrice),
                });
              }

              results.updated++;
            } else {
              await db.insert(storeProducts).values({
                branchId,
                productId,
                price: String(row.price),
                bundleInfo: row.bundle_info || null,
                matchStatus,
              });

              results.created++;
            }
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
