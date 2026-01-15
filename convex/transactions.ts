import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

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
      date: args.date + "T00:00:00.000Z",
    });

    // Update budget spending if it's an expense
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
        spent:
          args.type === "expense"
            ? existingBudget.spent + Math.abs(args.amount)
            : existingBudget.spent - Math.abs(args.amount),
        updatedAt: new Date().toISOString().split("T")[0] + "T00:00:00.000Z",
      });
    }

    return transactionId;
  },
});

export const getTransactions = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const queryBuilder = ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) => {
        const filtered = q.eq("userId", userId);

        if (args.startDate && args.endDate && args.startDate > args.endDate)
          throw new Error("Start Date cannot be later than End Date!");

        if (args.startDate && args.endDate && args.startDate <= args.endDate)
          return filtered.gte("date", args.startDate).lte("date", args.endDate);

        if (args.startDate) {
          return filtered.gte("date", args.startDate);
        }
        if (args.endDate) {
          return filtered.lte("date", args.endDate);
        }

        return filtered;
      })
      .order("desc");

    if (args.limit) {
      return await queryBuilder.take(args.limit);
    }

    return await queryBuilder.collect();
  },
});

export const deleteTransactionTask = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("UnAuthenticated!");
    }
    const transaction = await ctx.db.get(args.id);
    if (transaction?.userId !== userId) throw new Error("UnAuthorised!");

    const deletedRes: any = await ctx.runMutation(
      internal.transactions.deleteTransaction,
      {
        id: args.id,
      }
    );
    console.log({ deletedRes });

    const patchResp = await ctx.runMutation(
      internal.budgets.updateBudgetForTransaction,
      {
        userId: transaction.userId,
        category: transaction.category,
        month: transaction.date.substring(0, 7),
        amount: transaction.amount,
        transactionType: transaction.type,
      }
    );
    console.log({ patchResp });
  },
});

export const deleteTransaction = internalMutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get("transactions", args.id);
    if (!transaction) throw new Error("Transaction not found");
    await ctx.db.delete(args.id);
    return { deleted: true, status: 204 };
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
      categoryTotals[category] =
        (categoryTotals[category] || 0) + Math.abs(transaction.amount);
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

    const monthlyData: Record<string, { income: number; expenses: number }> =
      {};

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
