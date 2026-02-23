import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Live dashboard counters
  dashboardStats: defineTable({
    storeId: v.string(),
    totalViews: v.number(),
    todayViews: v.number(),
    cartAdds: v.number(),
    comparisons: v.number(),
    lastUpdated: v.number(),
  }).index("by_store", ["storeId"]),

  // Real-time most searched tracking
  searchTrending: defineTable({
    query: v.string(),
    count: v.number(),
    lastSearched: v.number(),
  }).index("by_count", ["count"]),

  // User cart session state (real-time sync)
  cartSessions: defineTable({
    userId: v.string(),
    items: v.array(
      v.object({
        productId: v.string(),
        quantity: v.number(),
      })
    ),
    lastUpdated: v.number(),
  }).index("by_user", ["userId"]),

  // Admin live stats
  platformStats: defineTable({
    key: v.string(),
    value: v.number(),
    lastUpdated: v.number(),
  }).index("by_key", ["key"]),

  // Notifications
  notifications: defineTable({
    userId: v.string(),
    type: v.string(), // "store_approved", "price_drop", "sponsored_approved"
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
