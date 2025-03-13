import re
import random
import string
import uuid
import io
import requests
import tempfile
import PyPDF2
import pdfplumber
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS
from urllib.parse import urlparse, parse_qs
from youtube_transcript_api import YouTubeTranscriptApi


def process_thinking_content(content: str) -> dict:
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


def process_lecture_formatting(response_text: str) -> dict:
    """
    Process lecture-style responses to enhance the classroom experience
    by detecting and formatting special lecture components.
    """
    # Initialize lecture components
    lecture_components = {
        "has_whiteboard": False,
        "has_equation": False,
        "has_example": False,
        "has_diagram": False,
        "has_references": False
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
        r"(?i)let's consider", r"(?i)consider this example"
    ]
    for pattern in example_patterns:
        if re.search(pattern, formatted_text):
            lecture_components["has_example"] = True
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


def generate_google_meet_link():
    """Generate a random Google Meet link."""
    # Generate a random 10-character meeting ID
    meeting_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
    return f"https://meet.google.com/{meeting_id}-{random.randint(100, 999)}-{random.randint(100, 999)}"


async def extract_text_from_pdf_url(pdf_url):
    """Extract text from a PDF at the given URL"""
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


def get_youtube_transcript(youtube_url: str) -> str:
    """
    Extract transcript from a YouTube video URL.
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