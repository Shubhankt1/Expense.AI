import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export const callGemini = internalAction({
  args: {
    prompt: v.string(),
    json: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.json) args.json = true;
    const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const resp = await gemini.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: args.prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MINIMAL,
        },
      },
    });

    if (!resp.text || resp.text === "") throw new Error("No Response.");

    const data = args.json ? JSON.parse(resp.text) : resp.text;

    return data;
  },
});
