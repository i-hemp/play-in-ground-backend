import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
from bson import ObjectId
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI
app = FastAPI(title="Playground backend")

load_dotenv()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Connect to MongoDB Atlas
MONGO_URI = os.getenv("MONGODB_API_URI_URL")
# MONGO_URI = "mongodb+srv://hemanthpatnam09_db_user:khUCHlnSYQZb3Yrd@cluster0.vkvrlyf.mongodb.net/?appName=Cluster0"
client = MongoClient(MONGO_URI, server_api=ServerApi('1'))

try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

db = client["playgrounds"]
collection = db["grounds"]

# Location model


class Location(BaseModel):
    name: str
    place: str
    image_url: HttpUrl
    price_per_hour: int
    description: str
    map_url: HttpUrl


# Helper fun{} MongoDB documents -->> JSON


def helper(location):
    return {
        "id": str(location["_id"]),
        "name": location["name"],
        "place": location["place"],
        "image_url": location["image_url"],
        "price_per_hour": location["price_per_hour"],
        "description": location["description"],
        "map_url": location["map_url"]
    }


@app.get("/")
def home():
    return {"message": "PlayInGround Backend API is running "}

# POST: Create a new location


@app.post("/locations")
def create_location(location: Location):
    data = location.model_dump()
    result = collection.insert_one(data)
    new_loc = collection.find_one({"_id": result.inserted_id})
    return helper(new_loc)

# GET: Retrieve all locations


@app.get("/locations")
async def get_all_locations():
    locations = []
    for p in collection.find():
        # print(p)
        locations.append(helper(p))
    return locations
# GET: Retrieve a single location by ID


@app.get("/locations/{id}")
def get_location(id: str):
    loc = collection.find_one({"_id": ObjectId(id)})
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    return helper(loc)

# PUT: Update a location by ID


@app.put("/locations/{id}")
def update_location(id: str, location: Location):
    result = collection.update_one(
        {"_id": ObjectId(id)}, {"$set": location.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")
    updated = collection.find_one({"_id": ObjectId(id)})
    return helper(updated)

# DELETE: Delete a location by ID


@app.delete("/locations/{id}")
def delete_location(id: str):
    result = collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")
    return {"message": "Location deleted successfully"}
