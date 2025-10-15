import { v } from "convex/values";
import { action, mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const processStatement = action({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the file from storage
    const file = await ctx.storage.get(args.storageId);
    if (!file) {
      throw new Error("File not found");
    }

    // Convert file to text (assuming it's a text-based format like CSV or plain text)
    const text = await file.text();
    console.log("Statement text:", text);

    // Use AI to analyze the statement
    const prompt = `Analyze this credit card or bank statement and extract transaction data. 
    
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
    - Use absolute values for amounts
    - Categorize transactions appropriately
    - Skip fees, interest charges, and payment transactions
    - Only include actual purchases and deposits`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      });

      console.log("Got a response");

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No response from AI");
      }

      console.log("Got content:\n", content);

      const parsedData = JSON.parse(content);

      console.log("Parsed data:", parsedData);

      // Store the processed statement
      const statementId = await ctx.runMutation(
        internal.statements.saveProcessedStatement,
        {
          userId,
          fileName: args.fileName,
          storageId: args.storageId,
          transactionCount: parsedData.transactions.length,
        }
      );

      // Add each transaction
      for (const transaction of parsedData.transactions) {
        await ctx.runMutation(internal.statements.addExtractedTransaction, {
          userId,
          amount: transaction.amount,
          description: transaction.description,
          category: transaction.category,
          date: transaction.date,
          type: transaction.type,
          source: "statement_upload",
        });
      }

      return {
        success: true,
        transactionCount: parsedData.transactions.length,
      };
    } catch (error) {
      console.error("Failed to process statement:", error);
      throw new Error(
        "Failed to analyze statement. Please check the file format."
      );
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

export const addExtractedTransaction = internalMutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    description: v.string(),
    category: v.string(),
    date: v.string(),
    type: v.union(v.literal("income"), v.literal("expense")),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const transactionId = await ctx.db.insert("transactions", {
      userId: args.userId,
      amount: args.amount,
      description: args.description,
      category: args.category,
      date: args.date,
      type: args.type,
      isRecurring: false,
    });

    // Update budget spending if it's an expense
    if (args.type === "expense") {
      const month = args.date.substring(0, 7);
      const existingBudget = await ctx.db
        .query("budgets")
        .withIndex("by_user_and_month", (q) =>
          q.eq("userId", args.userId).eq("month", month)
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
