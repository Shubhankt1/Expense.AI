import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const addTransaction = mutation({
  args: {
    amount: v.number(),
    description: v.string(),
    category: v.string(),
    date: v.string(),
    type: v.union(v.literal("income"), v.literal("expense")),
    isRecurring: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const transactionId = await ctx.db.insert("transactions", {
      userId,
      ...args,
    });

    // Update budget spending if it's an expense
    if (args.type === "expense") {
      const month = args.date.substring(0, 7); // Extract YYYY-MM
      const existingBudget = await ctx.db
        .query("budgets")
        .withIndex("by_user_and_month", (q) => 
          q.eq("userId", userId).eq("month", month)
        )
        .filter((q) => q.eq(q.field("category"), args.category))
        .first();

      if (existingBudget) {
        await ctx.db.patch(existingBudget._id, {
          spent: existingBudget.spent + Math.abs(args.amount),
        });
      }
    }

    return transactionId;
  },
});

export const getTransactions = query({
  args: {
    limit: v.optional(v.number()),
    month: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc");

    if (args.month) {
      query = ctx.db
        .query("transactions")
        .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
        .filter((q) => q.gte(q.field("date"), args.month + "-01"))
        .filter((q) => q.lt(q.field("date"), args.month + "-32"))
        .order("desc");
    }

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});

export const getSpendingByCategory = query({
  args: {
    month: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("type"), "expense"))
      .collect();

    const filteredTransactions = args.month
      ? transactions.filter((t) => t.date.startsWith(args.month!))
      : transactions;

    const categoryTotals: Record<string, number> = {};
    
    filteredTransactions.forEach((transaction) => {
      const category = transaction.category;
      categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(transaction.amount);
    });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
    }));
  },
});

export const getMonthlyTrends = query({
  args: {
    months: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const monthlyData: Record<string, { income: number; expenses: number }> = {};

    transactions.forEach((transaction) => {
      const month = transaction.date.substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }

      if (transaction.type === "income") {
        monthlyData[month].income += transaction.amount;
      } else {
        monthlyData[month].expenses += Math.abs(transaction.amount);
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    const recentMonths = args.months 
      ? sortedMonths.slice(-args.months)
      : sortedMonths;

    return recentMonths.map((month) => ({
      month,
      income: monthlyData[month].income,
      expenses: monthlyData[month].expenses,
      net: monthlyData[month].income - monthlyData[month].expenses,
    }));
  },
});
