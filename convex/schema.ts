import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  transactions: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    description: v.string(),
    category: v.string(),
    date: v.string(),
    type: v.union(v.literal("income"), v.literal("expense")),
    isRecurring: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"])
    .index("by_user_and_category", ["userId", "category"]),

  budgets: defineTable({
    userId: v.id("users"),
    category: v.string(),
    monthlyLimit: v.number(),
    month: v.string(), // Format: "2024-01"
    spent: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_month", ["userId", "month"]),

  savingsGoals: defineTable({
    userId: v.id("users"),
    name: v.string(),
    targetAmount: v.number(),
    currentAmount: v.number(),
    targetDate: v.string(),
    category: v.string(),
  }).index("by_user", ["userId"]),

  insights: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("spending_pattern"),
      v.literal("budget_alert"),
      v.literal("savings_tip"),
      v.literal("anomaly")
    ),
    title: v.string(),
    description: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    isRead: v.boolean(),
  }).index("by_user", ["userId"]),

  processedStatements: defineTable({
    userId: v.id("users"),
    fileName: v.string(),
    storageId: v.id("_storage"),
    transactionCount: v.number(),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
