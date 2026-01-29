import { v, ConvexError } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ERROR_CODES } from "./errorCodes";

export const getJobStatus = query({
  args: { jobId: v.id("_scheduled_functions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId)
      throw new ConvexError({
        code: ERROR_CODES.UNAUTHENTICATED,
        message: "You must be signed in to check job status.",
      });
    const status = await ctx.db.system.get("_scheduled_functions", args.jobId);
    return status;
  },
});
