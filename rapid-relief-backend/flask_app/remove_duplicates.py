from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://127.0.0.1:27017/")
db = client["hospital_db"]
users_col = db["users"]

# Find duplicate emails
pipeline = [
    {"$group": {"_id": "$email", "ids": {"$addToSet": "$_id"}, "count": {"$sum": 1}}},
    {"$match": {"count": {"$gt": 1}}}
]

duplicates = list(users_col.aggregate(pipeline))

print(f"Found {len(duplicates)} duplicate emails.")

# Remove duplicates, keep the first occurrence
for dup in duplicates:
    ids = dup["ids"]
    # Keep first, delete the rest
    ids_to_delete = ids[1:]
    users_col.delete_many({"_id": {"$in": ids_to_delete}})
    print(f"Removed {len(ids_to_delete)} duplicates for email {dup['_id']}")

print("✅ Duplicate emails removed.")
