import {
  pgTable,
  text,
  timestamp,
  boolean,
  decimal,
  integer,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"), // null for OAuth users
  image: text("image"),
  role: text("role", { enum: ["admin", "vendor", "user"] })
    .notNull()
    .default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  vendors: many(vendors),
  searchLogs: many(searchLogs),
}));

// ─── Vendors ─────────────────────────────────────────────────────────────────

export const vendors = pgTable(
  "vendors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    logoUrl: text("logo_url"),
    bannerUrl: text("banner_url"),
    websiteUrl: text("website_url"),
    approved: boolean("approved").notNull().default(false),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_vendors_owner").on(table.ownerId),
  ]
);

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  owner: one(users, {
    fields: [vendors.ownerId],
    references: [users.id],
  }),
  branches: many(branches),
  sponsoredListings: many(sponsoredListings),
}));

// ─── Branches ────────────────────────────────────────────────────────────────

export const branches = pgTable(
  "branches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "cascade" }),
    branchName: text("branch_name").notNull(),
    slug: text("slug").notNull(),
    town: text("town"),
    region: text("region"),
    address: text("address"),
    latitude: text("latitude"),
    longitude: text("longitude"),
    whatsappNumber: text("whatsapp_number"),
    approved: boolean("approved").notNull().default(false),
    active: boolean("active").notNull().default(true),
    showInMarquee: boolean("show_in_marquee").notNull().default(false),
    marqueeOrder: integer("marquee_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_branches_vendor").on(table.vendorId),
    index("idx_branches_region").on(table.region),
    index("idx_branches_town").on(table.town),
    uniqueIndex("idx_branches_vendor_slug").on(table.vendorId, table.slug),
  ]
);

export const branchesRelations = relations(branches, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [branches.vendorId],
    references: [vendors.id],
  }),
  storeProducts: many(storeProducts),
  bundles: many(bundles),
  brochures: many(brochures),
}));

// ─── Stores (legacy — kept for migration, will be removed in Phase 6) ───────

export const stores = pgTable("stores", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  logoUrl: text("logo_url"),
  bannerUrl: text("banner_url"),
  websiteUrl: text("website_url"),
  whatsappNumber: text("whatsapp_number"),
  region: text("region"),
  city: text("city"),
  address: text("address"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  approved: boolean("approved").notNull().default(false),
  suspended: boolean("suspended").notNull().default(false),
  showInMarquee: boolean("show_in_marquee").notNull().default(false),
  marqueeOrder: integer("marquee_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_stores_region").on(table.region),
  index("idx_stores_city").on(table.city),
]);

// ─── Categories ──────────────────────────────────────────────────────────────

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

// ─── Products (Core Product — one per real-world product) ─────────────────────

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    slug: text("slug"),
    brand: text("brand"),
    size: text("size"), // e.g., "10kg", "500ml", "6 pack"
    barcode: text("barcode"),
    description: text("description"),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    imageUrl: text("image_url"),
    unit: text("unit"), // e.g., "kg", "litre", "pack"
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_products_category").on(table.categoryId),
    index("idx_products_normalized_name").on(table.normalizedName),
    index("idx_products_slug").on(table.slug),
    index("idx_products_barcode").on(table.barcode),
  ]
);

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  storeProducts: many(storeProducts),
}));

// ─── Store Products (prices per branch) ──────────────────────────────────────

export const storeProducts = pgTable(
  "store_products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id")
      .references(() => stores.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id")
      .references(() => branches.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    bundleInfo: text("bundle_info"),
    brochureUrl: text("brochure_url"),
    externalUrl: text("external_url"),
    inStock: boolean("in_stock").notNull().default(true),
    matchStatus: text("match_status", {
      enum: ["linked", "auto_matched", "not_linked"],
    })
      .notNull()
      .default("linked"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_store_products_store").on(table.storeId),
    index("idx_store_products_branch").on(table.branchId),
    index("idx_store_products_product").on(table.productId),
  ]
);

export const storeProductsRelations = relations(storeProducts, ({ one, many }) => ({
  branch: one(branches, {
    fields: [storeProducts.branchId],
    references: [branches.id],
  }),
  product: one(products, {
    fields: [storeProducts.productId],
    references: [products.id],
  }),
  priceHistory: many(priceHistory),
}));

// ─── Price History ───────────────────────────────────────────────────────────

export const priceHistory = pgTable(
  "price_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeProductId: uuid("store_product_id")
      .notNull()
      .references(() => storeProducts.id, { onDelete: "cascade" }),
    oldPrice: decimal("old_price", { precision: 10, scale: 2 }).notNull(),
    newPrice: decimal("new_price", { precision: 10, scale: 2 }).notNull(),
    changedAt: timestamp("changed_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_price_history_store_product").on(table.storeProductId),
  ]
);

export const priceHistoryRelations = relations(priceHistory, ({ one }) => ({
  storeProduct: one(storeProducts, {
    fields: [priceHistory.storeProductId],
    references: [storeProducts.id],
  }),
}));

// ─── Search Logs ─────────────────────────────────────────────────────────────

export const searchLogs = pgTable(
  "search_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    query: text("query").notNull(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    resultsCount: integer("results_count").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_search_logs_created").on(table.createdAt)]
);

export const searchLogsRelations = relations(searchLogs, ({ one }) => ({
  user: one(users, {
    fields: [searchLogs.userId],
    references: [users.id],
  }),
}));

// ─── Sponsored Listings ──────────────────────────────────────────────────────

export const sponsoredListings = pgTable(
  "sponsored_listings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id")
      .references(() => stores.id, { onDelete: "cascade" }),
    vendorId: uuid("vendor_id")
      .references(() => vendors.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    priorityLevel: integer("priority_level").notNull().default(1),
    approved: boolean("approved").notNull().default(false),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_sponsored_store").on(table.storeId),
    index("idx_sponsored_vendor").on(table.vendorId),
    index("idx_sponsored_active").on(table.active, table.endDate),
  ]
);

export const sponsoredListingsRelations = relations(
  sponsoredListings,
  ({ one }) => ({
    vendor: one(vendors, {
      fields: [sponsoredListings.vendorId],
      references: [vendors.id],
    }),
    product: one(products, {
      fields: [sponsoredListings.productId],
      references: [products.id],
    }),
  })
);

// ─── Auth.js required tables ─────────────────────────────────────────────────

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  (table) => [
    uniqueIndex("idx_accounts_provider").on(
      table.provider,
      table.providerAccountId
    ),
  ]
);

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires").notNull(),
  },
  (table) => [
    uniqueIndex("idx_verification_tokens").on(table.identifier, table.token),
  ]
);

// ─── Hero Banners ─────────────────────────────────────────────────────────────

export const heroBanners = pgTable("hero_banners", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  ctaText: text("cta_text"),
  ctaUrl: text("cta_url"),
  imageUrl: text("image_url").notNull(),
  bgColor: text("bg_color").default("#f0f4ff"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Featured Products (Admin-controlled) ────────────────────────────────────

export const featuredProducts = pgTable(
  "featured_products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    priority: text("priority", { enum: ["premium", "standard"] })
      .notNull()
      .default("standard"),
    durationDays: integer("duration_days").notNull().default(7),
    startsAt: timestamp("starts_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_featured_active").on(table.active, table.expiresAt),
    index("idx_featured_product").on(table.productId),
  ]
);

export const featuredProductsRelations = relations(featuredProducts, ({ one }) => ({
  product: one(products, {
    fields: [featuredProducts.productId],
    references: [products.id],
  }),
}));

// ─── Product Clicks (for popular products tracking) ──────────────────────────

export const productClicks = pgTable(
  "product_clicks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_product_clicks_product").on(table.productId),
    index("idx_product_clicks_created").on(table.createdAt),
  ]
);

export const productClicksRelations = relations(productClicks, ({ one }) => ({
  product: one(products, {
    fields: [productClicks.productId],
    references: [products.id],
  }),
}));

// ─── Bundles ─────────────────────────────────────────────────────────────────

export const bundles = pgTable(
  "bundles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id")
      .references(() => stores.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id")
      .references(() => branches.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug"),
    description: text("description"),
    imageUrl: text("image_url"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    externalUrl: text("external_url"),
    items: text("items"), // legacy — kept for migration, use bundleProducts instead
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_bundles_store").on(table.storeId),
    index("idx_bundles_branch").on(table.branchId),
    index("idx_bundles_active").on(table.active),
  ]
);

export const bundlesRelations = relations(bundles, ({ one, many }) => ({
  branch: one(branches, {
    fields: [bundles.branchId],
    references: [branches.id],
  }),
  bundleProducts: many(bundleProducts),
  bundleImages: many(bundleImages),
}));

// ─── Bundle Products (junction table) ────────────────────────────────────────

export const bundleProducts = pgTable(
  "bundle_products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bundleId: uuid("bundle_id")
      .notNull()
      .references(() => bundles.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
  },
  (table) => [
    index("idx_bundle_products_bundle").on(table.bundleId),
    uniqueIndex("idx_bundle_products_bundle_product").on(
      table.bundleId,
      table.productId
    ),
  ]
);

export const bundleProductsRelations = relations(bundleProducts, ({ one }) => ({
  bundle: one(bundles, {
    fields: [bundleProducts.bundleId],
    references: [bundles.id],
  }),
  product: one(products, {
    fields: [bundleProducts.productId],
    references: [products.id],
  }),
}));

// ─── Bundle Images ───────────────────────────────────────────────────────────

export const bundleImages = pgTable(
  "bundle_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bundleId: uuid("bundle_id")
      .notNull()
      .references(() => bundles.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_bundle_images_bundle").on(table.bundleId),
  ]
);

export const bundleImagesRelations = relations(bundleImages, ({ one }) => ({
  bundle: one(bundles, {
    fields: [bundleImages.bundleId],
    references: [bundles.id],
  }),
}));

// ─── Brochures ──────────────────────────────────────────────────────────────

export const brochures = pgTable(
  "brochures",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id")
      .references(() => stores.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id")
      .references(() => branches.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    bannerImageUrl: text("banner_image_url"),
    thumbnailImageUrl: text("thumbnail_image_url"),
    status: text("status", { enum: ["draft", "published"] })
      .notNull()
      .default("draft"),
    validFrom: timestamp("valid_from"),
    validUntil: timestamp("valid_until"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_brochures_store").on(table.storeId),
    index("idx_brochures_branch").on(table.branchId),
    index("idx_brochures_status").on(table.status),
    uniqueIndex("idx_brochures_slug").on(table.slug),
  ]
);

export const brochuresRelations = relations(brochures, ({ one }) => ({
  branch: one(branches, {
    fields: [brochures.branchId],
    references: [branches.id],
  }),
  creator: one(users, {
    fields: [brochures.createdBy],
    references: [users.id],
  }),
}));
