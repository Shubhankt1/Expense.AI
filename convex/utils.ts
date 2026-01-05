import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getJobStatus = query({
  args: { jobId: v.id("_scheduled_functions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const status = await ctx.db.system.get("_scheduled_functions", args.jobId);
    return status;
  },
});
