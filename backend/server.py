from fastapi import FastAPI, APIRouter, HTTPException, File, UploadFile
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import base64
import io

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Audio Project Models
class AudioTrack(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    audio_data: str  # base64 encoded audio data
    duration: float
    volume: float = 1.0
    pan: float = 0.0  # -1 (left) to 1 (right)
    muted: bool = False
    solo: bool = False
    effects: List[dict] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AudioProject(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    tempo: int = 120
    tracks: List[AudioTrack] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TrackCreate(BaseModel):
    name: str
    audio_data: str
    duration: float

class ProjectCreate(BaseModel):
    name: str
    tempo: Optional[int] = 120

class TrackUpdate(BaseModel):
    name: Optional[str] = None
    volume: Optional[float] = None
    pan: Optional[float] = None
    muted: Optional[bool] = None
    solo: Optional[bool] = None
    effects: Optional[List[dict]] = None

# Project endpoints
@api_router.post("/projects", response_model=AudioProject)
async def create_project(project_data: ProjectCreate):
    """Create a new DAW project"""
    project = AudioProject(
        name=project_data.name,
        tempo=project_data.tempo or 120
    )
    await db.projects.insert_one(project.dict())
    return project

@api_router.get("/projects", response_model=List[AudioProject])
async def get_projects():
    """Get all DAW projects"""
    projects = await db.projects.find().to_list(1000)
    return [AudioProject(**project) for project in projects]

@api_router.get("/projects/{project_id}", response_model=AudioProject)
async def get_project(project_id: str):
    """Get a specific project by ID"""
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return AudioProject(**project)

@api_router.put("/projects/{project_id}", response_model=AudioProject)
async def update_project(project_id: str, update_data: dict):
    """Update project details"""
    update_data["updated_at"] = datetime.utcnow()
    result = await db.projects.update_one(
        {"id": project_id}, 
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = await db.projects.find_one({"id": project_id})
    return AudioProject(**project)

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    """Delete a project"""
    result = await db.projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}

# Track endpoints
@api_router.post("/projects/{project_id}/tracks", response_model=AudioTrack)
async def add_track_to_project(project_id: str, track_data: TrackCreate):
    """Add a new audio track to a project"""
    # Create new track
    track = AudioTrack(
        name=track_data.name,
        audio_data=track_data.audio_data,
        duration=track_data.duration
    )
    
    # Add track to project
    result = await db.projects.update_one(
        {"id": project_id},
        {"$push": {"tracks": track.dict()}, "$set": {"updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return track

@api_router.put("/projects/{project_id}/tracks/{track_id}", response_model=AudioTrack)
async def update_track(project_id: str, track_id: str, update_data: TrackUpdate):
    """Update track properties (volume, pan, mute, solo, etc.)"""
    update_dict = {f"tracks.$.{k}": v for k, v in update_data.dict(exclude_unset=True).items()}
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.projects.update_one(
        {"id": project_id, "tracks.id": track_id},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project or track not found")
    
    # Get updated track
    project = await db.projects.find_one({"id": project_id})
    track = next((t for t in project["tracks"] if t["id"] == track_id), None)
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    
    return AudioTrack(**track)

@api_router.delete("/projects/{project_id}/tracks/{track_id}")
async def delete_track(project_id: str, track_id: str):
    """Delete a track from project"""
    result = await db.projects.update_one(
        {"id": project_id},
        {"$pull": {"tracks": {"id": track_id}}, "$set": {"updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project or track not found")
    
    return {"message": "Track deleted successfully"}

# Audio processing endpoints
@api_router.post("/audio/process")
async def process_audio(audio_data: str, effects: List[dict]):
    """Apply effects to audio data (placeholder for future audio processing)"""
    # This is a placeholder - in a real DAW, you'd process the audio with the specified effects
    # For now, we'll just return the original audio data
    return {"processed_audio": audio_data, "effects_applied": effects}

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "DAW API Ready", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()