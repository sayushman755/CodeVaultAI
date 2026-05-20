import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

client = MongoClient(MONGO_URI)

db = client[DATABASE_NAME]

users_collection = db["users"]
problems_collection = db["problems"]
problem_statements_collection = db["problem_statements"]
daily_logs_collection = db["daily_logs"]
knowledge_notes_collection = db["knowledge_notes"]


def check_database_connection():
    try:
        client.admin.command("ping")
        return True
    except Exception as e:
        print("MongoDB connection error:", str(e))
        return False


def get_database_error():
    try:
        client.admin.command("ping")
        return None
    except Exception as e:
        return str(e)