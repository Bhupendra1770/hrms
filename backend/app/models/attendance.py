from datetime import date, datetime, time
from sqlalchemy import Date, DateTime, ForeignKey, Integer, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Attendance(Base):
    __tablename__ = 'attendance'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey('employees.id'), nullable=False)
    attendance_date: Mapped[date] = mapped_column(Date, nullable=False)
    check_in: Mapped[time | None] = mapped_column(Time, nullable=True)
    check_out: Mapped[time | None] = mapped_column(Time, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    employee = relationship('Employee', back_populates='attendances')
