from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.api.dependencies import get_current_user, require_admin
from app.core.security import hash_password
from app.db.deps import get_db
from app.models.employee import Employee
from app.models.user import User
from app.schemas.employee import EmployeeCreate, EmployeeResponse, EmployeeUpdate

router = APIRouter(prefix='/employees', tags=['Employees'])


@router.get('', response_model=list[EmployeeResponse])
def list_employees(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Employee).options(joinedload(Employee.user), joinedload(Employee.department))
    if current_user.role != 'admin':
        query = query.filter(Employee.user_id == current_user.id)
    return query.order_by(Employee.id.desc()).all()


@router.post('', response_model=EmployeeResponse)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail='Email already registered')
    if db.query(Employee).filter(Employee.employee_code == payload.employee_code).first():
        raise HTTPException(status_code=400, detail='Employee code already exists')

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        is_active=True,
    )
    db.add(user)
    db.flush()

    employee = Employee(
        employee_code=payload.employee_code,
        job_title=payload.job_title,
        phone=payload.phone,
        address=payload.address,
        hire_date=payload.hire_date,
        salary=payload.salary,
        status=payload.status,
        user_id=user.id,
        department_id=payload.department_id,
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return (
        db.query(Employee)
        .options(joinedload(Employee.user), joinedload(Employee.department))
        .filter(Employee.id == employee.id)
        .first()
    )


@router.put('/{employee_id}', response_model=EmployeeResponse)
def update_employee(employee_id: int, payload: EmployeeUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    employee = db.query(Employee).options(joinedload(Employee.user), joinedload(Employee.department)).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail='Employee not found')

    is_admin = current_user.role == 'admin'
    is_self = employee.user_id == current_user.id
    if not (is_admin or is_self):
        raise HTTPException(status_code=403, detail='Not allowed to modify this employee')

    data = payload.model_dump(exclude_unset=True)

    if is_admin:
        user_fields = {'full_name', 'email', 'role', 'is_active'}
        for key, value in list(data.items()):
            if key in user_fields:
                setattr(employee.user, key, value)
                data.pop(key)
    else:
        allowed = {'full_name', 'phone', 'address'}
        for key in list(data.keys()):
            if key not in allowed:
                data.pop(key)
        if 'full_name' in payload.model_dump(exclude_unset=True):
            employee.user.full_name = payload.full_name
            data.pop('full_name', None)

    for key, value in data.items():
        setattr(employee, key, value)

    db.commit()
    db.refresh(employee)
    return employee


@router.delete('/{employee_id}')
def delete_employee(employee_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail='Employee not found')

    user = db.query(User).filter(User.id == employee.user_id).first()
    db.delete(employee)
    if user:
        db.delete(user)
    db.commit()
    return {'message': 'Employee deleted successfully'}
