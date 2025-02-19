from openai import OpenAI
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv
from typing import Optional
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS

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
            all_results.extend(results)
            
        # Prioritize and deduplicate results
        seen_links = set()
        
        for result in all_results:
            link = result.get('href', '')
            if not link or link in seen_links:
                continue
                
            seen_links.add(link)
            
            # Prioritize academic and research sources
            priority_domains = [
                'scholar.google.com', 'researchgate.net', 'academia.edu',
                'github.com', 'arxiv.org', 'ieee.org', 'acm.org',
                'springer.com', 'sciencedirect.com'
            ]
            
            # Check if the result is from a priority domain
            is_priority = any(domain in link.lower() for domain in priority_domains)
            
            formatted_result = {
                "title": result.get('title', 'No title').strip(),
                "link": link,
                "summary": result.get('body', 'No summary available').strip(),
                "is_academic": is_priority
            }
            
            formatted_results.append(formatted_result)
            
            # Add context with academic source highlighting
            search_context += f"{len(formatted_results)}. {formatted_result['title']}\n"
            search_context += f"Source: {formatted_result['link']}\n"
            if is_priority:
                search_context += "[Academic/Research Source]\n"
            search_context += f"Summary: {formatted_result['summary']}\n\n"
            
            # Limit to top results
            if len(formatted_results) >= num_results:
                break
        
        print("Formatted academic search results:", formatted_results)
        return search_context, formatted_results
    except Exception as e:
        print(f"Search error: {str(e)}")
        return "", []

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        # Construct base system message
        system_message = f"You are Professor {request.professor.name}, an expert educator in {request.professor.field}..."
        
        # If web search is enabled, perform specialized academic search
        search_context = ""
        search_results = []
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
                system_message += "\nPlease incorporate these academic sources into your response when relevant."
        
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
                
                # If we have search context, add it as a system message
                if search_context:
                    messages.insert(1, {
                        "role": "system",
                        "content": "Please use the web search results above to enhance your response, but maintain your role as an educator."
                    })
                
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    temperature=0.85
                )
                
                return {
                    "response": response.choices[0].message.content,
                    "search_results": search_results if search_results else None
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