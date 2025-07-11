import os
import time

import pymongo
import requests
from dotenv import load_dotenv

# === LOAD ENV ===
load_dotenv()
PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")
MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME") or "yourDatabase"
COLLECTION_NAME = os.getenv("COLLECTION_NAME") or "PredefinedMeals"

print(f"MONGO_URI: {MONGO_URI}")
print(f"DB_NAME: {DB_NAME}")
print(f"COLLECTION_NAME: {COLLECTION_NAME}")

HEADERS = {"Authorization": PEXELS_API_KEY}
PEXELS_URL = "https://api.pexels.com/v1/search"

# === CONNECT TO MONGO ===
client = pymongo.MongoClient(MONGO_URI)
db = client[DB_NAME]
print("Collections in DB:", db.list_collection_names())
collection = db[COLLECTION_NAME]
print("Sample document in collection:", collection.find_one())

def fetch_meal_names():
    """Fetch all meal names from MongoDB."""
    print("🔍 Fetching meal names from MongoDB...")
    meals = collection.find({}, {"name": 1})
    meal_names = [meal["name"] for meal in meals if "name" in meal]
    print(f"Fetched meal names: {meal_names}")
    return meal_names

def fetch_image_url(meal_name):
    """Get a royalty-free image URL from Pexels."""
    try:
        params = {"query": meal_name, "per_page": 1}
        response = requests.get(PEXELS_URL, headers=HEADERS, params=params)
        data = response.json()
        if data.get("photos"):
            return data["photos"][0]["src"]["medium"]
    except Exception as e:
        print(f"[!] Error fetching image for {meal_name}: {e}")
    return None

def update_meal_images():
    meal_names = fetch_meal_names()
    print(f"📦 Found {len(meal_names)} meals in the database.\n")

    for name in meal_names:
        image_url = fetch_image_url(name)
        if image_url:
            result = collection.update_one(
                {"name": {"$regex": f"^{name}$", "$options": "i"}},  # Case-insensitive match
                {"$set": {"imageUrl": image_url}}
            )
            if result.modified_count:
                print(f"[✔] Updated '{name}' with image.")
            else:
                print(f"[⚠️] Image fetched but no match in DB for '{name}'.")
        else:
            print(f"[✘] No image found for '{name}'")
        time.sleep(1)

    print("\n✅ Image update attempt complete.")


if __name__ == "__main__":
    update_meal_images()
