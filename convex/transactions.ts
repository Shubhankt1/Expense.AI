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

/**
 * Get transactions for a specific category and month
 */
export const getTransactionsByCategoryAndMonth = query({
  args: {
    category: v.string(),
    month: v.string(), // Format: "2024-12"
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Calculate month boundaries
    const monthStart = `${args.month}-01T00:00:00.000Z`;
    const [year, monthNum] = args.month.split("-").map(Number);
    const lastDay = new Date(year, monthNum, 0).getDate();
    const monthEnd = `${args.month}-${String(lastDay).padStart(2, "0")}T23:59:59.999Z`;

    // Use by_user_and_category index, filter by date
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_category", (q) =>
        q.eq("userId", userId).eq("category", args.category)
      )
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), monthStart),
          q.lte(q.field("date"), monthEnd)
        )
      )
      .collect();

    return transactions;
  },
});

/**
 * Calculate total spending for a category in a month
 * Internal query - used by budget mutations
 */
export const calculateCategorySpending = query({
  args: {
    userId: v.id("users"),
    category: v.string(),
    month: v.string(),
  },
  handler: async (ctx, args) => {
    // Calculate month boundaries
    const monthStart = `${args.month}-01T00:00:00.000Z`;
    const [year, monthNum] = args.month.split("-").map(Number);
    const lastDay = new Date(year, monthNum, 0).getDate();
    const monthEnd = `${args.month}-${String(lastDay).padStart(2, "0")}T23:59:59.999Z`;

    // Use by_user_and_category index, filter by date
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_category", (q) =>
        q.eq("userId", args.userId).eq("category", args.category)
      )
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), monthStart),
          q.lte(q.field("date"), monthEnd)
        )
      )
      .collect();

    // Calculate net spending
    const totalSpent = transactions.reduce((sum, txn) => {
      if (txn.type === "expense") {
        return sum + txn.amount;
      } else if (txn.type === "income") {
        // Refunds reduce spending
        const isRefund =
          txn.description.toLowerCase().includes("refund") ||
          txn.description.toLowerCase().includes("return") ||
          txn.description.toLowerCase().includes("credit");

        if (isRefund) {
          return sum - txn.amount;
        }
      }
      return sum;
    }, 0);

    return totalSpent;
  },
});

// TODO: recheck these functions below
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
