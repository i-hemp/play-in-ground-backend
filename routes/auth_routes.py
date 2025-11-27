from fastapi import APIRouter, HTTPException
from database import users_collection
from models import SignupModel, LoginModel
from utils import hash_password, verify_password, create_jwt

router = APIRouter(prefix="/auth")

@router.post("/signup")
def signup(user: SignupModel):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password)
    }

    users_collection.insert_one(new_user)
    return {"message": "User created successfully"}

@router.post("/login")
def login(user: LoginModel):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_jwt(str(db_user["_id"]))
    return {"token": token, "name": db_user["name"]}
