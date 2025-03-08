import os
import uuid
import io
import json
import tempfile
import random
import string
import asyncio
import re
from typing import Optional, AsyncGenerator, Dict, Any

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import requests
import httpx
from dotenv import load_dotenv

from urllib.parse import urlparse
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS

import PyPDF2
import pdfplumber

from pinecone import Pinecone
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings  # Change this if using a different embedding model
from openai import OpenAI


load_dotenv()

app = FastAPI()

# More specific CORS configuration
origins = [
    "http://localhost:3173",    # Vite's default dev server
    "http://127.0.0.1:3173",
    "http://localhost:3000",    # Alternative React port
    "http://127.0.0.1:3000",
    "http://localhost:5173",    # Vite's actual default port
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex="https?://localhost:.*",  # Allow any localhost port
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    max_age=86400,  # Cache preflight requests for 24 hours
)

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
    enable_search: bool = False  # New field to toggle web search
    
# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# LM Studio typically runs on localhost:1234
LM_STUDIO_URL = "http://127.0.0.1:1234/v1/chat/completions"
LM_STUDIO_HEADERS = {
    "Content-Type": "application/json"
}

# Initialize pinecone
pc = Pinecone(
    api_key=os.getenv("PINECONE_API_KEY")
)
index = pc.Index(os.getenv("INDEX_NAME"))
embedder = OpenAIEmbeddings()

async def get_web_search_results(query: str, professor: dict, num_results: int = 5):
    try:
        ddgs = DDGS()
        
        # Create specialized search queries based on professor's field and name
        academic_queries = [
            f"{professor['name']} {professor['field']} {query}",  # Professor-specific search
            f"{query} {professor['field']} research papers",      # Field-specific papers
            f"{professor['name']} github {professor['field']}",   # GitHub/code repositories
            f"{professor['name']} academic publications",         # Academic publications
            f"{query} {professor['field']} educational resources" # General field resources
        ]
        
        all_results = []
        formatted_results = []
        search_context = "Relevant academic and research sources:\n\n"
        
        # Perform multiple targeted searches
        for specialized_query in academic_queries:
            results = list(ddgs.text(specialized_query, max_results=3))
            
            # Process each result with BeautifulSoup
            for result in results:
                try:
                    if result.get('href'):
                        # Fetch the webpage content
                        response = requests.get(result['href'], timeout=5)
                        soup = BeautifulSoup(response.text, 'html.parser')
                        
                        # Extract more detailed information
                        title = soup.title.string if soup.title else result.get('title', 'No title')
                        
                        # Try to get meta description
                        meta_desc = soup.find('meta', {'name': 'description'})
                        description = meta_desc['content'] if meta_desc else result.get('body', 'No description available')
                        
                        # Extract main content (customize based on common academic sites)
                        main_content = soup.find('main') or soup.find('article') or soup.find('div', {'class': ['content', 'main', 'article']})
                        
                        # Extract relevant text paragraphs
                        paragraphs = []
                        if main_content:
                            for p in main_content.find_all('p')[:3]:  # Get first 3 paragraphs
                                paragraphs.append(p.get_text().strip())
                        
                        # Check for academic indicators
                        is_academic = any([
                            'doi.org' in result['href'],
                            'scholar.google' in result['href'],
                            'researchgate' in result['href'],
                            'academia.edu' in result['href'],
                            'arxiv.org' in result['href'],
                            '.edu' in result['href'],
                            '.ac.' in result['href']
                        ])
                        
                        # Format the result with enhanced information
                        formatted_result = {
                            "title": title[:200],  # Limit title length
                            "link": result['href'],
                            "summary": description[:500],  # Limit description length
                            "content": ' '.join(paragraphs)[:1000] if paragraphs else description,  # Use extracted paragraphs if available
                            "is_academic": is_academic,
                            "domain": urlparse(result['href']).netloc
                        }
                        
                        formatted_results.append(formatted_result)
                        
                except Exception as e:
                    print(f"Error processing result: {str(e)}")
                    continue
            
            # Remove duplicates based on URL
            seen_urls = set()
            unique_results = []
            for result in formatted_results:
                if result['link'] not in seen_urls:
                    seen_urls.add(result['link'])
                    unique_results.append(result)
            
            formatted_results = unique_results
            
            # Sort results (academic sources first)
            formatted_results.sort(key=lambda x: (not x['is_academic'], x['title']))
            
            # Limit to requested number of results
            formatted_results = formatted_results[:num_results]
            
            # Create detailed search context
            for idx, result in enumerate(formatted_results, 1):
                search_context += f"{idx}. {result['title']}\n"
                search_context += f"Source: {result['link']}\n"
                if result['is_academic']:
                    search_context += "[Academic Source]\n"
                search_context += f"Summary: {result['summary']}\n\n"
        
        print("Formatted academic search results:", formatted_results)
        return search_context, formatted_results
        
    except Exception as e:
        print(f"Search error: {str(e)}")
        return "", []
            
# Add a function to process thinking tags
def process_thinking_content(content: str) -> Dict[str, Any]:
    """Extract and process thinking content from model response."""
    think_pattern = r'<think>(.*?)</think>'
    
    # Find thinking content
    think_match = re.search(think_pattern, content, re.DOTALL)
    
    if think_match:
        thinking = think_match.group(1).strip()
        # Remove the thinking tags from main content
        main_content = re.sub(think_pattern, '', content, flags=re.DOTALL).strip()
        return {
            "type": "thinking",
            "thinking": thinking,
            "content": main_content
        }
    
    return {
        "type": "content",
        "content": content
    }

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        # Construct base system message
        system_message = f"You are Professor {request.professor.name}, an expert educator in {request.professor.field}..."
        
        # If web search is enabled, perform specialized academic search
        search_context = ""
        search_results = []
        citations = []
        
        if request.enable_search:
            search_context, search_results = await get_web_search_results(
                query=request.message,
                professor={
                    "name": request.professor.name,
                    "field": request.professor.field
                }
            )
            if search_context:
                system_message += "\n\nHere are relevant academic and research sources:\n" + search_context
                system_message += "\nPlease structure your response in the following format:\n"
                system_message += "1. Start with a brief overview\n"
                system_message += "2. For each main point, cite the specific source you're drawing from using [Source X]\n"
                system_message += "3. Use bullet points for key insights\n"
                system_message += "4. Maintain your role as an educator while integrating these sources\n"

        # Update knowledge graph with professor data
        

        # Add search results to knowledge graph
        

        if request.model_type == "local":
            try:
                print("Attempting LM Studio request...")
                
                payload = {
                    "messages": [
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": request.message}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 4000,
                    "stream": False
                }
                
                print(f"Sending payload to LM Studio: {payload}")
                
                # Increased timeout to 120 seconds
                response = requests.post(
                    LM_STUDIO_URL, 
                    json=payload,
                    headers=LM_STUDIO_HEADERS,
                    timeout=120  # Increased from 30 to 120 seconds
                )
                
                print(f"LM Studio response status: {response.status_code}")
                
                if response.status_code == 200:
                    response_json = response.json()
                    return {"response": response_json["choices"][0]["message"]["content"]}
                else:
                    error_msg = f"LM Studio error: Status {response.status_code}, Response: {response.text}"
                    print(error_msg)
                    raise HTTPException(status_code=500, detail=error_msg)
                    
            except requests.exceptions.Timeout:
                error_msg = "LM Studio request timed out. The model might be taking too long to generate a response."
                print(error_msg)
                raise HTTPException(status_code=504, detail=error_msg)
            except requests.exceptions.ConnectionError as e:
                error_msg = "Could not connect to LM Studio. Please ensure it's running and the model is loaded."
                print(f"Connection error: {str(e)}")
                raise HTTPException(status_code=500, detail=error_msg)
            except Exception as e:
                print(f"Unexpected LM Studio error: {str(e)}")
                raise HTTPException(status_code=500, detail=f"LM Studio error: {str(e)}")
                
        elif request.model_type == "openai":
            try:
                messages = [
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": request.message}
                ]
                
                if search_context:
                    messages.insert(1, {
                        "role": "system",
                        "content": "When using the search results, please explicitly cite sources using [Source X] notation and structure your response clearly with sections and bullet points."
                    })
                
                response = client.chat.completions.create(
                    model="gpt-4o-mini",  # Using a more capable model
                    messages=messages,
                    temperature=0.85
                )
                
                return {
                    "response": response.choices[0].message.content,
                    "search_results": search_results if search_results else None,
                    "citations": [f"{source['title']} - {source['link']}" for source in search_results] if search_results else None
                }
            except Exception as e:
                print(f"OpenAI error: {str(e)}")
                raise HTTPException(status_code=500, detail=f"OpenAI error: {str(e)}")
            
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Add knowledge graph endpoint
@app.get("/api/knowledge-graph")
async def get_knowledge_graph(concept: Optional[str] = None):
    try:
        return knowledge_graph.get_graph_data(concept)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add after the other model classes
class DocumentChatRequest(BaseModel):
    document_id: str
    document_url: str
    document_title: str
    message: str
    previous_messages: list = []

# Add this function to extract text from PDF URLs
async def extract_text_from_pdf_url(pdf_url):
    try:
        print(f"Downloading PDF from URL: {pdf_url}")
        response = requests.get(pdf_url)
        response.raise_for_status()  # Check if download was successful
        
        # Method 1: Try with PyPDF2 first
        try:
            print("Extracting text using PyPDF2...")
            pdf_content = io.BytesIO(response.content)
            pdf_reader = PyPDF2.PdfReader(pdf_content)
            
            text = ""
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n\n"
            
            if text.strip():
                return text
        except Exception as e:
            print(f"PyPDF2 extraction failed: {e}")
        
        # Method 2: Try with pdfplumber if PyPDF2 fails or returns empty text
        print("Extracting text using pdfplumber...")
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_file:
            temp_file.write(response.content)
            temp_file_path = temp_file.name
        
        text = ""
        with pdfplumber.open(temp_file_path) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n\n"
        
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return f"Error extracting text from PDF: {str(e)}"

# Update the document_chat endpoint
@app.post("/api/document-chat")
async def document_chat(request: DocumentChatRequest):
    try:
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        # Download and extract text from the PDF
        document_text = await extract_text_from_pdf_url(request.document_url)
        
        if not document_text or document_text.startswith("Error"):
            return {"response": "I couldn't extract text from this document. The PDF might be scanned, password-protected, or in an unsupported format."}
        
        # Truncate text if too long
        max_chars = 100000  # Adjust based on token limits
        if len(document_text) > max_chars:
            document_text = document_text[:max_chars] + "...(content truncated due to length)"
        
        # Build context from previous messages
        messages = [
            {"role": "system", "content": f"You are a helpful assistant analyzing the document '{request.document_title}'. Provide accurate information based on the document content. If you don't know something or it's not in the document, be honest about it."}
        ]
        
        # Add previous conversation context
        for msg in request.previous_messages:
            messages.append({"role": msg["role"], "content": msg["content"]})
        
        # Add the document content and user's question
        messages.append({
            "role": "user", 
            "content": f"Here is the content of the document '{request.document_title}':\n\n{document_text}\n\nUser question: {request.message}\n\nPlease provide a helpful response based on the document content."
        })
        
        # Get response from OpenAI
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Using 3.5 turbo for faster responses and lower token usage
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )
        
        return {"response": response.choices[0].message.content}
    
    except Exception as e:
        print(f"Error in document_chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing document chat: {str(e)}")

# Initialize storage for availabilities and bookings (in-memory for demo purposes)
# In production, this should be a database
professor_availabilities = []
meeting_bookings = []

def generate_google_meet_link():
    """Generate a random Google Meet link."""
    # Generate a random 10-character meeting ID
    meeting_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
    return f"https://meet.google.com/{meeting_id}-{random.randint(100, 999)}-{random.randint(100, 999)}"

@app.post("/api/professor/availability")
async def add_professor_availability(availability: ProfessorAvailability):
    # Generate a unique ID for the availability
    availability_id = str(uuid.uuid4())
    
    # Generate a Google Meet link if not provided
    if not availability.meeting_link:
        meeting_link = generate_google_meet_link()
    else:
        meeting_link = availability.meeting_link
    
    # Store availability with its ID and meeting link
    stored_availability = availability.dict()
    stored_availability["id"] = availability_id
    stored_availability["meeting_link"] = meeting_link
    professor_availabilities.append(stored_availability)
    
    return {
        "id": availability_id, 
        "meeting_link": meeting_link,
        "status": "Availability added successfully"
    }

@app.get("/api/professor/availability")
async def get_professor_availabilities(professor_name: Optional[str] = None):
    if professor_name:
        # Filter availabilities by professor name
        filtered_availabilities = [a for a in professor_availabilities 
                                  if a["professor_name"] == professor_name]
        return {"availabilities": filtered_availabilities}
    
    # Return all availabilities if no professor name provided
    return {"availabilities": professor_availabilities}

@app.post("/api/student/book-meeting")
async def book_meeting(booking: MeetingBooking):
    # Find the availability to update
    availability = None
    for avail in professor_availabilities:
        if avail["id"] == booking.availability_id:
            if avail["is_booked"]:
                return {"status": "error", "message": "This time slot is already booked"}
            availability = avail
            break
    
    if not availability:
        return {"status": "error", "message": "Availability not found"}
    
    # Mark as booked
    availability["is_booked"] = True
    
    # Store booking
    booking_id = str(uuid.uuid4())
    stored_booking = booking.dict()
    stored_booking["id"] = booking_id
    stored_booking["professor_name"] = availability["professor_name"]
    stored_booking["date"] = availability["date"]
    stored_booking["start_time"] = availability["start_time"]
    stored_booking["end_time"] = availability["end_time"]
    stored_booking["meeting_link"] = availability["meeting_link"]
    # Make sure availability_id is included in the stored booking
    stored_booking["availability_id"] = booking.availability_id
    meeting_bookings.append(stored_booking)
    
    return {
        "id": booking_id,
        "status": "success",
        "message": "Meeting booked successfully"
    }

@app.get("/api/student/bookings")
async def get_student_bookings(student_email: str):
    # Filter bookings by student email
    student_bookings = [b for b in meeting_bookings if b["student_email"] == student_email]
    return {"bookings": student_bookings}

@app.get("/api/professor/bookings")
async def get_professor_bookings(professor_name: str):
    # Filter bookings by professor name
    professor_bookings = [b for b in meeting_bookings if b["professor_name"] == professor_name]
    return {"bookings": professor_bookings}

@app.delete("/api/booking/{booking_id}")
async def cancel_booking(booking_id: str):
    """Cancel a booking and make the slot available again."""
    # Find the booking
    booking_to_cancel = None
    for i, booking in enumerate(meeting_bookings):
        if booking["id"] == booking_id:
            booking_to_cancel = booking
            # Remove the booking from the list
            meeting_bookings.pop(i)
            break
    
    if not booking_to_cancel:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Find the corresponding availability and mark it as available
    availability_id = booking_to_cancel["availability_id"]
    availability_updated = False
    
    for avail in professor_availabilities:
        if avail["id"] == availability_id:
            avail["is_booked"] = False
            availability_updated = True
            break
    
    if not availability_updated:
        # This is an unexpected state, but we'll handle it gracefully
        # The booking was deleted, but we couldn't update the availability
        return {
            "status": "partial_success",
            "message": "Booking was cancelled, but the availability status could not be updated"
        }
    
    return {
        "status": "success",
        "message": "Booking cancelled successfully"
    }

@app.post("/add_to_rag/")
async def add_to_rag(file: UploadFile = File(...)):
    contents = await file.read()

    pdf_reader = PyPDF2.PdfReader(file.file)
    text = "\n".join([page.extract_text() for page in pdf_reader.pages if page.extract_text()])

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = text_splitter.split_text(text)

    embeddings = embedder.embed_documents(chunks)

    upsert_data = [
        (str(uuid.uuid4()), embedding, {"text": chunk})
        for chunk, embedding in zip(chunks, embeddings)
    ]
    index.upsert(upsert_data)

    return {"message": f"Added {len(chunks)} chunks from {file.filename} to RAG"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",  
        port=8000,
        reload=True  
    ) 