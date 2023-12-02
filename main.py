import os

from dotenv import load_dotenv

from convex import ConvexClient

load_dotenv(".env.local")
load_dotenv()

client = ConvexClient(os.getenv("CONVEX_URL"))

print("Retrying unreliable action until it succeeds...")

client.mutation(
    "retrier:runAction",
    {"action": "example:unreliableAction", "actionArgs": {"failureRate": 0.75}},
)
