from datetime import date, datetime
from pydantic import BaseModel, EmailStr

from app.schemas.department import DepartmentResponse
from app.schemas.user import UserResponse


class EmployeeCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = 'employee'
    employee_code: str
    job_title: str
    phone: str | None = None
    address: str | None = None
    hire_date: date
    salary: float | None = None
    status: str = 'active'
    department_id: int | None = None


class EmployeeUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    role: str | None = None
    job_title: str | None = None
    phone: str | None = None
    address: str | None = None
    hire_date: date | None = None
    salary: float | None = None
    status: str | None = None
    department_id: int | None = None
    is_active: bool | None = None


class EmployeeResponse(BaseModel):
    id: int
    employee_code: str
    job_title: str
    phone: str | None = None
    address: str | None = None
    hire_date: date
    salary: float | None = None
    status: str
    created_at: datetime
    user: UserResponse
    department: DepartmentResponse | None = None

    model_config = {'from_attributes': True}
