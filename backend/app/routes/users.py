from datetime import datetime

from fastapi import APIRouter, Depends

from app.db.mongo import db
from app.middleware.firebase_auth import verify_token
from app.models import UserInDB

router = APIRouter()


@router.get("/me", response_model=UserInDB)
async def get_current_user(user_data: dict = Depends(verify_token)):
    user = await db.users.find_one({"email": user_data["email"]})
    if not user:
        new_user = {
            "email": user_data["email"],
            "name": user_data.get("name", user_data["email"].split("@")[0]),
            "events_attending": [],
            "events_created": [],
            "created_at": datetime.utcnow(),
        }
        result = await db.users.insert_one(new_user)
        new_user["_id"] = result.inserted_id
        return UserInDB(**new_user)
    return UserInDB(**user)


@router.get("/{user_email}", response_model=UserInDB)
async def get_user(user_email: str, user_data: dict = Depends(verify_token)):
    user = await db.users.find_one({"email": user_email})
    if not user:
        return UserInDB(
            email=user_email,
            name=user_email.split("@")[0],
            events_attending=[],
            events_created=[],
        )
    return UserInDB(**user)