from openai import OpenAI
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv
from typing import Optional
from prompts import EDUCATIONAL_PROMPTS, CURRICULUM_PROMPT, PROFESSOR_PROMPTS
from fastapi.responses import StreamingResponse
import io


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
    
# Initialize OpenAI client

class GenerateResponseRequest(BaseModel):
    mode :str
    grade : str
    subject : str
    language : str
    userInput : str
    teachingStyle: list[str]


class GenerateCirriculumRequest(BaseModel):
    grade : str
    subject : str
    language: str
    durationUnit : str
    durationValue : int


class CurriculumPDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Curriculum PDF', ln=True, align='C')

    def chapter_title(self, title):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, title, 0, 1, 'C')
    
    def chapter_body(self, body):
        self.set_font('Arial', '', 12)
        self.multi_cell(0, 10, body)
    
# Initialize OpenAI client
api_key=os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# LM Studio typically runs on localhost:1234
LM_STUDIO_URL = "http://127.0.0.1:1234/v1/chat/completions"
LM_STUDIO_HEADERS = {
    "Content-Type": "application/json"
}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    print(f"Received request with model_type: {request.model_type}")
    
    try:
        if request.model_type == "local":
            try:
                print("Attempting LM Studio request...")
                
                # Create system message
                system_message = f"You are {request.professor.name}, "
                system_message += f"an expert in {request.professor.field}. "
                system_message += f"Teaching mode: {request.professor.teachingMode}"
                
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
                # Create system message with proper error handling
                system_message = f"You are {request.professor.name}, "
                system_message += f"an expert in {request.professor.field}. "
                system_message += f"Teaching mode: {request.professor.teachingMode}"

                print(f"System message: {system_message}")  # Debug log

                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {
                            "role": "system",
                            "content": system_message
                        },
                        {"role": "user", "content": request.message}
                    ]
                )
                return {"response": response.choices[0].message.content}
            except Exception as e:
                print(f"OpenAI error: {str(e)}")
                raise HTTPException(status_code=500, detail=f"OpenAI error: {str(e)}")
            
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    


@app.post("/api/generateResponse")
async def generateResponse(request: GenerateResponseRequest):
    
    prompt = EDUCATIONAL_PROMPTS[request.mode].format(
        grade=request.grade,
        subject=request.subject,
        topic=request.userInput,
        language=request.language,
        teaching_style=", ".join(request.teachingStyle)  # Convert list to a string
    )

    
    response = client.chat.completions.create(
    model="gpt-4o-mini",  # Changed model to gpt-4o-mini
    messages=[
        {
            "role": "system",
            "content": f"You are an expert educator. Use the {request.teachingStyle} approach to explain {request.subject} at the {request.grade} level in {request.language}."
        },
        {"role": "user", "content": prompt}  # Use the formatted prompt
        ]
    )
    return {"response": response.choices[0].message.content}


@app.post("/api/generateCirriculum")
def generate_curriculum_pdf(request: GenerateCirriculumRequest):
    pdf = CurriculumPDF()
    pdf.add_page()
    
    print("API hit")

    prompt = CURRICULUM_PROMPT.format(
        language=request.language,
        grade=request.grade,
        subject=request.subject,
        duration_value=request.durationValue,
        duration_unit=request.durationUnit
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",  
        messages=[
            {
                "role": "system",
                "content": f"You are an expert educator. Explain {request.subject} at the {request.grade} level in {request.language}. Create a comprehensive, structured, and detailed curriculum for the course."
            },
            {
                "role": "user",
                "content": prompt  
            }
        ]
    )

    curriculum_content = response.choices[0].message.content

    print(curriculum_content)
    
    # Add the curriculum content to the PDF
    pdf.chapter_title(f"Curriculum for {request.subject} ({request.grade} Level) in {request.language}")
    pdf.chapter_body(curriculum_content)

    # Define the output directory and filename
    output_dir = 'generated_pdfs'  # Directory where the PDFs will be stored
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)  # Create the directory if it doesn't exist

    filename = os.path.join(output_dir, f"curriculum_{request.subject}_{request.grade}.pdf")  # Filename based on subject and grade

    # Save the PDF to a file in the output directory
    pdf.output(filename)

    print(f"PDF saved as {filename}")

    return {"message": "PDF generated and saved successfully", "file_path": filename}

    # Return the PDF as a streaming response
    #return StreamingResponse(
    #    pdf_buffer,
    #    media_type="application/pdf",
    #    headers={"Content-Disposition": f"attachment; filename=curriculum_{request.subject}_{request.grade}.pdf"}
    #)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",  # This allows external connections
        port=8000,
        reload=True  # Enables auto-reload during development
    ) 