from datetime import date, datetime
from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Employee(Base):
    __tablename__ = 'employees'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    employee_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    job_title: Mapped[str] = mapped_column(String(120), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    hire_date: Mapped[date] = mapped_column(Date, nullable=False)
    salary: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default='active')
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), unique=True, nullable=False)
    department_id: Mapped[int | None] = mapped_column(ForeignKey('departments.id'), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship('User', back_populates='employee')
    department = relationship('Department', back_populates='employees')
    attendances = relationship('Attendance', back_populates='employee', cascade='all, delete-orphan')
    leave_requests = relationship('LeaveRequest', back_populates='employee', cascade='all, delete-orphan')
