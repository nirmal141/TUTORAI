from fastapi import APIRouter, HTTPException
from ..models.schemas import ChatRequest, DocumentChatRequest, YoutubeChatRequest
from ..services.chat_service import process_chat_request, process_document_chat, process_youtube_chat

router = APIRouter(prefix="/api", tags=["chat"])

@router.post("/chat")
async def chat(request: ChatRequest):
    """
    Process a chat request with an AI professor.
    """
    try:
        return await process_chat_request(
            message=request.message,
            model_type=request.model_type,
            professor=request.professor.dict(),
            enable_search=request.enable_search
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/document-chat")
async def document_chat(request: DocumentChatRequest):
    """
    Chat with an AI professor about a specific document.
    """
    try:
        return await process_document_chat(
            document_id=request.document_id,
            document_url=request.document_url,
            document_title=request.document_title,
            message=request.message,
            previous_messages=request.previous_messages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/youtube-chat")
async def youtube_chat(request: YoutubeChatRequest):
    """
    Chat with an AI professor about a YouTube video.
    """
    try:
        return await process_youtube_chat(
            youtube_url=request.youtube_url,
            video_title=request.video_title,
            message=request.message,
            previous_messages=request.previous_messages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 