import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";

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

    const oldLimit = existingBudget?.monthlyLimit || 0;
    let resp;

    if (!existingBudget && args.monthlyLimit == 0)
      throw new Error("Cannot set a zero budget for a new category.");

    if (existingBudget) {
      if (args.monthlyLimit == 0) {
        await ctx.runMutation(internal.budgets.deleteBudget, {
          budgetId: existingBudget._id,
        });
        resp = {
          success: true,
          status: 200,
          operation: "delete",
          budget_id: existingBudget._id,
          existing_budget: true,
          month: existingBudget.month,
        };
      } else {
        await ctx.db.patch(existingBudget._id, {
          monthlyLimit: args.monthlyLimit,
          updatedAt: new Date().toISOString().split("T")[0] + "T00:00:00.000Z",
        });
        resp = {
          success: true,
          status: 200,
          operation: "patch",
          budget_id: existingBudget._id,
          existing_budget: true,
          old_limit: oldLimit,
          new_limit: args.monthlyLimit,
          month: existingBudget.month,
        };
      }
    } else {
      const alreadySpent: number = await ctx.runQuery(
        api.transactions.calculateCategorySpending,
        {
          userId: userId,
          category: args.category,
          month: args.month,
        }
      );
      const newBudget = await ctx.db.insert("budgets", {
        userId,
        category: args.category,
        monthlyLimit: args.monthlyLimit,
        month: args.month,
        spent: alreadySpent,
      });
      resp = {
        success: true,
        status: 200,
        operation: "create",
        budget_id: newBudget,
        existing_budget: false,
        new_limit: args.monthlyLimit,
        month: args.month,
      };
    }
    // console.log({ resp });
    return resp;
  },
});

export const deleteBudgetMutation = mutation({
  args: { budgetId: v.id("budgets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("UnAuthenticated!");

    const budget = await ctx.db.get("budgets", args.budgetId);
    if (budget?.userId !== userId) throw new Error("UnAuthorised!");

    await ctx.runMutation(internal.budgets.deleteBudget, {
      budgetId: args.budgetId,
    });

    return {
      success: true,
      status: 200,
      budget_id: args.budgetId,
      message: "Budget Deleted",
    };
  },
});

export const deleteBudget = internalMutation({
  args: { budgetId: v.id("budgets") },
  handler: async (ctx, args) => {
    await ctx.db.delete("budgets", args.budgetId);
    return {
      success: true,
      status: 200,
      budget_id: args.budgetId,
    };
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
    // console.log("Getting budget status for month:", args.month);
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("UnAuthenticated!");
    }

    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user_and_month", (q) =>
        q.eq("userId", userId).eq("month", args.month)
      )
      .collect();

    // console.log({ budgets });
    const totalBudget = budgets.reduce(
      (sum, budget) => sum + budget.monthlyLimit,
      0
    );
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);

    const categories = budgets.map((budget) => ({
      id: budget._id,
      category: budget.category,
      month: budget.month,
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

export const updateBudgetForTransaction = internalMutation({
  args: {
    userId: v.id("users"),
    category: v.string(),
    month: v.string(), // Format: "2024-12"
    amount: v.number(), // Positive to add, negative to subtract
    transactionType: v.union(v.literal("expense"), v.literal("income")),
  },
  handler: async (ctx, args) => {
    // Find the budget for this category and month
    const budget = await ctx.db
      .query("budgets")
      .withIndex("by_user_and_month", (q) =>
        q.eq("userId", args.userId).eq("month", args.month)
      )
      .filter((q) => q.eq(q.field("category"), args.category))
      .first();

    // If no budget exists, nothing to update
    if (!budget) {
      return {
        updated: false,
        status: 404,
        reason: "no_budget_exists",
      };
    }

    // Update budget
    const newSpent =
      args.transactionType === "expense"
        ? budget.spent - args.amount
        : budget.spent + args.amount;

    await ctx.db.patch(budget._id, {
      spent: newSpent,
      updatedAt: new Date().toISOString().split("T")[0] + "T00:00:00.000Z",
    });

    console.log(
      `Budget updated: ${budget.category} ${args.month}: ` +
        `$${budget.spent} -> $${newSpent}`
    );

    return {
      updated: true,
      status: 204,
      budgetId: budget._id,
      previousSpent: budget.spent,
      newSpent,
      change: args.transactionType === "expense" ? -args.amount : args.amount,
    };
  },
});
