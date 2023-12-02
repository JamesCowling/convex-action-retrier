# convex-action-retrier

Wrapper that will retry an action in Convex until it succeeds.

npx convex run retrier:runAction "{\"action\": \"example:unreliableAction\", \"actionArgs\": {\"failureRate\": 0.75}}"
