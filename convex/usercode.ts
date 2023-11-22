import { action } from "./_generated/server";
import { v } from "convex/values";

export const maybeAction = action({
  args: {
    failureRate: v.number(), // 0.0 - 1.0
  },
  handler: async (ctx, { failureRate }) => {
    if (Math.random() < failureRate) {
      throw new Error("action failed");
    }
    console.log("action succeded");
  },
});
