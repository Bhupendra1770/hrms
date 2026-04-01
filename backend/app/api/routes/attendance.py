from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_employee, get_current_user, require_admin
from app.db.deps import get_db
from app.models.attendance import Attendance
from app.models.employee import Employee
from app.models.user import User
from app.schemas.attendance import AttendanceCreate, AttendanceResponse

router = APIRouter(prefix='/attendance', tags=['Attendance'])


@router.get('', response_model=list[AttendanceResponse])
def list_attendance(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Attendance)
    if current_user.role != 'admin':
        employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if not employee:
            return []
        query = query.filter(Attendance.employee_id == employee.id)
    return query.order_by(Attendance.attendance_date.desc(), Attendance.id.desc()).all()


@router.post('', response_model=AttendanceResponse)
def create_attendance(payload: AttendanceCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    employee = db.query(Employee).filter(Employee.id == payload.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail='Employee not found')

    attendance = Attendance(**payload.model_dump())
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance
