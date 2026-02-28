from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


from datetime import date, datetime
from typing import Optional

class InterviewCreate(BaseModel):
    application_id:      int
    interview_date:      date
    interview_time:      Optional[str] = None
    interview_type:      Optional[str] = None
    interviewer_name:    Optional[str] = None
    interviewer_contact: Optional[str] = None
    notes:               Optional[str] = None

class InterviewUpdate(BaseModel):
    interview_date:      Optional[date] = None
    interview_time:      Optional[str] = None
    interview_type:      Optional[str] = None
    interviewer_name:    Optional[str] = None
    interviewer_contact: Optional[str] = None
    notes:               Optional[str] = None

class ApplicationBase(BaseModel):
    company:      str
    position:     str
    location:     Optional[str] = None
    status:       Optional[str] = "Applied"
    applied_date: Optional[date] = None
    salary:       Optional[str] = None
    job_url:      Optional[str] = None
    notes:        Optional[str] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    company:      Optional[str] = None
    position:     Optional[str] = None
    location:     Optional[str] = None
    status:       Optional[str] = None
    applied_date: Optional[date] = None
    salary:       Optional[str] = None
    job_url:      Optional[str] = None
    notes:        Optional[str] = None

class Application(ApplicationBase):
    id:          int
    resume_path: Optional[str] = None   # 👈 NEW LINE
    created_at:  Optional[datetime] = None
    updated_at:  Optional[datetime] = None

    class Config:
        from_attributes = True

# ——— Auth Schemas ———
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str