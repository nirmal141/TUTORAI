# TutorAI - Intelligent Educational Platform

TutorAI is an advanced educational platform that connects students with AI professors for personalized learning experiences. The platform combines modern web technologies with AI capabilities to create an interactive, engaging learning environment.

## Features

### 🤖 AI Professors
- Chat with specialized AI professors in various academic fields
- Customizable teaching modes and advice types
- Web search integration for up-to-date information

### 📝 Document Analysis
- Upload and analyze PDF documents
- Ask questions about document content
- Receive AI-powered explanations and insights

### 📹 YouTube Learning
- Learn from YouTube videos with AI assistance
- Extract and analyze video content
- Get explanations and summaries

### 📅 Virtual Office Hours
- Book meetings with AI professors
- Manage meeting schedules and availability
- Virtual office hours for personalized assistance

### 📚 Educational Resources
- Access to curated educational materials
- Knowledge graph visualization
- Interactive learning tools

### 🎓 Course Management
- Browse available courses
- Track learning progress
- Personalized course recommendations

## Technical Stack

### Frontend
- **React** with TypeScript for the user interface
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **React Markdown** for rendering markdown content

### Backend
- **FastAPI** for API endpoints
- **OpenAI API** for AI chat capabilities
- **DuckDuckGo Search** for web search integration
- **PyPDF2 & pdfplumber** for document analysis
- **Supabase** for database functionality

## Prerequisites

Before you begin, ensure you have the following installed:
- Python (3.x recommended)
- Node.js (Latest LTS version)
- npm or yarn package manager
- LM Studio (optional, for local model deployment)

## Installation

1. Clone the repository

```bash
git clone https://github.com/nirmal141/TUTORAI.git
cd TUTORAI
```

2. Install frontend dependencies

```bash
npm install
```

3. Install backend dependencies

```bash
pip install -r backend/requirements.txt
```

4. Set up environment variables
- Create a `.env` file in the root directory
- Add your OpenAI API key: `OPENAI_API_KEY=your_api_key_here`

## Running the Application

1. Start the backend server

```bash
python backend/main.py
```

2. Start the frontend development server

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173` to view the application

## API Endpoints

The backend provides several API endpoints:

- `/api/chat` - Interact with AI professors
- `/api/document-chat` - Analyze and chat about documents
- `/api/knowledge-graph` - Access knowledge graph data
- `/api/professor/availability` - Manage professor availability
- `/api/student/book-meeting` - Book meetings with professors
- `/api/student/bookings` - View student's booked meetings
- `/api/professor/bookings` - View professor's scheduled meetings

## User Interface

The application features a modern, responsive UI with:
- Dark/light mode support
- Animated backgrounds and transitions
- Sidebar navigation for easy access to features
- Chat interface with markdown support
- Interactive components and visualizations

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
