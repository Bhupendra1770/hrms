from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AnnouncementBase(BaseModel):
    title: str
    content: str
    priority: str = 'normal'


class AnnouncementCreate(AnnouncementBase):
    pass


class AnnouncementUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    priority: str | None = None


class AnnouncementResponse(AnnouncementBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
