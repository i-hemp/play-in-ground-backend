from pydantic import BaseModel, HttpUrl
from fastapi import APIRouter, HTTPException
from bson import ObjectId
from database import grounds_collection
# Location model


router = APIRouter(prefix="/grounds", tags=["Grounds"])


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


@router.get("/")
def home():
    return {"message": "PlayInGround Backend API for grounds is running "}

# POST: Create a new location


@router.post("/locations")
def create_location(location: Location):
    data = location.model_dump()
    result = grounds_collection.insert_one(data)
    new_loc = grounds_collection.find_one({"_id": result.inserted_id})
    return helper(new_loc)

# GET: Retrieve all locations


@router.get("/locations")
async def get_all_locations():
    locations = []
    for p in grounds_collection.find():
        # print(p)
        locations.append(helper(p))
    return locations
# GET: Retrieve a single location by ID


@router.get("/locations/{id}")
def get_location(id: str):
    loc = grounds_collection.find_one({"_id": ObjectId(id)})
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    return helper(loc)

# PUT: Update a location by ID


@router.put("/locations/{id}")
def update_location(id: str, location: Location):
    result = grounds_collection.update_one(
        {"_id": ObjectId(id)}, {"$set": location.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")
    updated = grounds_collection.find_one({"_id": ObjectId(id)})
    return helper(updated)

# DELETE: Delete a location by ID


@router.delete("/locations/{id}")
def delete_location(id: str):
    result = grounds_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")
    return {"message": "Location deleted successfully"}
