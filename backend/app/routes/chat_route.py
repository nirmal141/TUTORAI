from fastapi import APIRouter, HTTPException
from ..services.chat_service import process_chat_request
from ..models import ChatRequest

router = APIRouter()

@router.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        print("entered here")
        response_data = await process_chat_request(request)
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
