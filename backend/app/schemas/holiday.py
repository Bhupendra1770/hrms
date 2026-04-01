from datetime import date
from pydantic import BaseModel, ConfigDict


class HolidayBase(BaseModel):
    name: str
    holiday_date: date
    description: str | None = None


class HolidayCreate(HolidayBase):
    pass


class HolidayUpdate(BaseModel):
    name: str | None = None
    holiday_date: date | None = None
    description: str | None = None


class HolidayResponse(HolidayBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
