from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

mongodb_uri = os.getenv("MONGODB_URI")
if not mongodb_uri:
    raise RuntimeError("Missing MONGODB_URI environment variable")

client = AsyncIOMotorClient(mongodb_uri)
db = client["shellmates"]