from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_employee, get_current_user, require_admin
from app.db.deps import get_db
from app.models.leave_request import LeaveRequest
from app.models.user import User
from app.schemas.leave_request import LeaveRequestCreate, LeaveRequestResponse, LeaveStatusUpdate

router = APIRouter(prefix='/leaves', tags=['Leaves'])


@router.get('', response_model=list[LeaveRequestResponse])
def list_leave_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(LeaveRequest)
    if current_user.role != 'admin':
        employee = current_user.employee
        if not employee:
            return []
        query = query.filter(LeaveRequest.employee_id == employee.id)
    return query.order_by(LeaveRequest.created_at.desc()).all()


@router.post('', response_model=LeaveRequestResponse)
def create_leave_request(payload: LeaveRequestCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = payload.model_dump()
    if current_user.role != 'admin':
        if not current_user.employee:
            raise HTTPException(status_code=404, detail='Employee not found')
        data['employee_id'] = current_user.employee.id

    leave_request = LeaveRequest(**data)
    db.add(leave_request)
    db.commit()
    db.refresh(leave_request)
    return leave_request


@router.patch('/{leave_id}/status', response_model=LeaveRequestResponse)
def update_leave_status(leave_id: int, payload: LeaveStatusUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    leave_request = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave_request:
        raise HTTPException(status_code=404, detail='Leave request not found')

    leave_request.status = payload.status
    db.commit()
    db.refresh(leave_request)
    return leave_request


@router.delete('/{leave_id}')
def delete_leave_request(leave_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    leave_request = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave_request:
        raise HTTPException(status_code=404, detail='Leave request not found')
    if current_user.role != 'admin':
        if not current_user.employee or leave_request.employee_id != current_user.employee.id:
            raise HTTPException(status_code=403, detail='Not allowed to delete this leave request')
        if leave_request.status != 'pending':
            raise HTTPException(status_code=400, detail='Only pending leave requests can be deleted')
    db.delete(leave_request)
    db.commit()
    return {'message': 'Leave request deleted successfully'}
