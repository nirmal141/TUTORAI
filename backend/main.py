from openai import OpenAI
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv
from typing import Optional, AsyncGenerator, Dict, Any
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS
from urllib.parse import urlparse
import re
import json
from fastapi.responses import StreamingResponse
import httpx

load_dotenv()

app = FastAPI()

# More specific CORS configuration
origins = [
    "http://localhost:3173",    # Vite's default dev server
    "http://127.0.0.1:3173",
    "http://localhost:3000",    # Alternative React port
    "http://127.0.0.1:3000",
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",  # This allows external connections
        port=8000,
        reload=True  # Enables auto-reload during development
    ) 