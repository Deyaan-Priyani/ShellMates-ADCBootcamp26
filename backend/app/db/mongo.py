from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

client = AsyncIOMotorClient(os.getenv("mongodb+srv://shellmates-admin:dvp1TR12kqzrDeym@cluster0.0pa4wpa.mongodb.net/?appName=Cluster0"))
db = client["shellmates"]