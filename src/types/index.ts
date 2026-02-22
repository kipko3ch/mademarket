import type {
  users,
  vendors,
  branches,
  stores,
  products,
  storeProducts,
  categories,
  priceHistory,
  sponsoredListings,
  searchLogs,
  featuredProducts,
  productClicks,
  bundles,
  bundleProducts,
  bundleImages,
  brochures,
} from "@/db/schema";

// ─── Inferred row types ──────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Vendor = typeof vendors.$inferSelect;
export type NewVendor = typeof vendors.$inferInsert;

export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;

/** @deprecated Use Vendor/Branch instead */
export type Store = typeof stores.$inferSelect;
/** @deprecated Use NewVendor/NewBranch instead */
export type NewStore = typeof stores.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type StoreProduct = typeof storeProducts.$inferSelect;
export type NewStoreProduct = typeof storeProducts.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type PriceHistory = typeof priceHistory.$inferSelect;
export type SponsoredListing = typeof sponsoredListings.$inferSelect;
export type SearchLog = typeof searchLogs.$inferSelect;
export type FeaturedProduct = typeof featuredProducts.$inferSelect;
export type ProductClick = typeof productClicks.$inferSelect;
export type Bundle = typeof bundles.$inferSelect;
export type BundleProduct = typeof bundleProducts.$inferSelect;
export type BundleImage = typeof bundleImages.$inferSelect;
export type Brochure = typeof brochures.$inferSelect;

// ─── Custom types ────────────────────────────────────────────────────────────

export type UserRole = "admin" | "vendor" | "user";

export interface CartItem {
  productId: string;
  productName?: string;
  productImage?: string | null;
  quantity: number;
}

export interface CartBranchBreakdown {
  branchId: string;
  branchName: string;
  vendorId: string;
  vendorName: string;
  vendorSlug: string;
  branchSlug: string;
  town: string | null;
  vendorLogoUrl?: string | null;
  vendorWebsiteUrl?: string | null;
  branchWhatsapp?: string | null;
  total: number;
  itemCount: number;
  totalItems: number;
  hasAllItems: boolean;
  items: {
    productId: string;
    productName: string;
    productImage?: string | null;
    price: number;
    quantity: number;
    externalUrl?: string | null;
  }[];
}

/** @deprecated Use CartBranchBreakdown instead */
export interface CartStoreBreakdown {
  storeId: string;
  storeName: string;
  storeLogoUrl?: string | null;
  storeWebsiteUrl?: string | null;
  storeWhatsapp?: string | null;
  total: number;
  itemCount: number;
  totalItems: number;
  hasAllItems: boolean;
  items: {
    productId: string;
    productName: string;
    productImage?: string | null;
    price: number;
    quantity: number;
    externalUrl?: string | null;
  }[];
}

export interface CartCalculation {
  branches: CartBranchBreakdown[];
  cheapestBranchId: string;
  cheapestTotal: number;
  maxSavings: number;
}

export interface CompareResult {
  productId: string;
  productName: string;
  productImage?: string | null;
  category: string;
  prices: {
    branchId: string;
    vendorName: string;
    branchTown: string | null;
    vendorSlug: string;
    branchSlug: string;
    price: number;
    isCheapest: boolean;
    difference: number;
  }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
