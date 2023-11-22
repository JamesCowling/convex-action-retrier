import { internalMutation, mutation } from "./_generated/server";
import { makeFunctionReference } from "convex/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const retryAction = mutation({
  args: {
    action: v.string(),
    actionArgs: v.any(),
    backoff: v.optional(v.number()),
    base: v.optional(v.number()),
    maxFailures: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { action, actionArgs, backoff = 10, base = 2, maxFailures = 16 }
  ) => {
    const job = await ctx.scheduler.runAfter(
      0,
      makeFunctionReference<"action">(action),
      actionArgs
    );
    await ctx.scheduler.runAfter(0, internal.retrier.retry, {
      job,
      action,
      actionArgs,
      backoff,
      base,
      maxFailures,
    });
  },
});

export const retry = internalMutation({
  args: {
    job: v.id("_scheduled_functions"),
    action: v.string(),
    actionArgs: v.any(),
    backoff: v.number(),
    base: v.number(),
    maxFailures: v.number(),
  },
  handler: async (
    ctx,
    { job, action, actionArgs, backoff, base, maxFailures }
  ) => {
    const status = await ctx.db.system.get(job);
    if (!status) {
      throw new Error(`job ${job} not found`);
    }

    switch (status.state.kind) {
      // Check again later if not yet finished.
      case "pending":
      case "inProgress":
        console.log(
          `Action ${job} not yet complete, checking again in ${backoff} ms.`
        );
        await ctx.scheduler.runAfter(backoff, internal.retrier.retry, {
          job,
          action,
          actionArgs,
          backoff: backoff * base,
          base,
          maxFailures,
        });
        break;

      // Retry if failed.
      case "failed":
        if (maxFailures <= 0) {
          console.log(`Action ${job} failed too many times, not retrying.`);
          break;
        }
        console.log(`Action ${job} failed, retrying in ${backoff} ms.`);
        const newJob = await ctx.scheduler.runAfter(
          0,
          makeFunctionReference<"action">(action),
          actionArgs
        );
        await ctx.scheduler.runAfter(backoff, internal.retrier.retry, {
          job: newJob,
          action,
          actionArgs,
          backoff: backoff * base,
          base,
          maxFailures: maxFailures - 1,
        });
        break;

      // Stop if succeeded or canceled.
      case "success":
        console.log(`Action ${job} succeeded.`);
        break;
      case "canceled":
        console.log(`Action ${job} was canceled. Not retrying.`);
        break;
    }
  },
});
