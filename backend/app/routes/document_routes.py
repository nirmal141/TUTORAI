from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from ..services.document_service import process_document_upload, get_all_documents, get_document_by_id, add_to_rag
from ..models.schemas import DocumentResponse

router = APIRouter(prefix="/api", tags=["documents"])

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(None),
    youtube_url: str = Form(None),
    title: str = Form(None),
    description: str = Form(None)
):
    """
    Upload a document for classroom use or process a YouTube URL.
    Supports PDF, DOCX, TXT, and other educational materials.
    """
    try:
        return await process_document_upload(
            file=file, 
            youtube_url=youtube_url, 
            title=title, 
            description=description
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents")
async def list_documents():
    """List all available classroom documents"""
    return get_all_documents()

@router.get("/documents/{document_id}")
async def get_document(document_id: str):
    """Get a specific document by ID"""
    return get_document_by_id(document_id)

@router.post("/add_to_rag")
async def add_document_to_rag(file: UploadFile = File(...)):
    """Add document to RAG system for retrieval"""
    contents = await file.read()
    return await add_to_rag(contents, file.filename) 