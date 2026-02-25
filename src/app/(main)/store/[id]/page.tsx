import { Metadata } from "next";
import { db } from "@/db";
import { vendors, branches, storeProducts, products, brochures, bundles } from "@/db/schema";
import { eq, and, desc, isNotNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { StoreDetailClient } from "@/components/stores/store-detail-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

async function getStoreData(id: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const condition = isUuid ? eq(vendors.id, id) : eq(vendors.slug, id);

  const [vendor] = await db.select().from(vendors).where(condition).limit(1);

  if (!vendor || !vendor.approved || !vendor.active) return null;

  const vendorBranches = await db
    .select()
    .from(branches)
    .where(
      and(
        eq(branches.vendorId, vendor.id),
        eq(branches.active, true),
        eq(branches.approved, true)
      )
    )
    .orderBy(branches.createdAt);

  const branchesWithProducts = await Promise.all(
    vendorBranches.map(async (branch) => {
      const branchProducts = await db
        .select({
          id: storeProducts.id,
          productId: products.id,
          productName: products.name,
          productImage: products.imageUrl,
          unit: products.unit,
          price: storeProducts.price,
          bundleInfo: storeProducts.bundleInfo,
          inStock: storeProducts.inStock,
        })
        .from(storeProducts)
        .innerJoin(products, eq(storeProducts.productId, products.id))
        .where(eq(storeProducts.branchId, branch.id));

      return { ...branch, products: branchProducts };
    })
  );

  const totalProductCount = branchesWithProducts.reduce(
    (sum, b) => sum + b.products.length,
    0
  );

  // Fetch brochures
  const brochureresults = await db
    .select({
      id: brochures.id,
      branchId: brochures.branchId,
      title: brochures.title,
      slug: brochures.slug,
      description: brochures.description,
      bannerImageUrl: brochures.bannerImageUrl,
      thumbnailImageUrl: brochures.thumbnailImageUrl,
      validFrom: brochures.validFrom,
      validUntil: brochures.validUntil,
      vendorName: vendors.name,
      vendorSlug: vendors.slug,
      vendorLogo: vendors.logoUrl,
    })
    .from(brochures)
    .innerJoin(branches, eq(brochures.branchId, branches.id))
    .innerJoin(vendors, eq(branches.vendorId, vendors.id))
    .where(and(
      eq(vendors.id, vendor.id),
      eq(brochures.status, "published")
    ))
    .orderBy(desc(brochures.createdAt));

  // Fetch bundles
  const bundleResults = await db
    .select({
      id: bundles.id,
      name: bundles.name,
      price: bundles.price,
      description: bundles.description,
      imageUrl: bundles.imageUrl,
      active: bundles.active,
      branchId: bundles.branchId,
    })
    .from(bundles)
    .innerJoin(branches, eq(bundles.branchId, branches.id))
    .where(and(
      eq(branches.vendorId, vendor.id),
      eq(bundles.active, true)
    ))
    .orderBy(desc(bundles.createdAt));

  return {
    vendor: { ...vendor, branches: branchesWithProducts, totalProductCount },
    brochures: brochureresults,
    bundles: bundleResults
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getStoreData(id);
  if (!data) return { title: "Store Not Found" };

  const { vendor } = data;
  const regions = Array.from(new Set(vendor.branches.map(b => b.town).filter(Boolean))).join(", ");

  const title = `${vendor.name} Namibia | Online Catalog, Pricing & Catalogues`;
  const description = vendor.description ||
    `View latest prices, specials, and catalogues from ${vendor.name} in Namibia. Covering branches in ${regions}. Compare prices and save on your next shop.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: vendor.logoUrl ? [{ url: vendor.logoUrl }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: vendor.logoUrl ? [vendor.logoUrl] : [],
    },
    alternates: {
      canonical: `https://mademarketnam.com/store/${vendor.slug}`,
    }
  };
}

export default async function StoreProfilePage({ params }: Props) {
  const { id } = await params;
  const data = await getStoreData(id);

  if (!data) {
    notFound();
  }

  return (
    <>
      <StoreDetailClient
        vendor={data.vendor as any}
        brochures={data.brochures as any}
        bundles={data.bundles as any}
      />

      {/* Structured Data for Google Search */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            "name": data.vendor.name,
            "description": data.vendor.description,
            "image": data.vendor.logoUrl,
            "url": `https://mademarketnam.com/store/${data.vendor.slug}`,
            "address": data.vendor.branches.length > 0 ? {
              "@type": "PostalAddress",
              "addressLocality": data.vendor.branches[0].town,
              "addressRegion": data.vendor.branches[0].region,
              "addressCountry": "NA"
            } : undefined,
            "hasMap": data.vendor.websiteUrl,
          })
        }}
      />
    </>
  );
}
