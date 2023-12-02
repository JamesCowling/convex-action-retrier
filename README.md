# convex-action-retrier

Helper function to retry a Convex action until it succeeds.

Unlike queries and mutaions, actions aren't automatically retried in
[Convex](https://docs.convex.dev/functions), since they may have non-idempotent
side-effects. Many actions _are_ safe to retry however. This package provides a
wrapper that will retry an action until it succeeds. Only use this wrapper for
an action that is safe to retry at any point in its execution.

Typically you would copy-paste `retrier.ts` into the `convex/` directory of your
project and call `retrier:runAction` to retry a given action. You can also run a
test example from the command line via:

```
# Initialize a Convex deployment.
npx convex init

# Tail logs on the Convex deployment.
npx convex dev --tail-logs

# In another terminal, retry `example:unreliableAction` until it succeeds.
npx convex run retrier:runAction "{\"action\": \"example:unreliableAction\", \"actionArgs\": {\"failureRate\": 0.75}}"
```

This helper schedules both the action and a `retry` mutation. The `retry`
mutation checks the action status and keeps rescheduling itself with exponential
backoff until the action is complete. If the action failed the mutation will
retry it with exponential backoff up until a retry limit.

It's quite easy to build higher order constructs like retries using scheduling
in Convex. Take a look at the code to use similar techniques for your own
use-cases.
