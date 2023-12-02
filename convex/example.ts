/**
 * This file is just an example action to retry.
 */

import { action } from "./_generated/server";
import { v } from "convex/values";

// This is a sample action will fail randomly based on the `failureRate`
// argument. It's safe to retry since it doesn't have any side effects.
export const unreliableAction = action({
  args: {
    failureRate: v.number(), // 0.0 - 1.0
  },
  handler: async (_ctx, { failureRate }) => {
    console.log("Running an action with failure rate " + failureRate);
    if (Math.random() < failureRate) {
      throw new Error("action failed.");
    }
    console.log("action succeded.");
  },
});
