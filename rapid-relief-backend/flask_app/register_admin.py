from pymongo import MongoClient
from werkzeug.security import generate_password_hash

# Connect to MongoDB
client = MongoClient("mongodb://127.0.0.1:27017/")
db = client["hospital_db"]
hospital_admins = db["hospital_admins"]

# Admin details to register
name = "Hospital Admin"
email = "hospital@gmail.com"
password = "YourSecurePassword123"  # Replace with your password

# Check if email already exists
if hospital_admins.find_one({"email": email}):
    print(f"Admin with email {email} already exists.")
else:
    hashed_password = generate_password_hash(password)
    hospital_admins.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password
    })
    print(f"Admin {name} with email {email} registered successfully!")
