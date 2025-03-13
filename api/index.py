from http.server import BaseHTTPRequestHandler
from openai import OpenAI
import os
import json
from dotenv import load_dotenv
from urllib.parse import parse_qs

# Load environment variables
load_dotenv()

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            request_data = json.loads(post_data)
            
            # Initialize OpenAI client
            client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
            
            # Extract data from request
            message = request_data.get('message', '')
            model_type = request_data.get('model_type', 'gpt-3.5-turbo')
            professor = request_data.get('professor', {})
            
            # Create a system message based on professor details
            system_message = f"You are Professor {professor.get('name', 'Unknown')}, "
            system_message += f"an expert in {professor.get('field', 'various subjects')}. "
            system_message += f"Your teaching style is {professor.get('teachingMode', 'adaptive')} "
            system_message += f"and you provide {professor.get('adviceType', 'helpful')} advice."
            
            # Create the chat completion
            response = client.chat.completions.create(
                model="gpt-4o" if model_type == "gpt4" else "gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": message}
                ],
                temperature=0.7,
            )
            
            # Return the response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            response_data = {
                "response": response.choices[0].message.content,
                "model": model_type
            }
            
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
    
    def do_GET(self):
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "healthy"}).encode())
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Not found"}).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers() 