from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_admin
from app.db.deps import get_db
from app.models.department import Department
from app.models.user import User
from app.schemas.department import DepartmentCreate, DepartmentResponse

router = APIRouter(prefix='/departments', tags=['Departments'])


@router.get('', response_model=list[DepartmentResponse])
def list_departments(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Department).order_by(Department.name.asc()).all()


@router.post('', response_model=DepartmentResponse)
def create_department(payload: DepartmentCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    existing = db.query(Department).filter(Department.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail='Department already exists')

    department = Department(**payload.model_dump())
    db.add(department)
    db.commit()
    db.refresh(department)
    return department
