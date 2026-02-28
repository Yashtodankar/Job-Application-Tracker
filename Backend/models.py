from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Application(Base):
    __tablename__ = "applications"

    id           = Column(Integer, primary_key=True, index=True)
    company      = Column(String(150), nullable=False)
    position     = Column(String(150), nullable=False)
    location     = Column(String(150), nullable=True)
    status       = Column(String(50), default="Applied")
    applied_date = Column(Date, nullable=True)
    salary       = Column(String(80), nullable=True)
    job_url      = Column(String(500), nullable=True)
    notes        = Column(Text, nullable=True)
    resume_path  = Column(String(500), nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())

    interviews   = relationship("Interview", back_populates="application", cascade="all, delete-orphan")


class Interview(Base):
    __tablename__ = "interviews"

    id                  = Column(Integer, primary_key=True, index=True)
    application_id      = Column(Integer, ForeignKey("applications.id"), nullable=False)
    interview_date      = Column(Date, nullable=False)
    interview_time      = Column(String(10), nullable=True)
    interview_type      = Column(String(50), nullable=True)
    interviewer_name    = Column(String(150), nullable=True)
    interviewer_contact = Column(String(200), nullable=True)
    notes               = Column(Text, nullable=True)
    created_at          = Column(DateTime(timezone=True), server_default=func.now())

    application = relationship("Application", back_populates="interviews")
