from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.chat_route import router as chat_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Specify the frontend's origin here
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Include the chat-related routes
app.include_router(chat_router)

# Add a basic route to check if it's working
@app.get("/")
def read_root():
    return {"message": "App is running successfully"}

# This part ensures that the application is only run when executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)