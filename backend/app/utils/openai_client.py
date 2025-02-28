from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

class OpenAIClient:
    def __init__(self):
        print("initialising open ai client")
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    def chat(self, messages, temperature, model="gpt-4o-mini"):
        return self.client.chat.completions.create(model=model, messages=messages, temperature=temperature)