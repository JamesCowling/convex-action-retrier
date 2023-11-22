import os

from dotenv import load_dotenv

from convex import ConvexClient

load_dotenv(".env.local")
load_dotenv()

client = ConvexClient(os.getenv("CONVEX_URL"))

client.mutation(
    "retrier:retryAction",
    {"action": "usercode:maybeAction", "actionArgs": {"failureRate": 0.1}},
)
