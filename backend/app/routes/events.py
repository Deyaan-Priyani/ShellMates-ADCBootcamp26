from datetime import datetime
from typing import List

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.db.mongo import db
from app.middleware.firebase_auth import verify_token
from app.models import EventCreate, EventInDB, EventUpdate

router = APIRouter()


def _to_object_id(object_id: str) -> ObjectId:
    try:
        return ObjectId(object_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid event id")


@router.get("/", response_model=List[EventInDB])
async def get_events():
    events = []
    async for event in db.events.find():
        events.append(EventInDB(**event))
    return events


@router.get("/{event_id}", response_model=EventInDB)
async def get_event(event_id: str):
    event = await db.events.find_one({"_id": _to_object_id(event_id)})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return EventInDB(**event)


@router.post("/", response_model=EventInDB)
async def create_event(event: EventCreate, user_data: dict = Depends(verify_token)):
    event_dict = event.dict()
    event_dict["organizer_email"] = user_data["email"]
    event_dict["attendees"] = []
    event_dict["created_at"] = datetime.utcnow()
    event_dict["updated_at"] = datetime.utcnow()

    result = await db.events.insert_one(event_dict)
    created = await db.events.find_one({"_id": result.inserted_id})

    await db.users.update_one(
        {"email": user_data["email"]},
        {"$push": {"events_created": str(result.inserted_id)}},
        upsert=True,
    )

    return EventInDB(**created)


@router.put("/{event_id}", response_model=EventInDB)
async def update_event(event_id: str, event_update: EventUpdate, user_data: dict = Depends(verify_token)):
    existing_event = await db.events.find_one({"_id": _to_object_id(event_id)})
    if not existing_event:
        raise HTTPException(status_code=404, detail="Event not found")
    if existing_event["organizer_email"] != user_data["email"]:
        raise HTTPException(status_code=403, detail="Only the organizer can update this event")

    update_data = event_update.dict(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    update_data["updated_at"] = datetime.utcnow()

    await db.events.update_one({"_id": _to_object_id(event_id)}, {"$set": update_data})
    updated_event = await db.events.find_one({"_id": _to_object_id(event_id)})
    return EventInDB(**updated_event)


@router.delete("/{event_id}")
async def delete_event(event_id: str, user_data: dict = Depends(verify_token)):
    existing_event = await db.events.find_one({"_id": _to_object_id(event_id)})
    if not existing_event:
        raise HTTPException(status_code=404, detail="Event not found")
    if existing_event["organizer_email"] != user_data["email"]:
        raise HTTPException(status_code=403, detail="Only the organizer can delete this event")

    await db.events.delete_one({"_id": _to_object_id(event_id)})
    await db.users.update_one(
        {"email": user_data["email"]},
        {"$pull": {"events_created": event_id}},
    )
    return {"message": "Event deleted successfully"}


@router.post("/{event_id}/attend")
async def attend_event(event_id: str, user_data: dict = Depends(verify_token)):
    event = await db.events.find_one({"_id": _to_object_id(event_id)})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if user_data["email"] in event.get("attendees", []):
        raise HTTPException(status_code=400, detail="Already attending this event")
    if event.get("max_attendees") and len(event.get("attendees", [])) >= event["max_attendees"]:
        raise HTTPException(status_code=400, detail="Event is full")

    await db.events.update_one(
        {"_id": _to_object_id(event_id)},
        {"$push": {"attendees": user_data["email"]}},
    )
    await db.users.update_one(
        {"email": user_data["email"]},
        {"$push": {"events_attending": event_id}},
        upsert=True,
    )
    return {"message": "Successfully registered for event"}


@router.delete("/{event_id}/attend")
async def unattend_event(event_id: str, user_data: dict = Depends(verify_token)):
    event = await db.events.find_one({"_id": _to_object_id(event_id)})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if user_data["email"] not in event.get("attendees", []):
        raise HTTPException(status_code=400, detail="Not attending this event")

    await db.events.update_one(
        {"_id": _to_object_id(event_id)},
        {"$pull": {"attendees": user_data["email"]}},
    )
    await db.users.update_one(
        {"email": user_data["email"]},
        {"$pull": {"events_attending": event_id}},
    )
    return {"message": "Successfully unregistered from event"}