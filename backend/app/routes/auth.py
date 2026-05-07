from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Header

from app.db.mongo import db
from app.models import UserInDB

router = APIRouter()


@router.get("/me")
async def get_me(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.split(" ")[1]
    try:
        from firebase_admin import auth
        decoded = auth.verify_id_token(token)
        email = decoded.get("email", "")
        if not email.endswith("@umd.edu"):
            return None
    except Exception:
        return None

    user = await db.users.find_one({"email": email})
    if not user:
        new_user = {
            "email": email,
            "name": decoded.get("name", email.split("@")[0]),
            "events_attending": [],
            "events_created": [],
            "created_at": datetime.utcnow(),
        }
        result = await db.users.insert_one(new_user)
        new_user["_id"] = result.inserted_id
        return UserInDB(**new_user)

    return UserInDB(**user)
