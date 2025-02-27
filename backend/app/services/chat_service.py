import requests
from app.utils.openai_client import OpenAIClient
from .web_search_service import get_web_search_results
from fastapi import HTTPException

LM_STUDIO_URL = "http://127.0.0.1:1234/v1/chat/completions"
LM_STUDIO_HEADERS = {
    "Content-Type": "application/json"
}

async def process_chat_request(request):
    system_message = f"You are Professor {request.professor.name}, an expert educator in {request.professor.field}..."
    
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
    
    # Logic to call either LM Studio or OpenAI
    if request.model_type == "local":
        return await call_lm_studio(system_message, request.message)
    
    elif request.model_type == "openai":
        return await call_openai(system_message, request.message, search_context, search_results)

async def call_lm_studio(system_message, message):
    payload = {
        "messages": [{"role": "system", "content": system_message}, {"role": "user", "content": message}],
        "temperature": 0.7,
        "max_tokens": 4000,
        "stream": False
    }
    
    response = requests.post(LM_STUDIO_URL, json=payload, headers=LM_STUDIO_HEADERS)
    
    if response.status_code == 200:
        return {"response": response.json()["choices"][0]["message"]["content"]}
    else:
        raise HTTPException(status_code=500, detail=f"LM Studio error: {response.status_code}")

async def call_openai(system_message, message, search_context, search_results):
    client = OpenAIClient()  # Assuming a utility client for OpenAI setup
    messages = [
        {"role": "system", "content": system_message},
        {"role": "user", "content": message}
    ]
    
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
