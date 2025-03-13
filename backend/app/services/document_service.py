import os
import time
import uuid
import PyPDF2
import io
import pdfplumber
from fastapi import UploadFile, HTTPException
from ..config.settings import UPLOAD_DIR, documents_db

async def process_document_upload(file: UploadFile = None, youtube_url: str = None, title: str = None, description: str = None):
    """
    Process a document upload or YouTube URL addition.
    
    Args:
        file: Uploaded file
        youtube_url: YouTube URL
        title: Document title
        description: Document description
        
    Returns:
        Document info
    """
    try:
        document_id = str(uuid.uuid4())
        
        if file and file.filename:
            # Handle file upload
            file_extension = os.path.splitext(file.filename)[1].lower()
            allowed_extensions = ['.pdf', '.docx', '.doc', '.txt', '.ppt', '.pptx', '.xls', '.xlsx']
            
            if file_extension not in allowed_extensions:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Unsupported file type. Allowed types: {', '.join(allowed_extensions)}"
                )
            
            # Save the file
            safe_filename = f"{document_id}{file_extension}"
            file_path = os.path.join(UPLOAD_DIR, safe_filename)
            
            with open(file_path, "wb") as buffer:
                buffer.write(await file.read())
            
            # Process different file types
            content_preview = ""
            if file_extension == '.pdf':
                # Extract first few pages as preview
                try:
                    with pdfplumber.open(file_path) as pdf:
                        for i, page in enumerate(pdf.pages[:3]):  # First 3 pages
                            if i == 0:  # Use first page for title if not provided
                                extracted_text = page.extract_text() or ""
                                if not title and extracted_text:
                                    # Extract first line as title if not provided
                                    first_line = extracted_text.split('\n')[0][:100]
                                    title = first_line or "Untitled PDF"
                            
                            page_text = page.extract_text() or ""
                            content_preview += f"Page {i+1}:\n{page_text[:300]}...\n\n"
                except Exception as e:
                    content_preview = f"Could not extract PDF preview: {str(e)}"
            elif file_extension in ['.docx', '.doc']:
                content_preview = "Word document uploaded (preview not available)"
            elif file_extension == '.txt':
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content_preview = f.read(500) + "..."
            else:
                content_preview = f"{file_extension.upper()[1:]} file uploaded"
            
            # Use filename as title if not provided
            if not title:
                title = os.path.splitext(file.filename)[0]
                
            document_info = {
                "document_id": document_id,
                "filename": file.filename,
                "file_path": file_path,
                "title": title or "Untitled Document",
                "description": description or "No description provided",
                "content_preview": content_preview,
                "upload_time": time.time(),
                "type": "file"
            }
            
            documents_db.append(document_info)
            
            return {
                "document_id": document_id,
                "filename": file.filename,
                "file_path": file_path,
                "title": title or "Untitled Document",
                "description": description or "No description provided",
                "message": "File uploaded successfully"
            }
            
        elif youtube_url:
            # Handle YouTube URL processing
            # This would typically involve YouTube transcript extraction
            # For now, we'll just store the URL
            
            if not title:
                title = f"YouTube Resource: {youtube_url.split('?v=')[-1]}"
                
            document_info = {
                "document_id": document_id,
                "filename": "youtube_video",
                "file_path": youtube_url,  # Store the URL as the path
                "title": title,
                "description": description or "YouTube video resource",
                "content_preview": f"YouTube video: {youtube_url}",
                "upload_time": time.time(),
                "type": "youtube"
            }
            
            documents_db.append(document_info)
            
            return {
                "document_id": document_id,
                "filename": "youtube_video",
                "file_path": youtube_url,
                "title": title,
                "description": description or "YouTube video resource",
                "message": "YouTube URL processed successfully"
            }
        else:
            raise HTTPException(status_code=400, detail="No file or YouTube URL provided")
    
    except Exception as e:
        print(f"Error in document upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

def get_all_documents():
    """Get all documents from the database"""
    return {"documents": documents_db}

def get_document_by_id(document_id: str):
    """Get a specific document by ID"""
    document = next((doc for doc in documents_db if doc["document_id"] == document_id), None)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

async def add_to_rag(file_content, filename):
    """Add document content to RAG system for retrieval"""
    try:
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        from langchain.embeddings import OpenAIEmbeddings
        from ..config.settings import PINECONE_API_KEY, INDEX_NAME
        
        # Only attempt to use Pinecone if the API key is available
        if PINECONE_API_KEY and INDEX_NAME:
            from pinecone import Pinecone
            
            # Initialize Pinecone
            pc = Pinecone(api_key=PINECONE_API_KEY)
            index = pc.Index(INDEX_NAME)
            
            # Initialize embedder
            embedder = OpenAIEmbeddings()
            
            # Extract text from PDF
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            text = "\n".join([page.extract_text() for page in pdf_reader.pages if page.extract_text()])
            
            # Split text into chunks
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
            chunks = text_splitter.split_text(text)
            
            # Create embeddings
            embeddings = embedder.embed_documents(chunks)
            
            # Prepare data for upsert
            upsert_data = [
                (str(uuid.uuid4()), embedding, {"text": chunk, "source": filename})
                for chunk, embedding in zip(chunks, embeddings)
            ]
            
            # Upsert to Pinecone
            index.upsert(upsert_data)
            
            return {"message": f"Added {len(chunks)} chunks from {filename} to RAG"}
        else:
            return {"message": "Pinecone API key or index name not configured - skipping RAG update"}
            
    except Exception as e:
        print(f"Error adding to RAG: {str(e)}")
        return {"message": f"Error adding to RAG: {str(e)}"} 