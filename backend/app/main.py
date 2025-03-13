from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import os

# Import routes
from .routes import chat_routes, document_routes, meeting_routes

# Import config
from .config.settings import CORS_ORIGINS, OPENAI_API_KEY

# Create FastAPI app
app = FastAPI(title="TutorAI API", description="API for the TutorAI educational platform")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex="https?://localhost:.*",  # Allow any localhost port
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS", "DELETE"],
    allow_headers=["*"],
    max_age=86400,  # Cache preflight requests for 24 hours
)

# Initialize OpenAI client (for imports that might need it)
client = OpenAI(api_key=OPENAI_API_KEY)

# Include all routers
app.include_router(chat_routes.router)
app.include_router(document_routes.router)
app.include_router(meeting_routes.router)

# Simple health check route
@app.get("/api/health", tags=["health"])
async def health_check():
    """Check if the API is running"""
    return {"status": "healthy", "version": "1.0.0"}

# Placeholder for knowledge graph endpoint
# This could be expanded in the future
@app.get("/api/knowledge-graph", tags=["knowledge"])
async def get_knowledge_graph(concept: str = None):
    """Get knowledge graph data (placeholder)"""
    # This is a placeholder for the knowledge graph functionality
    return {
        "status": "success",
        "message": "Knowledge graph endpoint (placeholder)",
        "concept": concept,
        "graph_data": {
            "nodes": [],
            "edges": []
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 