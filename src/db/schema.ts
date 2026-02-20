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
  stores: many(stores),
  searchLogs: many(searchLogs),
}));

// ─── Stores ──────────────────────────────────────────────────────────────────

export const stores = pgTable("stores", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  logoUrl: text("logo_url"),
  whatsappNumber: text("whatsapp_number"),
  address: text("address"),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const storesRelations = relations(stores, ({ one, many }) => ({
  owner: one(users, {
    fields: [stores.ownerId],
    references: [users.id],
  }),
  storeProducts: many(storeProducts),
  sponsoredListings: many(sponsoredListings),
}));

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

// ─── Products ────────────────────────────────────────────────────────────────

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(),
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
  ]
);

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  storeProducts: many(storeProducts),
}));

// ─── Store Products (prices per store) ───────────────────────────────────────

export const storeProducts = pgTable(
  "store_products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    bundleInfo: text("bundle_info"),
    brochureUrl: text("brochure_url"),
    inStock: boolean("in_stock").notNull().default(true),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_store_products_store").on(table.storeId),
    index("idx_store_products_product").on(table.productId),
    uniqueIndex("idx_store_products_store_product").on(
      table.storeId,
      table.productId
    ),
  ]
);

export const storeProductsRelations = relations(storeProducts, ({ one, many }) => ({
  store: one(stores, {
    fields: [storeProducts.storeId],
    references: [stores.id],
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
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
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
    index("idx_sponsored_active").on(table.active, table.endDate),
  ]
);

export const sponsoredListingsRelations = relations(
  sponsoredListings,
  ({ one }) => ({
    store: one(stores, {
      fields: [sponsoredListings.storeId],
      references: [stores.id],
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
