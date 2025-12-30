import { v } from "convex/values";
import {
  query,
  action,
  internalMutation,
  mutation,
  internalQuery,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const getUserTransactions = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getUserBudgets = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    return await ctx.db
      .query("budgets")
      .withIndex("by_user_and_month", (q) =>
        q.eq("userId", args.userId).eq("month", currentMonth)
      )
      .collect();
  },
});

export const generateInsights = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get user's financial data
    const transactions = await ctx.runQuery(
      internal.insights.getUserTransactions,
      {
        userId: args.userId,
      }
    );

    const budgets = await ctx.runQuery(internal.insights.getUserBudgets, {
      userId: args.userId,
    });

    if (transactions.length === 0) {
      return;
    }

    // Prepare data for AI analysis
    const financialSummary = {
      totalTransactions: transactions.length,
      categories: [...new Set(transactions.map((t: any) => t.category))],
      monthlySpending: transactions
        .filter((t: any) => t.type === "expense")
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0),
      budgetStatus: budgets.map((b: any) => ({
        category: b.category,
        spent: b.spent,
        limit: b.monthlyLimit,
        overBudget: b.spent > b.monthlyLimit,
      })),
    };

    console.log({ financialSummary });

    const prompt = `Analyze this financial data and provide 5 personalized insights:
    
    Financial Summary:
    - Total transactions: ${financialSummary.totalTransactions}
    - Categories: ${financialSummary.categories.join(", ")}
    - Monthly spending: $${financialSummary.monthlySpending.toFixed(2)}
    - Budget status: ${JSON.stringify(financialSummary.budgetStatus)}
    
    Provide insights in this JSON format:
    {
      "insights": [
        {
          "type": "spending_pattern" | "budget_alert" | "savings_tip" | "anomaly",
          "title": "Brief title",
          "description": "Detailed insight with actionable advice",
          "priority": "low" | "medium" | "high"
        }
      ]
    }
    
    Focus on actionable advice, spending patterns, and budget optimization.`;

    console.log({ prompt });

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) return;

      const aiInsights = JSON.parse(content);

      // Store insights in database
      for (const insight of aiInsights.insights) {
        await ctx.runMutation(internal.insights.createInsight, {
          userId: args.userId,
          type: insight.type,
          title: insight.title,
          description: insight.description,
          priority: insight.priority,
        });
      }
    } catch (error) {
      console.error("Failed to generate insights:", error);
    }
  },
});

export const getUserTransactionsPublic = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getUserBudgetsPublic = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    return await ctx.db
      .query("budgets")
      .withIndex("by_user_and_month", (q) =>
        q.eq("userId", args.userId).eq("month", currentMonth)
      )
      .collect();
  },
});

export const createInsight = internalMutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("insights", {
      ...args,
      isRead: false,
    });
  },
});

export const getInsights = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("insights")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);
  },
});

export const markInsightAsRead = mutation({
  args: {
    insightId: v.id("insights"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const insight = await ctx.db.get(args.insightId);
    if (!insight || insight.userId !== userId) {
      throw new Error("Insight not found or unauthorized");
    }

    await ctx.db.patch(args.insightId, {
      isRead: true,
    });
  },
});
