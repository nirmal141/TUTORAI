# TutorAI - An AI-Powered Educational Platform

TutorAI is an intelligent educational platform that connects students with AI professors specializing in various fields. The platform provides personalized learning experiences through interactive Q&A, document analysis, YouTube video discussions, and virtual office hours.

## 🔄 Project Architecture

The application has been refactored into a clean, modular structure:

```
backend/
├── app/                      # Main application package
│   ├── config/               # Configuration settings
│   ├── models/               # Pydantic data models/schemas
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic services
│   └── utils/                # Helper functions and utilities 
├── data/                     # Data storage (if applicable)
├── uploads/                  # Document upload directory
├── main.py                   # Application entry point
└── requirements.txt          # Python dependencies
```

## ✨ Features

- 🧠 **AI Professor Conversations**: Chat with AI professors specializing in various academic fields
- 📚 **Document Analysis**: Upload and discuss academic papers, textbooks, and other documents
- 🎬 **YouTube Learning**: Analyze and discuss educational videos with AI professors
- 📅 **Virtual Office Hours**: Schedule meetings with AI professors for personalized help
- 🔍 **Web Search Integration**: Get up-to-date information from academic sources when needed
- 📊 **Knowledge Graphing**: Visualize connections between academic concepts (placeholder)

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+ and npm (for the frontend)
- OpenAI API key (for AI functionality)
- Pinecone API key (optional, for document embedding/RAG functionality)

### Backend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/tutorai.git
   cd tutorai
   ```

2. Set up a Python virtual environment
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example`
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and settings
   ```

5. Start the backend server
   ```bash
   python main.py
   # Or alternatively: uvicorn app.main:app --reload
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. Install frontend dependencies
   ```bash
   cd ..  # Back to the project root
   npm install
   ```

2. Start the frontend development server
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## 🔧 Configuration

Create a `.env` file in the backend directory with the following variables:

```
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key

# Pinecone Configuration (optional)
PINECONE_API_KEY=your_pinecone_api_key
INDEX_NAME=your_pinecone_index_name
```

## 🔌 API Endpoints

### Chat

- `POST /api/chat` - Chat with an AI professor
- `POST /api/document-chat` - Discuss a specific document with an AI professor
- `POST /api/youtube-chat` - Discuss a YouTube video with an AI professor

### Documents

- `POST /api/upload` - Upload a document or YouTube URL
- `GET /api/documents` - Get all documents
- `GET /api/documents/{document_id}` - Get a specific document
- `POST /api/add_to_rag` - Add a document to the RAG system (if Pinecone is configured)

### Meetings

- `POST /api/professor/availability` - Add professor availability
- `GET /api/professor/availability` - Get professor availabilities
- `POST /api/student/book-meeting` - Book a meeting with a professor
- `GET /api/student/bookings` - Get a student's bookings
- `GET /api/professor/bookings` - Get a professor's bookings
- `DELETE /api/booking/{booking_id}` - Cancel a booking

### Utilities

- `GET /api/health` - Health check endpoint
- `GET /api/knowledge-graph` - Get knowledge graph data (placeholder)

## 🛠️ Development

### Code Structure

The backend has been refactored to follow these separation of concerns:

- **Models**: Data schemas using Pydantic
- **Routes**: API endpoint definitions
- **Services**: Business logic implementation
- **Utils**: Helper functions and utilities
- **Config**: Application configuration

### Local Development

For local development, you can enable hot-reloading:

```bash
# Backend
cd backend
uvicorn app.main:app --reload

# Frontend
cd ..
npm run dev
```

### Using LM Studio for Local Models

TutorAI supports using local models via LM Studio:

1. Download and install [LM Studio](https://lmstudio.ai/)
2. Load a compatible model in LM Studio
3. Start the local server in LM Studio
4. In your chat request, set `model_type` to `"local"`

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📚 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Additional Information

### LM Studio Integration
To use local models with LM Studio:
1. Install and run LM Studio
2. Set up the API server in LM Studio
3. The backend will automatically connect to LM Studio's API endpoint

### Animated Backgrounds
The application features custom animated backgrounds that adapt to user interactions and preferences, creating an engaging learning environment.

## License

[Add your license information here]

## Acknowledgements

- OpenAI for providing the AI capabilities
- All the open-source libraries and frameworks that made this project possible

### To use the application, you need to have LM Studio running (setup the url for that), and the API key for OpenAI.


![Screenshot 2025-03-04 at 1 59 50 PM](https://github.com/user-attachments/assets/5d10d1a0-8576-4137-a35e-9019bd3785b2)
![Screenshot 2025-03-04 at 2 00 06 PM](https://github.com/user-attachments/assets/438ba7de-a23e-41b9-8e4e-d8ef17b5aa51)

![Screenshot 2025-03-04 at 2 00 40 PM](https://github.com/user-attachments/assets/eacad9e5-db11-4588-b2df-c89075c68ee2)
![Screenshot 2025-03-04 at 2 01 02 PM](https://github.com/user-attachments/assets/a634dd26-9748-4207-8ab9-3dac75e7952b)
![Screenshot 2025-03-04 at 2 01 33 PM](https://github.com/user-attachments/assets/ebfc368f-b2c4-4776-b985-9575a790e5fc)

![Screenshot 2025-03-04 at 2 03 42 PM](https://github.com/user-attachments/assets/51581ae3-e023-4adf-ad2d-d538eed562b0)
![Screenshot 2025-03-04 at 2 03 52 PM](https://github.com/user-attachments/assets/59172310-7e5b-4255-8408-c51274ca770e)
![Screenshot 2025-03-04 at 2 03 59 PM](https://github.com/user-attachments/assets/9e8b6d6a-da00-44bd-be10-ac876e7be858)
![Screenshot 2025-03-04 at 2 04 05 PM](https://github.com/user-attachments/assets/fd60fd3e-1c0f-4dbc-ae40-9652157bad3c)
![Screenshot 2025-03-04 at 2 04 13 PM](https://github.com/user-attachments/assets/7ad9194b-6956-4115-aac0-e6c78c059341)
