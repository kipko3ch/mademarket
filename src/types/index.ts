import type {
  users,
  stores,
  products,
  storeProducts,
  categories,
  priceHistory,
  sponsoredListings,
  searchLogs,
} from "@/db/schema";

// ─── Inferred row types ──────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Store = typeof stores.$inferSelect;
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

// ─── Custom types ────────────────────────────────────────────────────────────

export type UserRole = "admin" | "vendor" | "user";

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartStoreBreakdown {
  storeId: string;
  storeName: string;
  total: number;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }[];
}

export interface CartCalculation {
  stores: CartStoreBreakdown[];
  cheapestStoreId: string;
  cheapestTotal: number;
  maxSavings: number;
}

export interface CompareResult {
  productId: string;
  productName: string;
  category: string;
  prices: {
    storeId: string;
    storeName: string;
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
