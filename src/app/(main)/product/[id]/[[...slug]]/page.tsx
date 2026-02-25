import { Metadata } from "next";
import { db } from "@/db";
import { products, storeProducts, vendors, branches, categories } from "@/db/schema";
import { eq, and, isNotNull, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/products/product-detail-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string; slug?: string[] }>;
}

async function getProductData(id: string) {
  const [productRows, priceRows] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        imageUrl: products.imageUrl,
        unit: products.unit,
        brand: products.brand,
        size: products.size,
        description: products.description,
        categoryName: categories.name,
        categoryId: products.categoryId,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id))
      .limit(1),

    db
      .select({
        branchId: branches.id,
        branchName: branches.branchName,
        branchTown: branches.town,
        vendorId: vendors.id,
        vendorName: vendors.name,
        vendorSlug: vendors.slug,
        branchSlug: branches.slug,
        vendorLogoUrl: vendors.logoUrl,
        vendorWebsiteUrl: vendors.websiteUrl,
        price: storeProducts.price,
        inStock: storeProducts.inStock,
        externalUrl: storeProducts.externalUrl,
      })
      .from(storeProducts)
      .innerJoin(branches, and(
        eq(storeProducts.branchId, branches.id),
        eq(branches.approved, true),
        eq(branches.active, true)
      ))
      .innerJoin(vendors, and(
        eq(branches.vendorId, vendors.id),
        eq(vendors.approved, true),
        eq(vendors.active, true)
      ))
      .where(and(
        eq(storeProducts.productId, id),
        isNotNull(storeProducts.branchId)
      ))
      .orderBy(storeProducts.price),
  ]);

  if (productRows.length === 0) return null;

  const product = productRows[0];
  const prices = priceRows.map(p => ({ ...p, price: Number(p.price) }));

  // Fetch related products
  let related: any[] = [];
  if (product.categoryId) {
    related = await db
      .select({
        id: products.id,
        name: products.name,
        imageUrl: products.imageUrl,
        categoryName: categories.name,
        unit: products.unit,
        minPrice: products.id, // placeholder for min price query if needed, or just fetch products
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(
        eq(products.categoryId, product.categoryId),
        ne(products.id, product.id)
      ))
      .limit(6);

    // For simplicity in this SEO pass, we just get basic product info
    // In a full implementation we'd join with prices to get minPrice
  }

  return { product, prices, related };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getProductData(id);
  if (!data) return { title: "Product Not Found" };

  const { product, prices } = data;
  const cheapest = prices.length > 0 ? prices[0].price : null;
  const priceText = cheapest ? `Best Price: N$${cheapest.toFixed(2)}` : "Compare Prices";

  const title = `${product.name} ${product.unit || ""} | ${priceText} | MaDe Market Namibia`;
  const description = product.description ||
    `Compare ${product.name} prices across Shoprite, SPAR, Checkers and more in Namibia. ${prices.length > 0 ? `Available at ${prices.length} retailers starting from N$${cheapest?.toFixed(2)}.` : "Find the best grocery deals and specials."}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.imageUrl ? [{ url: product.imageUrl }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.imageUrl ? [product.imageUrl] : [],
    },
    alternates: {
      canonical: `https://mademarketnam.com/product/${id}`,
    }
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const data = await getProductData(id);

  if (!data) {
    notFound();
  }

  return (
    <>
      <ProductDetailClient
        product={data.product}
        branchPrices={data.prices}
        initialRelatedProducts={data.related}
      />

      {/* Schema.org Product Data for Google Search */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": data.product.name,
            "image": data.product.imageUrl ? [data.product.imageUrl] : [],
            "description": data.product.description || `Compare ${data.product.name} prices in Namibia.`,
            "brand": {
              "@type": "Brand",
              "name": data.product.brand || "Namibian Retail"
            },
            "offers": {
              "@type": "AggregateOffer",
              "priceCurrency": "NAD",
              "lowPrice": data.prices.length > 0 ? data.prices[0].price : undefined,
              "highPrice": data.prices.length > 1 ? data.prices[data.prices.length - 1].price : undefined,
              "offerCount": data.prices.length,
              "offers": data.prices.map(p => ({
                "@type": "Offer",
                "price": p.price,
                "priceCurrency": "NAD",
                "availability": p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "seller": {
                  "@type": "Organization",
                  "name": p.vendorName
                }
              }))
            }
          })
        }}
      />
    </>
  );
}
