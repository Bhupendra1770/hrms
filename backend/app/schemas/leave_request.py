from datetime import date, datetime
from pydantic import BaseModel


class LeaveRequestCreate(BaseModel):
    employee_id: int
    leave_type: str
    start_date: date
    end_date: date
    reason: str | None = None


class LeaveStatusUpdate(BaseModel):
    status: str


class LeaveRequestResponse(BaseModel):
    id: int
    employee_id: int
    leave_type: str
    start_date: date
    end_date: date
    reason: str | None = None
    status: str
    created_at: datetime

    model_config = {'from_attributes': True}
