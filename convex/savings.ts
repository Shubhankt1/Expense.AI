import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createSavingsGoal = mutation({
  args: {
    name: v.string(),
    targetAmount: v.number(),
    targetDate: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("savingsGoals", {
      userId,
      name: args.name,
      targetAmount: args.targetAmount,
      currentAmount: 0,
      targetDate: args.targetDate,
      category: args.category,
    });
  },
});

export const updateSavingsProgress = mutation({
  args: {
    goalId: v.id("savingsGoals"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const goal = await ctx.db.get(args.goalId);
    if (!goal || goal.userId !== userId) {
      throw new Error("Goal not found or unauthorized");
    }

    await ctx.db.patch(args.goalId, {
      currentAmount: Math.max(0, goal.currentAmount + args.amount),
    });
  },
});

export const getSavingsGoals = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const goals = await ctx.db
      .query("savingsGoals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return goals.map((goal) => ({
      ...goal,
      progress: (goal.currentAmount / goal.targetAmount) * 100,
      remaining: goal.targetAmount - goal.currentAmount,
    }));
  },
});
