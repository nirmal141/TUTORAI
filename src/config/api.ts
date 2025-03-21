// API configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  CHAT: `${API_URL}/api/chat`,
  DOCUMENTS: `${API_URL}/api/documents`,
  DOCUMENT_CHAT: `${API_URL}/api/document-chat`,
  UPLOAD: `${API_URL}/api/upload`,
  PROFESSOR_AVAILABILITY: `${API_URL}/api/professor/availability`,
  BOOK_MEETING: `${API_URL}/api/student/book-meeting`,
  BOOKING: (id: string) => `${API_URL}/api/booking/${id}`,
  DOCUMENT: (id: string) => `${API_URL}/api/documents/${id}`,
  YOUTUBE_CHAT: `${API_URL}/api/youtube-chat`,
};

export default API_ENDPOINTS; 