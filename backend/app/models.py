from pydantic import BaseModel

class Professor(BaseModel):
    name: str
    field: str
    teachingMode: str
    adviceType: str

class ChatRequest(BaseModel):
    message: str
    model_type: str
    professor: Professor
    enable_search: bool = False  # New field to toggle web search
