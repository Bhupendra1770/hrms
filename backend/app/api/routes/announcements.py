from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_admin
from app.db.deps import get_db
from app.models.announcement import Announcement
from app.models.user import User
from app.schemas.announcement import AnnouncementCreate, AnnouncementResponse, AnnouncementUpdate

router = APIRouter(prefix='/announcements', tags=['Announcements'])


@router.get('', response_model=list[AnnouncementResponse])
def list_announcements(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Announcement).order_by(Announcement.created_at.desc()).all()


@router.post('', response_model=AnnouncementResponse)
def create_announcement(payload: AnnouncementCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    announcement = Announcement(**payload.model_dump())
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement


@router.put('/{announcement_id}', response_model=AnnouncementResponse)
def update_announcement(announcement_id: int, payload: AnnouncementUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail='Announcement not found')
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(announcement, key, value)
    db.commit()
    db.refresh(announcement)
    return announcement


@router.delete('/{announcement_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_announcement(announcement_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail='Announcement not found')

    db.delete(announcement)
    db.commit()
    return None
