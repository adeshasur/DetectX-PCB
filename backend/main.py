from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from pydantic import BaseModel
from typing import List, Optional
import os
from sqlmodel import SQLModel, Field, create_engine, Session, select
from datetime import datetime
import json
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from ai.inference import DetectXInference

app = FastAPI(title="DetectX-PCB AI API")
ai_engine = DetectXInference()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static frontend files
# This allows camera access via http://localhost:8000/static/preview.html
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
app.mount("/static", StaticFiles(directory=frontend_path), name="static")

# Database Setup
sqlite_file_name = "detectx.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

class DetectionLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    board_id: str
    status: str
    processing_time: float
    defects_json: str  # Store as JSON string
    created_at: datetime = Field(default_factory=datetime.utcnow)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

class Defect(BaseModel):
    id: str
    type: str
    confidence: float
    bbox: List[float] # [x, y, w, h]

class DetectionResult(BaseModel):
    board_id: str
    defects: List[Defect]
    status: str # "CLEAN" or "DEFECTIVE"
    processing_time: float

@app.get("/")
async def root():
    return {"message": "DetectX-PCB API is running"}

@app.post("/detect", response_model=DetectionResult)
async def detect_defects(file: UploadFile = File(...)):
    # Save temp file
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        buffer.write(await file.read())
    
    # Run real inference (using the engine we imported)
    results = ai_engine.run_inference(temp_path)
    
    # Clean up
    if os.path.exists(temp_path):
        os.remove(temp_path)
    
    # Convert to Response Model
    defects = [Defect(id=f"D-{i}", type=d['class'], confidence=d['confidence'], bbox=d['bbox']) 
               for i, d in enumerate(results['defects'])]
    
    response = DetectionResult(
        board_id=results['board_id'],
        defects=defects,
        status="DEFECTIVE" if len(defects) > 0 else "CLEAN",
        processing_time=results['inference_time']
    )
    
    # Save to Database
    with Session(engine) as session:
        log = DetectionLog(
            board_id=response.board_id,
            status=response.status,
            processing_time=response.processing_time,
            defects_json=json.dumps([d.dict() for d in defects])
        )
        session.add(log)
        session.commit()
    
    return response

@app.get("/history", response_model=List[DetectionLog])
async def get_history(limit: int = 10):
    with Session(engine) as session:
        statement = select(DetectionLog).order_by(DetectionLog.created_at.desc()).limit(limit)
        results = session.exec(statement).all()
        return results

@app.get("/stats")
async def get_stats():
    with Session(engine) as session:
        total = session.exec(select(DetectionLog)).all()
        defects = [l for l in total if l.status == "DEFECTIVE"]
        
        yield_rate = ((len(total) - len(defects)) / len(total) * 100) if len(total) > 0 else 100
        
        return {
            "total_inspected": len(total),
            "defects_found": len(defects),
            "yield_rate": yield_rate,
            "avg_inference_time": (sum(l.processing_time for l in total)/len(total)*1000) if len(total) > 0 else 0
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
