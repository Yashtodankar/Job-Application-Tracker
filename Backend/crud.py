from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional
import models, schemas

def get_applications(db: Session, status: Optional[str] = None, search: Optional[str] = None):
    q = db.query(models.Application)
    if status:
        q = q.filter(models.Application.status == status)
    if search:
        like = f"%{search}%"
        q = q.filter(
            or_(
                models.Application.company.ilike(like),
                models.Application.position.ilike(like),
                models.Application.location.ilike(like),
            )
        )
    return q.order_by(models.Application.created_at.desc()).all()

def get_application(db: Session, app_id: int):
    return db.query(models.Application).filter(models.Application.id == app_id).first()

def create_application(db: Session, payload: schemas.ApplicationCreate):
    obj = models.Application(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def update_application(db: Session, app_id: int, payload: schemas.ApplicationUpdate):
    obj = get_application(db, app_id)
    if not obj:
        return None
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj

def delete_application(db: Session, app_id: int):
    obj = get_application(db, app_id)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True

def update_resume_path(db: Session, app_id: int, path: Optional[str]):
    obj = get_application(db, app_id)
    if not obj:
        return None
    obj.resume_path = path
    db.commit()
    db.refresh(obj)
    return obj

def get_stats(db: Session):
    total = db.query(func.count(models.Application.id)).scalar()
    by_status = (
        db.query(models.Application.status, func.count(models.Application.id))
        .group_by(models.Application.status)
        .all()
    )
    status_map = {s: c for s, c in by_status}
    recent = (
        db.query(models.Application)
        .order_by(models.Application.created_at.desc())
        .limit(5)
        .all()
    )
    return {
        "total": total,
        "applied":   status_map.get("Applied", 0),
        "interview": status_map.get("Interview", 0),
        "offer":     status_map.get("Offer", 0),
        "rejected":  status_map.get("Rejected", 0),
        "recent": [
            {"id": r.id, "company": r.company, "position": r.position, "status": r.status}
            for r in recent
        ],
    }

def get_applications_over_time(db: Session):
    results = (
        db.query(
            func.strftime("%Y-%m", models.Application.applied_date).label("month"),
            func.count(models.Application.id).label("count")
        )
        .filter(models.Application.applied_date != None)
        .group_by(func.strftime("%Y-%m", models.Application.applied_date))
        .order_by("month")
        .all()
    )
    return [{"month": r.month, "count": r.count} for r in results]

def get_top_companies(db: Session, limit: int = 5):
    results = (
        db.query(
            models.Application.company,
            func.count(models.Application.id).label("count")
        )
        .group_by(models.Application.company)
        .order_by(func.count(models.Application.id).desc())
        .limit(limit)
        .all()
    )
    return [{"company": r.company, "count": r.count} for r in results]


# ─── Interview CRUD ──────────────────────────────────────────

def get_interviews(db: Session):
    results = (
        db.query(models.Interview, models.Application.company, models.Application.position)
        .join(models.Application, models.Interview.application_id == models.Application.id)
        .order_by(models.Interview.interview_date.asc())
        .all()
    )
    interviews = []
    for interview, company, position in results:
        item = interview.__dict__.copy()
        item["company"] = company
        item["position"] = position
        interviews.append(item)
    return interviews

def get_interview(db: Session, interview_id: int):
    return db.query(models.Interview).filter(models.Interview.id == interview_id).first()

def get_interviews_by_application(db: Session, app_id: int):
    return db.query(models.Interview).filter(models.Interview.application_id == app_id).all()

def create_interview(db: Session, payload: schemas.InterviewCreate):
    obj = models.Interview(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def update_interview(db: Session, interview_id: int, payload: schemas.InterviewUpdate):
    obj = get_interview(db, interview_id)
    if not obj:
        return None
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj

def delete_interview(db: Session, interview_id: int):
    obj = get_interview(db, interview_id)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True