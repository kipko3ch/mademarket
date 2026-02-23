import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get live dashboard stats for a store
export const getStoreStats = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("dashboardStats")
      .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
      .first();

    return stats || {
      totalViews: 0,
      todayViews: 0,
      cartAdds: 0,
      comparisons: 0,
    };
  },
});

// Increment a counter for a store
export const incrementStat = mutation({
  args: {
    storeId: v.string(),
    field: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("dashboardStats")
      .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
      .first();

    if (existing) {
      const update: Record<string, number> = { lastUpdated: Date.now() };
      if (args.field === "views") {
        update.totalViews = existing.totalViews + 1;
        update.todayViews = existing.todayViews + 1;
      } else if (args.field === "cartAdds") {
        update.cartAdds = existing.cartAdds + 1;
      } else if (args.field === "comparisons") {
        update.comparisons = existing.comparisons + 1;
      }
      await ctx.db.patch(existing._id, update);
    } else {
      await ctx.db.insert("dashboardStats", {
        storeId: args.storeId,
        totalViews: args.field === "views" ? 1 : 0,
        todayViews: args.field === "views" ? 1 : 0,
        cartAdds: args.field === "cartAdds" ? 1 : 0,
        comparisons: args.field === "comparisons" ? 1 : 0,
        lastUpdated: Date.now(),
      });
    }
  },
});

// Get trending searches
export const getTrendingSearches = query({
  handler: async (ctx) => {
    const trending = await ctx.db
      .query("searchTrending")
      .withIndex("by_count")
      .order("desc")
      .take(10);

    return trending;
  },
});

// Track a search
export const trackSearch = mutation({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const normalizedQuery = args.query.toLowerCase().trim();

    const existing = await ctx.db
      .query("searchTrending")
      .filter((q) => q.eq(q.field("query"), normalizedQuery))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        count: existing.count + 1,
        lastSearched: Date.now(),
      });
    } else {
      await ctx.db.insert("searchTrending", {
        query: normalizedQuery,
        count: 1,
        lastSearched: Date.now(),
      });
    }
  },
});

// Get platform-wide stats (admin)
export const getPlatformStats = query({
  handler: async (ctx) => {
    const stats = await ctx.db.query("platformStats").collect();
    const map: Record<string, number> = {};
    for (const stat of stats) {
      map[stat.key] = stat.value;
    }
    return map;
  },
});
