from datetime import date, datetime, time
from pydantic import BaseModel


class AttendanceCreate(BaseModel):
    employee_id: int
    attendance_date: date
    check_in: time | None = None
    check_out: time | None = None


class AttendanceResponse(BaseModel):
    id: int
    employee_id: int
    attendance_date: date
    check_in: time | None = None
    check_out: time | None = None
    created_at: datetime

    model_config = {'from_attributes': True}
