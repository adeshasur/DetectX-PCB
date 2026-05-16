from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from pydantic import BaseModel
from typing import List, Optional
import os

app = FastAPI(title="DetectX-PCB AI API")

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
    # Placeholder for AI logic
    # In a real scenario, we would pass 'file' to the YOLOv8 model
    return DetectionResult(
        board_id="PCB-789-XYZ",
        defects=[
            Defect(id="D-001", type="Short Circuit", confidence=0.98, bbox=[120.5, 45.2, 10.0, 5.5])
        ],
        status="DEFECTIVE",
        processing_time=0.045
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
