import { MetadataRoute } from 'next';
import { db } from '@/db';
import { products, vendors, categories } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { productUrl } from '@/lib/utils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://mademarketnam.com';

    // Fetch dynamic data
    const [allProducts, allVendors, allCategories] = await Promise.all([
        db.select({ id: products.id, name: products.name, updatedAt: products.createdAt })
            .from(products)
            .orderBy(desc(products.createdAt))
            .limit(1000) // Increase limit for SEO coverage
            .catch(() => []),
        db.select({ slug: vendors.slug })
            .from(vendors)
            .where(eq(vendors.approved, true))
            .catch(() => []),
        db.select({ slug: categories.slug })
            .from(categories)
            .where(eq(categories.active, true))
            .catch(() => []),
    ]);

    const productUrls = (allProducts || []).map((p) => ({
        url: `${baseUrl}${productUrl(p.id, p.name)}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const vendorUrls = (allVendors || []).map((v) => ({
        url: `${baseUrl}/store/${v.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
    }));

    const categoryUrls = (allCategories || []).map((c) => ({
        url: `${baseUrl}/products?category=${c.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    const staticUrls = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
        { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
        { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
        { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
        { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
        { url: `${baseUrl}/cart`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.5 },
    ];

    return [...staticUrls, ...productUrls, ...vendorUrls, ...categoryUrls] as MetadataRoute.Sitemap;
}
