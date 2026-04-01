from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_admin
from app.db.deps import get_db
from app.models.holiday import Holiday
from app.models.user import User
from app.schemas.holiday import HolidayCreate, HolidayResponse, HolidayUpdate

router = APIRouter(prefix='/holidays', tags=['Holidays'])


@router.get('', response_model=list[HolidayResponse])
def list_holidays(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Holiday).order_by(Holiday.holiday_date.asc()).all()


@router.post('', response_model=HolidayResponse)
def create_holiday(payload: HolidayCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    holiday = Holiday(**payload.model_dump())
    db.add(holiday)
    db.commit()
    db.refresh(holiday)
    return holiday


@router.put('/{holiday_id}', response_model=HolidayResponse)
def update_holiday(holiday_id: int, payload: HolidayUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    holiday = db.query(Holiday).filter(Holiday.id == holiday_id).first()
    if not holiday:
        raise HTTPException(status_code=404, detail='Holiday not found')
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(holiday, key, value)
    db.commit()
    db.refresh(holiday)
    return holiday


@router.delete('/{holiday_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_holiday(holiday_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    holiday = db.query(Holiday).filter(Holiday.id == holiday_id).first()
    if not holiday:
        raise HTTPException(status_code=404, detail='Holiday not found')

    db.delete(holiday)
    db.commit()
    return None
