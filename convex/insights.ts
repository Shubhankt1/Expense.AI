import { v, ConvexError } from "convex/values";
import {
  query,
  action,
  internalMutation,
  mutation,
  internalQuery,
} from "./_generated/server";
import { ERROR_CODES } from "./errorCodes";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
// import OpenAI from "openai";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

// const openai = new OpenAI({
//   baseURL: process.env.CONVEX_OPENAI_BASE_URL,
//   apiKey: process.env.CONVEX_OPENAI_API_KEY,
// });

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
        q.eq("userId", args.userId).eq("month", currentMonth),
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
    const [transactions, budgets] = await Promise.all([
      ctx.runQuery(internal.insights.getUserTransactions, {
        userId: args.userId,
      }),
      ctx.runQuery(internal.insights.getUserBudgets, {
        userId: args.userId,
      }),
    ]);

    // const transactions = await ctx.runQuery(
    //   internal.insights.getUserTransactions,
    //   {
    //     userId: args.userId,
    //   }
    // );

    // const budgets = await ctx.runQuery(internal.insights.getUserBudgets, {
    //   userId: args.userId,
    // });

    // console.log({ transactions, budgets });

    if (transactions.length === 0) {
      throw new ConvexError({
        code: ERROR_CODES.NO_DATA,
        message:
          "No Transactions Found for the user. Cannot generate insights at this moment.",
      });
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

    // console.log({ prompt });

    try {
      //   const response = await openai.chat.completions.create({
      //     model: "gpt-4.1-nano",
      //     messages: [{ role: "user", content: prompt }],
      //     temperature: 0.7,
      //     response_format: { type: "json_object" },
      //   });

      const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const resp = await gemini.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.MEDIUM,
          },
        },
      });

      //   const content = response.choices[0].message.content;
      const content = resp.text;
      if (!content || content === "")
        throw new ConvexError({
          code: ERROR_CODES.AI_ERROR,
          message: "Failed to analyse data. Try again later.",
        });

      const aiInsights = JSON.parse(content);
      console.log({ aiInsights });

      // Store insights in database
      //   await ctx.runMutation(internal.insights.createBatchInsights, {
      //     userId: args.userId,
      //     insights: aiInsights.insights,
      //   });

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
      throw error;
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
        q.eq("userId", args.userId).eq("month", currentMonth),
      )
      .collect();
  },
});

export const createBatchInsights = internalMutation({
  args: {
    userId: v.id("users"),
    insights: v.array(
      v.object({
        type: v.union(
          v.literal("spending_pattern"),
          v.literal("budget_alert"),
          v.literal("savings_tip"),
          v.literal("anomaly"),
        ),
        title: v.string(),
        description: v.string(),
        priority: v.union(
          v.literal("low"),
          v.literal("medium"),
          v.literal("high"),
        ),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const insight of args.insights) {
      await ctx.db.insert("insights", {
        userId: args.userId,
        ...insight,
        isRead: false,
      });
    }
  },
});

export const createInsight = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("spending_pattern"),
      v.literal("budget_alert"),
      v.literal("savings_tip"),
      v.literal("anomaly"),
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

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "You must be signed in to mark insights as read.",
      });
    }

    // 1. Fetch all unread insights for the current user
    const unreadInsights = await ctx.db
      .query("insights")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(q.eq(q.field("userId"), userId), q.eq(q.field("isRead"), false)),
      )
      .collect();

    if (unreadInsights.length === 0) {
      throw new ConvexError({
        code: ERROR_CODES.NO_UNREAD_INSIGHTS,
        message: "No unread insights found",
      });
    }

    // 2. Loop through and patch each document
    for (const insight of unreadInsights) {
      await ctx.db.patch(insight._id, {
        isRead: true,
      });
    }

    return { count: unreadInsights.length };
  },
});

export const markInsightAsRead = mutation({
  args: {
    insightId: v.id("insights"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({
        code: ERROR_CODES.UNAUTHENTICATED,
        message: "You must be signed in to mark insights as read.",
      });
    }

    const insight = await ctx.db.get(args.insightId);
    if (!insight || insight.userId !== userId) {
      throw new ConvexError({
        code: ERROR_CODES.NOT_FOUND,
        message: "Insight not found or unauthorized",
      });
    }

    await ctx.db.patch(args.insightId, {
      isRead: true,
    });
  },
});

export const deleteAllInsights = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({
        code: ERROR_CODES.UNAUTHENTICATED,
        message: "You must be signed in to delete insights.",
      });
    }

    let success = false;
    let message = null;

    const [allReadInsights, allInsights] = await Promise.all([
      ctx.db
        .query("insights")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) =>
          q.and(q.eq(q.field("userId"), userId), q.eq(q.field("isRead"), true)),
        )
        .collect(),
      ctx.db
        .query("insights")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
    ]);

    const onlyUnread = allReadInsights.length === 0 && allInsights.length > 0;
    if (onlyUnread) message = "Please mark insights as read before deleting.";
    if (allInsights.length === 0) message = "No insights to delete.";

    if (allReadInsights.length > 0) {
      for (const insight of allReadInsights) {
        await ctx.db.delete(insight._id);
      }
      success = true;
      message = "Insights deleted successfully!";
    }
    // // Delete all insights
    // await Promise.all(allReadInsights.map((insight) => ctx.db.delete(insight._id)));

    return {
      success: success,
      count: allReadInsights.length,
      message: message || "Something went wrong",
    };
  },
});
