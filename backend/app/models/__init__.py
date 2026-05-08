from datetime import datetime
from typing import Any, List, Optional

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field, GetCoreSchemaHandler, GetJsonSchemaHandler, computed_field, model_serializer
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema


class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type: Any, handler: GetCoreSchemaHandler):
        return core_schema.no_info_plain_validator_function(
            cls.validate,
            serialization=core_schema.plain_serializer_function_ser_schema(str),
        )

    @classmethod
    def __get_pydantic_json_schema__(cls, schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler) -> JsonSchemaValue:
        return {"type": "string"}

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        if isinstance(v, ObjectId):
            return v
        return ObjectId(v)


class EventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1)
    description: str = Field(..., max_length=500)
    location: str = Field(..., min_length=1, max_length=200)
    date_time: datetime
    max_capacity: Optional[int] = Field(None, gt=0)
    course: Optional[str] = None


class EventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[str] = None
    description: Optional[str] = Field(None, max_length=500)
    location: Optional[str] = Field(None, min_length=1, max_length=200)
    date: Optional[datetime] = None
    max_attendees: Optional[int] = Field(None, gt=0)


class EventInDB(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str
    category: str = ""
    course: Optional[str] = None
    description: str
    location: str
    date: datetime
    max_attendees: Optional[int] = None
    attendees: List[str] = Field(default_factory=list)
    organizer_email: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )

    @model_serializer(mode="wrap")
    def _serialize(self, handler):
        data = handler(self)
        # Expose the document id under both keys so frontend code that reads
        # `event.id` and `event._id` both work without coupling to FastAPI's
        # by_alias serialization default.
        if "_id" in data and "id" not in data:
            data["id"] = data["_id"]
        elif "id" in data and "_id" not in data:
            data["_id"] = data["id"]
        return data

    # Extra fields EventCard expects
    @computed_field
    @property
    def name(self) -> str:
        return self.title

    @computed_field
    @property
    def time(self) -> str:
        return self.date.strftime("%I:%M %p")

    @computed_field
    @property
    def rsvpCount(self) -> int:
        return len(self.attendees)

    @computed_field
    @property
    def rsvpCap(self) -> Optional[int]:
        return self.max_attendees

    # EventDetails uses event.tags
    @computed_field
    @property
    def tags(self) -> List[str]:
        return [self.category] if self.category else []


def _rank_info(total_events: int) -> dict:
    if total_events >= 20:
        return {"rank": "platinum", "rankBadge": "platinum", "rankProgress": 100}
    elif total_events >= 10:
        progress = int(((total_events - 10) / 10) * 100)
        return {"rank": "gold", "rankBadge": "gold", "rankProgress": progress}
    elif total_events >= 5:
        progress = int(((total_events - 5) / 5) * 100)
        return {"rank": "silver", "rankBadge": "silver", "rankProgress": progress}
    else:
        progress = int((total_events / 5) * 100)
        return {"rank": "bronze", "rankBadge": "bronze", "rankProgress": progress}


class UserBase(BaseModel):
    email: str
    name: str


class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    events_attending: List[str] = Field(default_factory=list)
    events_created: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )

    @computed_field
    @property
    def rank(self) -> str:
        return _rank_info(len(self.events_attending) + len(self.events_created))["rank"]

    @computed_field
    @property
    def rankBadge(self) -> str:
        return _rank_info(len(self.events_attending) + len(self.events_created))["rankBadge"]

    @computed_field
    @property
    def rankProgress(self) -> int:
        return _rank_info(len(self.events_attending) + len(self.events_created))["rankProgress"]
