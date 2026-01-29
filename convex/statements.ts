import { v, ConvexError } from "convex/values";
import {
  action,
  mutation,
  query,
  internalMutation,
  internalAction,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { ERROR_CODES } from "./errorCodes";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({
        code: ERROR_CODES.UNAUTHENTICATED,
        message: "You must be signed in to upload statements.",
      });
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const processStatementMutation = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({
        code: ERROR_CODES.UNAUTHENTICATED,
        message: "You must be signed in to process statements.",
      });
    }

    const jobId: Id<"_scheduled_functions"> = await ctx.scheduler.runAfter(
      0,
      internal.statements.processStatement,
      {
        ...args,
        userId,
      },
    );
    return jobId;
  },
});

export const processStatement = internalAction({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    // Get the file from storage
    const file = await ctx.storage.get(args.storageId);
    if (!file) {
      throw new ConvexError({
        code: ERROR_CODES.NOT_FOUND,
        message: "File not found",
      });
    }

    // Convert file to text (assuming it's a text-based format like CSV or plain text)
    const text = await file.text();
    // console.log("Statement text:", text);

    // Use AI to analyze the statement
    const prompt = `Analyze this credit card statement and extract transaction data based on expense (debit) or income/refund/return (credit).
    
    Statement content:
    ${text}
    
    Please extract transactions and return them in this JSON format:
    {
      "transactions": [
        {
          "date": "YYYY-MM-DD",
          "description": "Transaction description",
          "amount": 123.45,
          "type": "expense" | "income",
          "category": "Food & Dining" | "Transportation" | "Shopping" | "Entertainment" | "Bills & Utilities" | "Healthcare" | "Education" | "Travel" | "Other"
        }
      ]
    }
    
    Rules:
    - Positive amounts or credits should be "income"
    - Negative amounts or debits should be "expense"
	- For refund transactions, classify them as "income" and add "- Refund" at the end of the description.
    - Use absolute values for amounts
    - Categorize transactions appropriately
    - SKIP statement/Bill payment transactions
    - Only include actual purchases and deposits
	- Your entire response must be a single JSON object.`;

    try {
      //   const response = await openai.chat.completions.create({
      //     model: "gpt-4o-mini",
      //     messages: [{ role: "user", content: prompt }],
      //     response_format: { type: "json_object" },
      //     temperature: 0.1,
      //   });

      //   const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      //   const resp = await gemini.models.generateContent({
      //     model: "gemini-3-flash-preview",
      //     contents: prompt,
      //     config: {
      //       responseMimeType: "application/json",
      //       thinkingConfig: {
      //         thinkingLevel: ThinkingLevel.MINIMAL,
      //       },
      //     },
      //   });

      //   console.log("Got a response");

      //   //   const content = response.choices[0].message.content;
      //   const content = resp.text;
      //   if (!content) {
      //     throw new Error("No response from AI");
      //   }

      //   console.log({ content });

      //   const parsedData = JSON.parse(content);

      const parsedData: any = await ctx.runAction(internal.gemini.callGemini, {
        prompt,
        json: true,
      });

      if (!parsedData.transactions || !Array.isArray(parsedData.transactions)) {
        throw new ConvexError({
          code: ERROR_CODES.AI_ERROR,
          message: "Invalid response format from AI",
        });
      }

      //   console.log({ parsedData });

      // Store the processed statement info in DB
      await ctx.runMutation(internal.statements.saveProcessedStatement, {
        userId,
        fileName: args.fileName,
        storageId: args.storageId,
        transactionCount: parsedData.transactions.length,
      });

      // Write transactions to DB in batch
      await ctx.runMutation(internal.statements.addExtractedTransactionsBatch, {
        userId,
        transactions: parsedData.transactions.map((t: any) => ({
          ...t,
          source: "statement_upload",
        })),
      });

      return {
        success: true,
        transactionCount: parsedData.transactions.length,
      };
    } catch (error) {
      console.error("Failed to process statement:", error);
      throw error;
    }
  },
});

export const saveProcessedStatement = internalMutation({
  args: {
    userId: v.id("users"),
    fileName: v.string(),
    storageId: v.id("_storage"),
    transactionCount: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("processedStatements", {
      ...args,
    });
  },
});

export const addExtractedTransactionsBatch = internalMutation({
  args: {
    userId: v.id("users"),
    transactions: v.array(
      v.object({
        amount: v.number(),
        description: v.string(),
        category: v.string(),
        date: v.string(),
        type: v.union(v.literal("income"), v.literal("expense")),
        source: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const budgetUpdates = new Map<Id<"budgets">, number>();
    let amtChange = 0;

    for (const transaction of args.transactions) {
      // 1. Insert the transaction
      const transactionDate = transaction.date.includes("T")
        ? transaction.date
        : transaction.date + "T00:00:00.000Z";

      await ctx.db.insert("transactions", {
        userId: args.userId,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        date: transactionDate,
        type: transaction.type,
        isRecurring: false,
      });

      // 2. Update budget spending if it's an expense
      //   if (transaction.type === "expense") {
      const month = transaction.date.substring(0, 7);
      const existingBudget = await ctx.db
        .query("budgets")
        .withIndex("by_user_and_month", (q) =>
          q.eq("userId", args.userId).eq("month", month),
        )
        .filter((q) => q.eq(q.field("category"), transaction.category))
        .first();

      if (existingBudget) {
        const budgetKey = existingBudget._id;

        if (transaction.type === "income")
          amtChange = -Math.abs(transaction.amount);
        else if (transaction.type === "expense")
          amtChange = Math.abs(transaction.amount);

        if (amtChange !== 0) {
          const currBudget = budgetUpdates.get(budgetKey) || 0;
          budgetUpdates.set(budgetKey, currBudget + amtChange);
        }
        await ctx.db.patch(existingBudget._id, {
          spent: existingBudget.spent + Math.abs(transaction.amount),
        });
      }
      //   }
    }
    for (const [budgetId, change] of budgetUpdates.entries()) {
      const budget = await ctx.db.get(budgetId);
      if (budget) {
        const newSpent = Math.max(0, budget.spent + change); // Never go below 0
        await ctx.db.patch(budgetId, {
          spent: newSpent,
        });
        console.log(
          `Updated budget ${budget.category}: ${budget.spent} -> ${newSpent}`,
        );
      }
    }
  },
});

// export const addExtractedTransaction = internalMutation({
//   args: {
//     userId: v.id("users"),
//     amount: v.number(),
//     description: v.string(),
//     category: v.string(),
//     date: v.string(),
//     type: v.union(v.literal("income"), v.literal("expense")),
//     source: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const transactionId = await ctx.db.insert("transactions", {
//       userId: args.userId,
//       amount: args.amount,
//       description: args.description,
//       category: args.category,
//       date: args.date,
//       type: args.type,
//       isRecurring: false,
//     });

//     // Update budget spending if it's an expense
//     if (args.type === "expense") {
//       const month = args.date.substring(0, 7);
//       const existingBudget = await ctx.db
//         .query("budgets")
//         .withIndex("by_user_and_month", (q) =>
//           q.eq("userId", args.userId).eq("month", month)
//         )
//         .filter((q) => q.eq(q.field("category"), args.category))
//         .first();

//       if (existingBudget) {
//         await ctx.db.patch(existingBudget._id, {
//           spent: existingBudget.spent + Math.abs(args.amount),
//         });
//       }
//     }

//     return transactionId;
//   },
// });

export const getProcessedStatements = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("processedStatements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);
  },
});
