from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.chat_route import router as chat_router

app = FastAPI()

origins = [
    "http://localhost:3173",    # Vite's default dev server
    "http://127.0.0.1:3173",
    "http://localhost:3000",    # Alternative React port
    "http://127.0.0.1:3000",
    "http://localhost:5173",
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

# Include the chat-related routes
app.include_router(chat_router)

# Add a basic route to check if it's working
@app.get("/")
def read_root():
    return {"message": "App is running successfully"}