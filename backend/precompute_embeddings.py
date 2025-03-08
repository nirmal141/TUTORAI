import os
from pinecone import Pinecone
from langchain.embeddings import OpenAIEmbeddings 
import PyPDF2
from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
import uuid

load_dotenv()

pc = Pinecone(
    api_key=os.getenv("PINECONE_API_KEY")
)

index = pc.Index(os.getenv("INDEX_NAME"))
embedder = OpenAIEmbeddings()

# Path to the ML transcripts
ML_TRANSCRIPTS_FOLDER = "data/andrewng/ml"

def process_pdf(file_path):
    """Extract text from a PDF file."""
    reader = PyPDF2.PdfReader(file_path)
    text = " ".join([page.extract_text() for page in reader.pages if page.extract_text()])
    return text

def store_embeddings(pdf_path):
    pdf_reader = PyPDF2.PdfReader(pdf_path)
    text = "\n".join([page.extract_text() for page in pdf_reader.pages if page.extract_text()])

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = text_splitter.split_text(text)

    embeddings = embedder.embed_documents(chunks)

    upsert_data = [
        (str(uuid.uuid4()), embedding, {"text": chunk})
        for chunk, embedding in zip(chunks, embeddings)
    ]
    index.upsert(upsert_data)

    return {"message": f"Added {len(chunks)} chunks from {pdf_path} to RAG"}

if __name__ == "__main__":
    pdf_files = [os.path.join(ML_TRANSCRIPTS_FOLDER, f) for f in sorted(os.listdir(ML_TRANSCRIPTS_FOLDER)) if f.endswith(".pdf")]
    
    if not pdf_files:
        print("No PDF files found in the ML transcripts folder!")
    else:
        for pdf in pdf_files:
            store_embeddings(pdf)
        print("All transcripts embedded successfully!")
