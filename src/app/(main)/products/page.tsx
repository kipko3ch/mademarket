import { Metadata } from "next";
import { Suspense } from "react";
import { ProductCatalogClient } from "@/components/products/product-catalog-client";
import { SkeletonGrid } from "@/components/skeleton-card";
import { db } from "@/db";
import { categories, vendors } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : "";
  const categorySlug = typeof params.category === 'string' ? params.category : "";

  let title = "Browse All Grocery Products | MaDe Market Namibia";
  let description = "Compare thousands of grocery prices across Shoprite, SPAR, Checkers, and more in Namibia. Find the best deals and save on your monthly shopping.";

  if (search) {
    title = `Search results for "${search}" | MaDe Market Namibia`;
    description = `Find the best prices for "${search}" in Namibia. Compare deals across multiple retailers and save money today.`;
  } else if (categorySlug) {
    // Try to find the category name for a better title
    const [category] = await db
      .select({ name: categories.name })
      .from(categories)
      .where(eq(categories.slug, categorySlug))
      .limit(1)
      .catch(() => []);

    if (category) {
      title = `${category.name} in Namibia | Compare Prices & Deals | MaDe Market`;
      description = `Compare prices for ${category.name} across all major Namibian retailers. Find the cheapest ${category.name} specials and save on your groceries.`;
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    alternates: {
      canonical: "https://mademarketnam.com/products",
    }
  };
}

export default async function ProductsPage() {
  // Fetch meta data on server for faster initial load
  const [initialCategories, initialVendors] = await Promise.all([
    db.select({ id: categories.id, name: categories.name, slug: categories.slug }).from(categories).orderBy(asc(categories.name)).catch(() => []),
    db.select({ id: vendors.id, name: vendors.name }).from(vendors).where(eq(vendors.approved, true)).orderBy(asc(vendors.name)).catch(() => []),
  ]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl text-slate-900">
          <span className="highlighter text-red-600">Browse</span> Products
        </h1>
        <p className="text-slate-500 mt-1 text-xs sm:text-sm">
          Compare prices across vendors and find the best deals in Namibia
        </p>
      </div>

      <Suspense fallback={<SkeletonGrid count={10} />}>
        <ProductCatalogClient
          initialCategories={initialCategories as any}
          initialVendors={initialVendors as any}
        />
      </Suspense>
    </div>
  );
}
