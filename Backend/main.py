from fastapi import FastAPI, HTTPException, Depends, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import Optional, List
import models, schemas, crud
from routers import auth_routes
from database import SessionLocal, engine, get_db
import shutil, os

models.Base.metadata.create_all(bind=engine)

RESUME_DIR = "resumes"
os.makedirs(RESUME_DIR, exist_ok=True)

app = FastAPI(title="Job Application Tracker API", version="1.0.0")

app.include_router(auth_routes.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/resumes", StaticFiles(directory=RESUME_DIR), name="resumes")


# ─── Applications ────────────────────────────────────────────

@app.get("/api/applications", response_model=List[schemas.Application])
def list_applications(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return crud.get_applications(db, status=status, search=search)

@app.post("/api/applications", response_model=schemas.Application, status_code=201)
def create_application(payload: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    return crud.create_application(db, payload)

@app.get("/api/applications/{app_id}", response_model=schemas.Application)
def get_application(app_id: int, db: Session = Depends(get_db)):
    app = crud.get_application(db, app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app

@app.put("/api/applications/{app_id}", response_model=schemas.Application)
def update_application(app_id: int, payload: schemas.ApplicationUpdate, db: Session = Depends(get_db)):
    app = crud.update_application(db, app_id, payload)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app

@app.delete("/api/applications/{app_id}", status_code=204)
def delete_application(app_id: int, db: Session = Depends(get_db)):
    if not crud.delete_application(db, app_id):
        raise HTTPException(status_code=404, detail="Application not found")

# ─── Resume Upload ───────────────────────────────────────────

@app.post("/api/applications/{app_id}/resume")
async def upload_resume(
    app_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    app = crud.get_application(db, app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    allowed = ["application/pdf",
               "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only PDF and Word files are allowed")

    if app.resume_path and os.path.exists(app.resume_path):
        os.remove(app.resume_path)

    ext = os.path.splitext(file.filename)[1]
    filename = f"resume_{app_id}{ext}"
    filepath = os.path.join(RESUME_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    crud.update_resume_path(db, app_id, filepath)
    return {"message": "Resume uploaded successfully", "filename": filename}

@app.delete("/api/applications/{app_id}/resume", status_code=204)
def delete_resume(app_id: int, db: Session = Depends(get_db)):
    app = crud.get_application(db, app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if app.resume_path and os.path.exists(app.resume_path):
        os.remove(app.resume_path)
    crud.update_resume_path(db, app_id, None)

# ─── Statistics ──────────────────────────────────────────────

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    return crud.get_stats(db)

@app.get("/api/stats/applications-over-time")
def applications_over_time(db: Session = Depends(get_db)):
    return crud.get_applications_over_time(db)

@app.get("/api/stats/top-companies")
def top_companies(db: Session = Depends(get_db)):
    return crud.get_top_companies(db)

# ─── Interviews ──────────────────────────────────────────────

@app.get("/api/interviews")
def list_interviews(db: Session = Depends(get_db)):
    return crud.get_interviews(db)

@app.post("/api/interviews", status_code=201)
def create_interview(payload: schemas.InterviewCreate, db: Session = Depends(get_db)):
    app = crud.get_application(db, payload.application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return crud.create_interview(db, payload)

@app.get("/api/interviews/{interview_id}")
def get_interview(interview_id: int, db: Session = Depends(get_db)):
    obj = crud.get_interview(db, interview_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Interview not found")
    return obj

@app.put("/api/interviews/{interview_id}")
def update_interview(interview_id: int, payload: schemas.InterviewUpdate, db: Session = Depends(get_db)):
    obj = crud.update_interview(db, interview_id, payload)
    if not obj:
        raise HTTPException(status_code=404, detail="Interview not found")
    return obj

@app.delete("/api/interviews/{interview_id}", status_code=204)
def delete_interview(interview_id: int, db: Session = Depends(get_db)):
    if not crud.delete_interview(db, interview_id):
        raise HTTPException(status_code=404, detail="Interview not found")

@app.get("/api/applications/{app_id}/interviews")
def get_interviews_by_application(app_id: int, db: Session = Depends(get_db)):
    return crud.get_interviews_by_application(db, app_id)
