from openai import OpenAI
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv
from typing import Optional, AsyncGenerator, Dict, Any
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS
from urllib.parse import urlparse, parse_qs
import re
import json
from fastapi.responses import StreamingResponse
import httpx
import PyPDF2
import io
import tempfile
import pdfplumber
import uuid
import io
import json
import tempfile
import random
import string
import time
from youtube_transcript_api import YouTubeTranscriptApi
import asyncio
import re

from pinecone import Pinecone
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OpenAIEmbeddings
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
    "https://tutorai.vercel.app",  # Production URL
    "https://tutorai-git-main-your-username.vercel.app",  # Preview deployments
    "https://*.vercel.app"  # Allow all Vercel preview deployments
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex="https?://.*",  # More permissive for deployment
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
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
    
class YoutubeChatRequest(BaseModel):
    youtube_url: str
    video_title: str = "Educational Video"
    message: str
    previous_messages: list = []

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
        
        # Create more user query-focused search queries
        academic_queries = [
            f"{query}",  # Direct user query (highest priority)
            f"{query} research papers",  # Research papers on the query topic
            f"{query} {professor['field']} latest research",  # Field-specific recent research
            f"{query} academic publications",  # Academic publications on the query
            f"{professor['name']} {query}"  # Professor's perspective on the query (lowest priority)
        ]
        
        all_results = []
        formatted_results = []
        search_context = "Relevant academic and research sources:\n\n"
        
        # Track already processed URLs to avoid duplicates
        processed_urls = set()
        
        # Perform multiple targeted searches
        for specialized_query in academic_queries:
            results = list(ddgs.text(specialized_query, max_results=4))
            
            # Process each result with BeautifulSoup
            for result in results:
                try:
                    if result.get('href') and result['href'] not in processed_urls:
                        processed_urls.add(result['href'])
                        
                        # Fetch the webpage content
                        try:
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
                                '.ac.' in result['href'],
                                'ncbi.nlm.nih.gov' in result['href'],
                                'semanticscholar.org' in result['href']
                            ])
                            
                            # Relevance score based on keyword matching
                            query_keywords = set(query.lower().split())
                            title_keywords = set(title.lower().split())
                            desc_keywords = set(description.lower().split())
                            
                            # Calculate keyword match score
                            keyword_match_score = len(query_keywords & title_keywords) * 2 + len(query_keywords & desc_keywords)
                            
                            # Format the result with enhanced information
                            formatted_result = {
                                "title": title[:200],  # Limit title length
                                "link": result['href'],
                                "summary": description[:500],  # Limit description length
                                "content": ' '.join(paragraphs)[:1000] if paragraphs else description,  # Use extracted paragraphs if available
                                "is_academic": is_academic,
                                "relevance_score": keyword_match_score  # Add relevance score for sorting
                            }
                            
                            formatted_results.append(formatted_result)
                            
                            if len(formatted_results) >= num_results * 3:  # Collect 3x more results than needed
                                break
                                
                        except (requests.exceptions.RequestException, requests.exceptions.Timeout):
                            # Skip this result if we can't fetch the page
                            continue
                except Exception as e:
                    print(f"Error processing search result: {e}")
                    continue
            
            if len(formatted_results) >= num_results * 3:
                break
        
        # Sort results by relevance score and academic status
        formatted_results.sort(key=lambda x: (x.get('relevance_score', 0) * (2 if x.get('is_academic', False) else 1)), reverse=True)
        
        # Take top results
        top_results = formatted_results[:num_results]
        
        # Build search context for the LLM
        for i, result in enumerate(top_results):
            search_context += f"[Source {i+1}] {result['title']}\n"
            search_context += f"URL: {result['link']}\n"
            search_context += f"Summary: {result['summary']}\n"
            if result.get('content'):
                search_context += f"Content: {result['content']}\n"
            search_context += "\n"
            
            # Clean up result for the frontend
            result.pop('content', None)  # Remove content field for frontend
            result.pop('relevance_score', None)  # Remove score field
            
        return search_context, top_results
        
    except Exception as e:
        print(f"Error in web search: {e}")
        return "", []
            
# Add this function to ensure thinking tags are properly formatted
def process_thinking_content(content: str) -> Dict[str, Any]:
    """Process model response to ensure proper thinking tag format."""
    
    # Check if thinking tags are present
    think_regex = r'<think>([\s\S]*?)<\/think>'
    match = re.search(think_regex, content)
    
    if match:
        # Thinking tags are present, extract and format
        thinking = match.group(1).strip()
        final_content = re.sub(think_regex, '', content).strip()
        
        return {
            "has_thinking": True,
            "thinking": thinking,
            "final_content": final_content,
            "original_content": content
        }
    else:
        # No thinking tags, check if we can identify a reasoning pattern
        # Sometimes models don't use tags but still show thinking
        paragraphs = content.split('\n\n')
        if len(paragraphs) > 2 and len(content) > 500:
            # If content is substantial and has multiple paragraphs,
            # consider first half as thinking and latter half as answer
            split_point = len(content) // 2
            potential_thinking = content[:split_point].strip()
            potential_answer = content[split_point:].strip()
            
            return {
                "has_thinking": True,
                "thinking": potential_thinking,
                "final_content": potential_answer,
                "original_content": content,
                "auto_formatted": True
            }
        
        # No thinking pattern detected, return as is
        return {
            "has_thinking": False,
            "thinking": None,
            "final_content": content,
            "original_content": content
        }

# Add this utility function for processing lecture responses
def process_lecture_formatting(response_text: str) -> dict:
    """
    Process lecture-style responses to enhance the classroom experience
    by detecting and formatting special lecture components.
    
    Args:
        response_text: Raw response text from the model
        
    Returns:
        Dict with formatted response and metadata about lecture components
    """
    # Initialize lecture components
    lecture_components = {
        "has_whiteboard": False,
        "has_equation": False,
        "has_example": False,
        "has_diagram": False,
        "has_references": False,
        "has_sections": False,
        "has_key_points": False,
        "has_emojis": False,
        "has_tables": False,
        "has_ascii_art": False
    }
    
    formatted_text = response_text
    
    # Detect whiteboard content (code blocks)
    if "```" in formatted_text:
        lecture_components["has_whiteboard"] = True
    
    # Detect equations (using LaTeX-style delimiters)
    if "$" in formatted_text or "\\begin{equation}" in formatted_text:
        lecture_components["has_equation"] = True
    
    # Detect examples 
    example_patterns = [
        r"(?i)example[s]?:", r"(?i)for example,", 
        r"(?i)let's consider", r"(?i)consider this example",
        r"### Example", r"\*\*Example\*\*"
    ]
    for pattern in example_patterns:
        if re.search(pattern, formatted_text):
            lecture_components["has_example"] = True
            break
    
    # Detect sections (markdown headings)
    if re.search(r"###\s+\w+", formatted_text):
        lecture_components["has_sections"] = True
    
    # Detect key points (blockquotes)
    if re.search(r">\s+", formatted_text):
        lecture_components["has_key_points"] = True
    
    # Detect emojis
    if re.search(r"[\U0001F300-\U0001F9FF]", formatted_text):
        lecture_components["has_emojis"] = True
    
    # Detect tables (markdown tables)
    if re.search(r"\|.*\|.*\|", formatted_text):
        lecture_components["has_tables"] = True
    
    # Detect ASCII art
    ascii_art_patterns = [
        r"```ascii", r"```art",
        r"[\/\\\|\-\+\=]{4,}"  # Simple pattern for ASCII art lines
    ]
    for pattern in ascii_art_patterns:
        if re.search(pattern, formatted_text):
            lecture_components["has_ascii_art"] = True
            break
    
    # Detect diagrams
    diagram_patterns = [r"(?i)diagram", r"(?i)figure", r"(?i)illustration"]
    for pattern in diagram_patterns:
        if re.search(pattern, formatted_text):
            lecture_components["has_diagram"] = True
            break
    
    # Detect references/citations
    if re.search(r"\[\d+\]|\[Source \d+\]", formatted_text) or "according to" in formatted_text.lower():
        lecture_components["has_references"] = True
    
    return {
        "formatted_text": formatted_text,
        "lecture_components": lecture_components
    }

async def get_relevant_lecture_content(query: str, professor: Professor, top_k: int = 3):
    """Get relevant lecture content from professor-specific lectures."""
    try:
        # Only use RAG for specific professors who have their content indexed
        professor_indices = {
            "Andrew Ng": "andrew-ng",  # Index name for Andrew Ng's lectures
            # Add more professors and their indices as they are added
            # "Yann LeCun": "yann-lecun",  # Example for future expansion
            # "David Malan": "david-malan",
        }
        
        # Check if this professor has indexed content
        if professor.name not in professor_indices:
            return ""
            
        # Get the correct index for this professor
        professor_index = pc.Index(professor_indices[professor.name])
        
        # Create embedding for the query
        query_embedding = embedder.embed_query(query)
        
        # Search Pinecone
        search_results = professor_index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True
        )
        
        # Format results
        context = f"Relevant content from Professor {professor.name}'s lectures:\n\n"
        for i, match in enumerate(search_results['matches'], 1):
            if match['score'] > 0.7:  # Only include highly relevant matches
                context += f"[Lecture Extract {i}]: {match['metadata']['text']}\n\n"
        
        return context
    except Exception as e:
        print(f"Error getting lecture content: {str(e)}")
        return ""

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        # Create a rich classroom environment based on teaching mode
        classroom_style = ""
        if request.professor.teachingMode == "Socratic":
            classroom_style = """
You primarily teach through questioning. Rather than giving direct answers, you guide students to discover solutions themselves.
- Ask thought-provoking questions that lead students toward understanding
- When a student gives an answer, respond with follow-up questions
- Acknowledge good reasoning and gently correct misconceptions through more questions
- Use phrases like "What would happen if...?", "How might we approach...?", "Consider this scenario..."
- Create a dialogue that feels like a live classroom discussion
"""
        elif request.professor.teachingMode == "Practical":
            classroom_style = """
You focus on practical applications and real-world examples in your teaching.
- Ground abstract concepts in concrete, tangible examples that students can relate to
- Frequently reference how concepts apply in professional settings
- Use case studies and practical scenarios
- Phrase explanations as "In practice, this works by...", "A real-world application of this is..."
- Structure responses like a workshop environment with hands-on explanations
"""
        else:  # Default/Virtual teaching mode
            classroom_style = """
You provide clear, structured explanations with a mix of theory and application.
- Begin with clear learning objectives for the topic
- Organize content logically with main points and supporting details
- Use examples that clarify difficult concepts
- Incorporate occasional questions to check understanding
- Your tone is encouraging but maintains academic rigor
"""

        # Base system message with enhanced classroom environment
        base_system_message = f"""You are Professor {request.professor.name}, an expert educator in {request.professor.field}. 
You are currently teaching a class and responding to a student's question or comment.

CLASSROOM ENVIRONMENT:
- You are standing at the front of a classroom with students seated before you
- You have access to a whiteboard/chalkboard for diagrams or equations (use markdown for these)
- The atmosphere is scholarly but engaging
- There may be other students listening in
- This is a live classroom session, not an online chat

YOUR TEACHING STYLE:
{classroom_style}

SUBJECT EXPERTISE:
- As an expert in {request.professor.field}, you have deep knowledge of the subject matter
- You're familiar with both foundational concepts and cutting-edge developments
- You can explain complex topics at different levels based on student needs
- You cite relevant scholars or research when appropriate

RESPONSE FORMAT:
1. Use clear markdown formatting:
   - Use ### for main section headings
   - Use bold (**text**) for important concepts
   - Use bullet points for lists
   - Use numbered lists for steps or sequences
   - Use code blocks (```) for technical content or equations
   - Use > for important quotes or key takeaways
   - Use horizontal rules (---) to separate major sections

2. Structure your responses with:
   - A brief acknowledgment of the question
   - Clear section headings for different parts of your answer
   - Examples and analogies in separate, clearly marked sections
   - Key takeaways or summary points at the end
   - Follow-up questions or suggested areas for exploration

3. Visual elements:
   - Use emojis sparingly but effectively (e.g., 📝 for notes, 💡 for insights)
   - Format equations and mathematical concepts clearly using LaTeX when needed
   - Use tables for comparing concepts where appropriate
   - Include ASCII diagrams if helpful

4. Language style:
   - Use clear, concise language
   - Break down complex ideas into digestible parts
   - Include brief "checkpoints" to ensure understanding
   - End with thought-provoking questions or next steps

ADVICE SPECIALIZATION:
You specialize in providing {request.professor.adviceType} to students.
"""

        # Get relevant lecture content only for professors with indexed content
        lecture_context = await get_relevant_lecture_content(request.message, request.professor)
        
        if lecture_context:
            base_system_message += f"\n\nRELEVANT LECTURE CONTENT:\n{lecture_context}\n\nUse this lecture content to inform your response, but maintain your teaching style and explain concepts in your own words."

        # If web search is enabled, perform specialized academic search
        search_context = ""
        search_results = []
        citations = []
        
        if request.enable_search:
            print(f"Web search enabled for query: '{request.message}'")
            search_context, search_results = await get_web_search_results(
                query=request.message,
                professor={
                    "name": request.professor.name,
                    "field": request.professor.field
                }
            )
            
            if search_results:
                # Create search system message with classroom context
                search_system_message = (
                    "You have been provided with recent web search results relevant to the student's question. "
                    "Use these sources to enhance your classroom response while maintaining your teaching style. "
                    "\n\nGuidelines for using search results in your classroom:"
                    "\n1. Refer to the sources as if they're materials you're familiar with - 'In a study by...' or 'According to recent research...'"
                    "\n2. Cite sources naturally as you would in a lecture, using [Source X] notation where X is the source number"
                    "\n3. Synthesize information from multiple sources when appropriate, as a professor would when lecturing"
                    "\n4. If the search results don't contain relevant information, rely on your expertise"
                    "\n5. Maintain your classroom presence and teaching style throughout"
                    "\n6. For academic sources, explain their relevance to the class topic"
                    "\n\nThe reference materials are:"
                    f"\n\n{search_context}"
                )
                
                # Add thinking reminder only for local models
                if request.model_type == "local":
                    search_system_message += "\n\nRemember to include your thinking in <think> tags before your final classroom response."
                
                base_system_message += "\n\n" + search_system_message

        # Update knowledge graph with professor data
        

        # Add search results to knowledge graph
        

        if request.model_type == "local":
            try:
                print("Attempting LM Studio request...")
                
                payload = {
                    "messages": [
                        {"role": "system", "content": base_system_message},
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
                    raw_response = response_json["choices"][0]["message"]["content"]
                    
                    # Process thinking content for local models
                    processed_response = process_thinking_content(raw_response)
                    
                    return {
                        "response": raw_response,  # Keep original response with thinking tags
                        "search_results": search_results if search_results else None,
                        "has_thinking": processed_response["has_thinking"]
                    }
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
                    {"role": "system", "content": base_system_message},
                    {"role": "user", "content": request.message}
                ]
                
                response = client.chat.completions.create(
                    model="gpt-4o-mini",  # Using a more capable model
                    messages=messages,
                    temperature=0.85
                )
                
                # Format citations in a more readable way for the frontend
                if search_results:
                    response_text = response.choices[0].message.content
                    
                    # Process for lecture formatting
                    lecture_processed = process_lecture_formatting(response_text)
                    
                    return {
                        "response": lecture_processed["formatted_text"],
                        "search_results": search_results,
                        "lecture_components": lecture_processed["lecture_components"]
                    }
                else:
                    response_text = response.choices[0].message.content
                    
                    # Process for lecture formatting
                    lecture_processed = process_lecture_formatting(response_text)
                    
                    return {
                        "response": lecture_processed["formatted_text"],
                        "lecture_components": lecture_processed["lecture_components"]
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
        
        # Create classroom-oriented system prompt
        classroom_system_prompt = f"""You are a professor leading a class discussion about the document titled '{request.document_title}'.
        
CLASSROOM ENVIRONMENT:
- You are in a classroom with students discussing this document as a learning resource
- You reference specific parts of the document when answering questions
- You use a professional yet engaging teaching tone
- You might occasionally ask rhetorical questions to emphasize important points
- When appropriate, you relate concepts in the document to broader academic contexts

YOUR APPROACH:
- Begin by acknowledging the student's question about the document
- Reference specific sections, pages, or paragraphs from the document to support your explanations
- Use phrases like "In this document, we can see..." or "The author addresses this on page X..."
- If the document has data or figures, explain them in an educational context
- Connect the document's content to classroom learning objectives
- Be honest if the document doesn't address a particular question

RESPONSE FORMAT:
- Address the student directly as if in a classroom setting
- Structure your response clearly and pedagogically
- Cite specific parts of the document when relevant
- Consider using an introduction, main points, and conclusion format
- Wrap up with suggestions for further exploration if appropriate
"""
        
        # Build context from previous messages
        messages = [
            {"role": "system", "content": classroom_system_prompt}
        ]
        
        # Add previous conversation context
        for msg in request.previous_messages:
            messages.append({"role": msg["role"], "content": msg["content"]})
        
        # Add the document content and user's question
        messages.append({
            "role": "user", 
            "content": f"Here is the content of the document '{request.document_title}':\n\n{document_text}\n\nStudent question: {request.message}\n\nPlease respond as if we're discussing this document in class."
        })
        
        # Get response from OpenAI
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Using a more capable model for document analysis
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )
        
        response_text = response.choices[0].message.content
        
        # Process for lecture formatting
        lecture_processed = process_lecture_formatting(response_text)
        
        return {
            "response": lecture_processed["formatted_text"],
            "lecture_components": lecture_processed["lecture_components"]
        }
    
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

# Create document storage directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Document storage (would be a database in production)
documents_db = []

class DocumentResponse(BaseModel):
    document_id: str
    filename: str
    file_path: str
    title: str
    description: str
    message: str

@app.post("/api/upload", response_model=DocumentResponse)
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

@app.get("/api/documents")
async def list_documents():
    """List all available classroom documents"""
    return {"documents": documents_db}

@app.get("/api/documents/{document_id}")
async def get_document(document_id: str):
    """Get a specific document by ID"""
    document = next((doc for doc in documents_db if doc["document_id"] == document_id), None)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

# Find and update the YouTube chat endpoint
@app.post("/api/youtube-chat")
async def youtube_chat(request: YoutubeChatRequest):
    try:
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        # Fetch YouTube transcript (simplified here)
        transcript_text = get_youtube_transcript(request.youtube_url)
        
        if not transcript_text or transcript_text.startswith("Error"):
            return {"response": "I couldn't extract the transcript from this YouTube video. It might not have captions available or might be in an unsupported format."}
        
        # Truncate text if too long
        max_chars = 50000  # Adjust based on token limits
        if len(transcript_text) > max_chars:
            transcript_text = transcript_text[:max_chars] + "...(transcript truncated due to length)"
        
        # Create classroom-oriented system prompt for YouTube discussions
        classroom_system_prompt = f"""You are a professor leading a class discussion about a YouTube video titled '{request.video_title}'.
        
CLASSROOM ENVIRONMENT:
- You are in a classroom with students discussing this educational video as a learning resource
- You reference specific parts of the video and transcript when answering questions
- You use a professional yet engaging teaching tone
- You might occasionally ask rhetorical questions to emphasize important points
- When appropriate, you relate concepts in the video to broader academic contexts

YOUR APPROACH:
- Begin by acknowledging the student's question about the video
- Reference specific timestamps, quotes, or sections from the video/transcript to support your explanations
- Use phrases like "In this video, the presenter explains..." or "At around [timestamp], we can see..."
- Explain complex concepts from the video in an accessible, educational manner
- Connect the video's content to classroom learning objectives
- Be honest if the video doesn't address a particular question

RESPONSE FORMAT:
- Address the student directly as if in a classroom setting
- Structure your response clearly and pedagogically
- Cite specific parts of the video transcript when relevant
- Consider using an introduction, main points, and conclusion format
- Wrap up with suggestions for further exploration if appropriate
"""
        
        # Build context from previous messages
        messages = [
            {"role": "system", "content": classroom_system_prompt}
        ]
        
        # Add previous conversation context
        for msg in request.previous_messages:
            messages.append({"role": msg["role"], "content": msg["content"]})
        
        # Add the video transcript and user's question
        messages.append({
            "role": "user", 
            "content": f"Here is the transcript of the YouTube video '{request.video_title}' ({request.youtube_url}):\n\n{transcript_text}\n\nStudent question: {request.message}\n\nPlease respond as if we're discussing this video in class."
        })
        
        # Get response from OpenAI
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Using a more capable model for video analysis
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )
        
        response_text = response.choices[0].message.content
        
        # Process for lecture formatting
        lecture_processed = process_lecture_formatting(response_text)
        
        return {
            "response": lecture_processed["formatted_text"],
            "lecture_components": lecture_processed["lecture_components"]
        }
    
    except Exception as e:
        print(f"Error in youtube_chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing YouTube chat: {str(e)}")

def get_youtube_transcript(youtube_url: str) -> str:
    """
    Extract transcript from a YouTube video URL.
    
    Args:
        youtube_url: YouTube video URL
        
    Returns:
        Transcript text or error message
    """
    try:
        # Extract video ID from URL
        parsed_url = urlparse(youtube_url)
        
        if parsed_url.netloc == 'youtu.be':
            video_id = parsed_url.path.lstrip('/')
        else:
            # For youtube.com URLs
            if 'v' in parse_qs(parsed_url.query):
                video_id = parse_qs(parsed_url.query)['v'][0]
            else:
                return "Error: Could not extract video ID from URL"
        
        # Get transcript
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        
        # Format transcript with timestamps
        formatted_transcript = ""
        for entry in transcript_list:
            # Convert seconds to MM:SS format
            minutes = int(entry['start'] / 60)
            seconds = int(entry['start'] % 60)
            timestamp = f"[{minutes:02d}:{seconds:02d}]"
            
            # Add entry with timestamp
            formatted_transcript += f"{timestamp} {entry['text']}\n"
        
        return formatted_transcript
        
    except Exception as e:
        print(f"Error extracting YouTube transcript: {str(e)}")
        return f"Error: {str(e)}"

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

class RemoveFromRAGRequest(BaseModel):
    document_id: str
    file_path: str
    title: Optional[str] = None

@app.post("/remove_from_rag/")
async def remove_from_rag(request: RemoveFromRAGRequest):
    try:
        # Print information about the request
        print(f"Removing document from RAG: {request.document_id}, {request.file_path}")
        
        # For now, we'll just acknowledge the request
        # In a real implementation, you would:
        # 1. Use the document_id to fetch metadata from your vector store
        # 2. Delete all vectors associated with this document
        
        # Placeholder for actual implementation
        # index.delete(filter={"document_id": request.document_id})
        
        return {"message": f"Document {request.document_id} ({request.title or request.file_path}) removed from RAG system"}
    except Exception as e:
        print(f"Error removing document from RAG: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to remove document: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 