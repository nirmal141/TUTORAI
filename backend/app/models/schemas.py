from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class Professor(BaseModel):
    name: str
    field: str
    teachingMode: str
    adviceType: str

class ProfessorAvailability(BaseModel):
    professor_name: str
    date: str
    start_time: str
    end_time: str
    meeting_link: Optional[str] = None
    is_booked: bool = False
    
class MeetingBooking(BaseModel):
    availability_id: str
    student_name: str
    student_email: str
    topic: str
    questions: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    model_type: str
    professor: Professor
    enable_search: bool = False  # Toggle web search
    
class YoutubeChatRequest(BaseModel):
    youtube_url: str
    video_title: str = "Educational Video"
    message: str
    previous_messages: list = []

class DocumentChatRequest(BaseModel):
    document_id: str
    document_url: str
    document_title: str
    message: str
    previous_messages: list = []

class DocumentResponse(BaseModel):
    document_id: str
    filename: str
    file_path: str
    title: str
    description: str
    message: str 