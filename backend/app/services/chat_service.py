import os
import requests
from openai import OpenAI
from fastapi import HTTPException
from ..config.settings import OPENAI_API_KEY, LM_STUDIO_URL, LM_STUDIO_HEADERS
from ..services.search_service import get_web_search_results
from ..utils.helpers import process_thinking_content, process_lecture_formatting

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

async def process_chat_request(message: str, model_type: str, professor: dict, enable_search: bool = False):
    """
    Process a chat request with the selected model and professor.
    
    Args:
        message: User's message
        model_type: 'openai' or 'local'
        professor: Professor details dictionary
        enable_search: Whether to enable web search
        
    Returns:
        Processed response
    """
    try:
        # Create a rich classroom environment based on teaching mode
        classroom_style = ""
        if professor["teachingMode"] == "Socratic":
            classroom_style = """
You primarily teach through questioning. Rather than giving direct answers, you guide students to discover solutions themselves.
- Ask thought-provoking questions that lead students toward understanding
- When a student gives an answer, respond with follow-up questions
- Acknowledge good reasoning and gently correct misconceptions through more questions
- Use phrases like "What would happen if...?", "How might we approach...?", "Consider this scenario..."
- Create a dialogue that feels like a live classroom discussion
"""
        elif professor["teachingMode"] == "Practical":
            classroom_style = """
You focus on practical applications and real-world examples in your teaching.
- Ground abstract concepts in concrete, tangible examples that students can relate to
- Frequently reference how concepts apply in professional settings
- Use case studies and practical scenarios
- Phrase explanations as "In practice, this works by...", "A real-world application of this is..."
- Structure responses like a workshop environment with hands-on explanations
"""
        else:  # Default/Virtual teaching mode
            classroom_style = """
You provide clear, structured explanations with a mix of theory and application.
- Begin with clear learning objectives for the topic
- Organize content logically with main points and supporting details
- Use examples that clarify difficult concepts
- Incorporate occasional questions to check understanding
- Your tone is encouraging but maintains academic rigor
"""

        # Base system message with enhanced classroom environment
        base_system_message = f"""You are Professor {professor["name"]}, an expert educator in {professor["field"]}. 
You are currently teaching a class and responding to a student's question or comment.

CLASSROOM ENVIRONMENT:
- You are standing at the front of a classroom with students seated before you
- You have access to a whiteboard/chalkboard for diagrams or equations (use markdown for these)
- The atmosphere is scholarly but engaging
- There may be other students listening in
- This is a live classroom session, not an online chat

YOUR TEACHING STYLE:
{classroom_style}

SUBJECT EXPERTISE:
- As an expert in {professor["field"]}, you have deep knowledge of the subject matter
- You're familiar with both foundational concepts and cutting-edge developments
- You can explain complex topics at different levels based on student needs
- You cite relevant scholars or research when appropriate

RESPONSE FORMAT:
- Address the student directly as if speaking in a classroom
- Use classroom language like "As we discussed earlier...", "Let's explore this concept...", or "If you look at the board..."
- For equations or diagrams, use markdown formatting as if writing on a board
- Include brief pauses or transitions between explanations as you would in a lecture
- If appropriate for the question, structure your response as: 1) acknowledge the question, 2) provide context, 3) explain the concept, 4) give examples, 5) check understanding

ADVICE SPECIALIZATION:
You specialize in providing {professor["adviceType"]} to students.
"""
        
        # Add thinking instructions only for local models
        if model_type == "local":
            system_message = f"""{base_system_message}

Please show your reasoning and thinking process before providing your final answer. 
Structure your response in this format:

<think>
[Your step-by-step reasoning and thought process goes here. Include any considerations, evaluations of different approaches, or background knowledge you're applying. This helps the student understand how an expert approaches this type of problem.]
</think>

[Your final, polished classroom response goes here without the thinking process. This should be a clear, instructive response as if speaking directly to students in your classroom.]
"""
        else:
            # For OpenAI models, use the enhanced base message without thinking instructions
            system_message = base_system_message
        
        # If web search is enabled, perform specialized academic search
        search_context = ""
        search_results = []
        
        if enable_search:
            print(f"Web search enabled for query: '{message}'")
            search_context, search_results = await get_web_search_results(
                query=message,
                professor={
                    "name": professor["name"],
                    "field": professor["field"]
                }
            )
            
            if search_results:
                # Create search system message with classroom context
                search_system_message = (
                    "You have been provided with recent web search results relevant to the student's question. "
                    "Use these sources to enhance your classroom response while maintaining your teaching style. "
                    "\n\nGuidelines for using search results in your classroom:"
                    "\n1. Refer to the sources as if they're materials you're familiar with - 'In a study by...' or 'According to recent research...'"
                    "\n2. Cite sources naturally as you would in a lecture, using [Source X] notation where X is the source number"
                    "\n3. Synthesize information from multiple sources when appropriate, as a professor would when lecturing"
                    "\n4. If the search results don't contain relevant information, rely on your expertise"
                    "\n5. Maintain your classroom presence and teaching style throughout"
                    "\n6. For academic sources, explain their relevance to the class topic"
                    "\n\nThe reference materials are:"
                    f"\n\n{search_context}"
                )
                
                # Add thinking reminder only for local models
                if model_type == "local":
                    search_system_message += "\n\nRemember to include your thinking in <think> tags before your final classroom response."
                
                system_message += "\n\n" + search_system_message

        if model_type == "local":
            try:
                print("Attempting LM Studio request...")
                
                payload = {
                    "messages": [
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": message}
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
                    raw_response = response_json["choices"][0]["message"]["content"]
                    
                    # Process thinking content for local models
                    processed_response = process_thinking_content(raw_response)
                    
                    return {
                        "response": raw_response,  # Keep original response with thinking tags
                        "search_results": search_results if search_results else None,
                        "has_thinking": processed_response["has_thinking"]
                    }
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
                
        elif model_type == "openai":
            try:
                messages = [
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": message}
                ]
                
                response = client.chat.completions.create(
                    model="gpt-4o-mini",  # Using a more capable model
                    messages=messages,
                    temperature=0.85
                )
                
                # Format citations in a more readable way for the frontend
                if search_results:
                    response_text = response.choices[0].message.content
                    
                    # Process for lecture formatting
                    lecture_processed = process_lecture_formatting(response_text)
                    
                    return {
                        "response": lecture_processed["formatted_text"],
                        "search_results": search_results,
                        "lecture_components": lecture_processed["lecture_components"]
                    }
                else:
                    response_text = response.choices[0].message.content
                    
                    # Process for lecture formatting
                    lecture_processed = process_lecture_formatting(response_text)
                    
                    return {
                        "response": lecture_processed["formatted_text"],
                        "lecture_components": lecture_processed["lecture_components"]
                    }
            except Exception as e:
                print(f"OpenAI error: {str(e)}")
                raise HTTPException(status_code=500, detail=f"OpenAI error: {str(e)}")
            
    except Exception as e:
        print(f"Unexpected error in chat service: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_document_chat(document_id: str, document_url: str, document_title: str, message: str, previous_messages: list = []):
    """
    Process a document-based chat request.
    
    Args:
        document_id: Document ID
        document_url: URL to the document
        document_title: Document title
        message: User's message
        previous_messages: Previous conversation messages
        
    Returns:
        Processed response
    """
    try:
        from ..utils.helpers import extract_text_from_pdf_url
        
        # Download and extract text from the PDF
        document_text = await extract_text_from_pdf_url(document_url)
        
        if not document_text or document_text.startswith("Error"):
            return {"response": "I couldn't extract text from this document. The PDF might be scanned, password-protected, or in an unsupported format."}
        
        # Truncate text if too long
        max_chars = 100000  # Adjust based on token limits
        if len(document_text) > max_chars:
            document_text = document_text[:max_chars] + "...(content truncated due to length)"
        
        # Create classroom-oriented system prompt
        classroom_system_prompt = f"""You are a professor leading a class discussion about the document titled '{document_title}'.
        
CLASSROOM ENVIRONMENT:
- You are in a classroom with students discussing this document as a learning resource
- You reference specific parts of the document when answering questions
- You use a professional yet engaging teaching tone
- You might occasionally ask rhetorical questions to emphasize important points
- When appropriate, you relate concepts in the document to broader academic contexts

YOUR APPROACH:
- Begin by acknowledging the student's question about the document
- Reference specific sections, pages, or paragraphs from the document to support your explanations
- Use phrases like "In this document, we can see..." or "The author addresses this on page X..."
- If the document has data or figures, explain them in an educational context
- Connect the document's content to classroom learning objectives
- Be honest if the document doesn't address a particular question

RESPONSE FORMAT:
- Address the student directly as if in a classroom setting
- Structure your response clearly and pedagogically
- Cite specific parts of the document when relevant
- Consider using an introduction, main points, and conclusion format
- Wrap up with suggestions for further exploration if appropriate
"""
        
        # Build context from previous messages
        messages = [
            {"role": "system", "content": classroom_system_prompt}
        ]
        
        # Add previous conversation context
        for msg in previous_messages:
            messages.append({"role": msg["role"], "content": msg["content"]})
        
        # Add the document content and user's question
        messages.append({
            "role": "user", 
            "content": f"Here is the content of the document '{document_title}':\n\n{document_text}\n\nStudent question: {message}\n\nPlease respond as if we're discussing this document in class."
        })
        
        # Get response from OpenAI
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Using a more capable model for document analysis
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )
        
        response_text = response.choices[0].message.content
        
        # Process for lecture formatting
        lecture_processed = process_lecture_formatting(response_text)
        
        return {
            "response": lecture_processed["formatted_text"],
            "lecture_components": lecture_processed["lecture_components"]
        }
    
    except Exception as e:
        print(f"Error in document_chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing document chat: {str(e)}")

async def process_youtube_chat(youtube_url: str, video_title: str, message: str, previous_messages: list = []):
    """
    Process a YouTube video-based chat request.
    
    Args:
        youtube_url: YouTube video URL
        video_title: Video title
        message: User's message
        previous_messages: Previous conversation messages
        
    Returns:
        Processed response
    """
    try:
        from ..utils.helpers import get_youtube_transcript
        
        # Fetch YouTube transcript
        transcript_text = get_youtube_transcript(youtube_url)
        
        if not transcript_text or transcript_text.startswith("Error"):
            return {"response": "I couldn't extract the transcript from this YouTube video. It might not have captions available or might be in an unsupported format."}
        
        # Truncate text if too long
        max_chars = 50000  # Adjust based on token limits
        if len(transcript_text) > max_chars:
            transcript_text = transcript_text[:max_chars] + "...(transcript truncated due to length)"
        
        # Create classroom-oriented system prompt for YouTube discussions
        classroom_system_prompt = f"""You are a professor leading a class discussion about a YouTube video titled '{video_title}'.
        
CLASSROOM ENVIRONMENT:
- You are in a classroom with students discussing this educational video as a learning resource
- You reference specific parts of the video and transcript when answering questions
- You use a professional yet engaging teaching tone
- You might occasionally ask rhetorical questions to emphasize important points
- When appropriate, you relate concepts in the video to broader academic contexts

YOUR APPROACH:
- Begin by acknowledging the student's question about the video
- Reference specific timestamps, quotes, or sections from the video/transcript to support your explanations
- Use phrases like "In this video, the presenter explains..." or "At around [timestamp], we can see..."
- Explain complex concepts from the video in an accessible, educational manner
- Connect the video's content to classroom learning objectives
- Be honest if the video doesn't address a particular question

RESPONSE FORMAT:
- Address the student directly as if in a classroom setting
- Structure your response clearly and pedagogically
- Cite specific parts of the video transcript when relevant
- Consider using an introduction, main points, and conclusion format
- Wrap up with suggestions for further exploration if appropriate
"""
        
        # Build context from previous messages
        messages = [
            {"role": "system", "content": classroom_system_prompt}
        ]
        
        # Add previous conversation context
        for msg in previous_messages:
            messages.append({"role": msg["role"], "content": msg["content"]})
        
        # Add the video transcript and user's question
        messages.append({
            "role": "user", 
            "content": f"Here is the transcript of the YouTube video '{video_title}' ({youtube_url}):\n\n{transcript_text}\n\nStudent question: {message}\n\nPlease respond as if we're discussing this video in class."
        })
        
        # Get response from OpenAI
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Using a more capable model for video analysis
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )
        
        response_text = response.choices[0].message.content
        
        # Process for lecture formatting
        lecture_processed = process_lecture_formatting(response_text)
        
        return {
            "response": lecture_processed["formatted_text"],
            "lecture_components": lecture_processed["lecture_components"]
        }
    
    except Exception as e:
        print(f"Error in youtube_chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing YouTube chat: {str(e)}") 