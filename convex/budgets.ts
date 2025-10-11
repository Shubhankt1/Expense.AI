import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const setBudget = mutation({
  args: {
    category: v.string(),
    monthlyLimit: v.number(),
    month: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existingBudget = await ctx.db
      .query("budgets")
      .withIndex("by_user_and_month", (q) => 
        q.eq("userId", userId).eq("month", args.month)
      )
      .filter((q) => q.eq(q.field("category"), args.category))
      .first();

    if (existingBudget) {
      await ctx.db.patch(existingBudget._id, {
        monthlyLimit: args.monthlyLimit,
      });
      return existingBudget._id;
    } else {
      return await ctx.db.insert("budgets", {
        userId,
        category: args.category,
        monthlyLimit: args.monthlyLimit,
        month: args.month,
        spent: 0,
      });
    }
  },
});

export const getBudgets = query({
  args: {
    month: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("budgets")
      .withIndex("by_user_and_month", (q) => 
        q.eq("userId", userId).eq("month", args.month)
      )
      .collect();
  },
});

export const getBudgetStatus = query({
  args: {
    month: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { totalBudget: 0, totalSpent: 0, categories: [] };
    }

    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user_and_month", (q) => 
        q.eq("userId", userId).eq("month", args.month)
      )
      .collect();

    const totalBudget = budgets.reduce((sum, budget) => sum + budget.monthlyLimit, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);

    const categories = budgets.map((budget) => ({
      category: budget.category,
      limit: budget.monthlyLimit,
      spent: budget.spent,
      remaining: budget.monthlyLimit - budget.spent,
      percentage: (budget.spent / budget.monthlyLimit) * 100,
    }));

    return {
      totalBudget,
      totalSpent,
      totalRemaining: totalBudget - totalSpent,
      categories,
    };
  },
});
