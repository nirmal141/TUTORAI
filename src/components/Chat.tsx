// chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Trash2, Globe, Upload, FileText, Youtube } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // <-- Import react-markdown
import { useChatHistory } from '../hooks/useChatHistory';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@headlessui/react';

// Add interface for search source
interface SearchSource {
  title: string;
  link: string;
  summary: string;
  is_academic?: boolean;  // New field to identify academic sources
}

// Update Message interface
interface Message {
  id: number;
  type: 'user' | 'bot' | 'search';
  content: string;
  timestamp: Date;
  sources?: SearchSource[];
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export interface SelectedProfessor {
  name: string;
  field: string;
  teachingMode: string;
  adviceType: string;
  modelType: string;
}

interface ChatProps {
  selectedProfessor: SelectedProfessor | null;
  initialPrompt?: string;
}

// Type-safe URL helper function
const getDomainFromUrl = (urlString: string): string => {
  try {
    const url = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
    return url.hostname.replace('www.', '');
  } catch {
    return 'source';
  }
};

// Add this interface for search states
interface SearchState {
  status: 'searching' | 'found' | 'error' | null;
  query: string;
}

// Enhanced animation variants
const messageAnimationVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.4, 
      ease: [0.4, 0, 0.2, 1] // Improved easing
    }
  },
  hover: {
    scale: 1.01,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

// Add new loading animation variant
const loadingVariants = {
  animate: {
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Add this component at the top level of your file
export const SourcesBox = ({ sources }: { sources: SearchSource[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 bg-zinc-900/90 border border-blue-500/20 rounded-lg overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-400" />
          <span className="text-blue-400 text-sm font-medium">
            {sources.length} Academic Sources Found
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            className="w-4 h-4 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-2 border-t border-blue-500/20">
              {sources.map((source, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <a
                    href={source.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-all"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {source.is_academic ? (
                        <svg
                          className="w-4 h-4 text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 text-zinc-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-400 group-hover:text-blue-300 truncate">
                        {source.title}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {getDomainFromUrl(source.link)}
                      </p>
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Add new interfaces
interface UploadResponse {
  document_id: string;
  message: string;
}

export default function Chat({ selectedProfessor, initialPrompt }: ChatProps) {
  const {
    chatHistories,
    saveNewChat,
    loadChatHistory,
    startNewChat,
    deleteChat
  } = useChatHistory();

  const initialBotMessage: Message = {
    id: 1,
    type: 'bot',
    content: selectedProfessor ? `Welcome to class! I'm Professor ${selectedProfessor.name}, 
and I'll be your instructor in ${selectedProfessor.field}. 
${selectedProfessor.teachingMode === 'Socratic' 
  ? "I believe in learning through questioning and discussion."
  : selectedProfessor.teachingMode === 'Practical' 
    ? "I focus on practical, hands-on learning approaches."
    : "I'm here to guide you through your learning journey."
}

Feel free to ask me any questions about ${selectedProfessor.field}, 
whether it's about course content, research guidance, or ${selectedProfessor.adviceType} advice. 
Let's make this a productive learning session!`
: "Welcome! I'm your AI Assistant. How can I help you today?",
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<Message[]>([initialBotMessage]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loadingStates] = useState<string[]>([
    'Analyzing your question...',
    'Researching relevant information...',
    'Formulating a comprehensive response...',
    'Polishing the answer...'
  ]);
  const [currentLoadingState, setCurrentLoadingState] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const youtubeInputRef = useRef<HTMLInputElement>(null);

  // Add a ref to track if initial generation has happened
  const initialGenerationDone = useRef(false);

  // Move the state inside the component
  const [searchState, setSearchState] = useState<SearchState>({ status: null, query: '' });

  // Define handleInitialGeneration
  const handleInitialGeneration = async () => {
    if (!initialPrompt || isGenerating) return;
    
    setIsGenerating(true);
    setShowConversationModal(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: initialPrompt,
          model_type: selectedProfessor?.modelType || 'openai',
          professor: {
            name: selectedProfessor?.name || 'AI Educator',
            field: selectedProfessor?.field || 'General Knowledge',
            teachingMode: selectedProfessor?.teachingMode || 'Helpful',
            adviceType: 'educational'
          }
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'An error occurred');
      }

      const botMessage: Message = {
        id: messages.length + 1,
        type: 'bot',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      const botErrorMessage: Message = {
        id: messages.length + 1,
        type: 'bot',
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botErrorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Modify the useEffect for initial prompt
  useEffect(() => {
    if (initialPrompt && !initialGenerationDone.current) {
      initialGenerationDone.current = true;  // Mark as done
      handleInitialGeneration();
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setCurrentLoadingState((prev) => (prev + 1) % loadingStates.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isGenerating, loadingStates.length]);

  useEffect(() => {
    if (messages.length > 1) {
      saveNewChat(messages);
    }
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (searchState.status === 'searching') {
      interval = setInterval(() => {
        SearchingAnimation();
      }, 500);
    }
    return () => clearInterval(interval);
  }, [searchState.status]);

  const handleClearChat = () => {
    setMessages([{ ...initialBotMessage, timestamp: new Date() }]);
    setInput('');
    setShowConversationModal(false);
    startNewChat();
  };

  const handleLoadChatHistory = (historyId: string) => {
    const loadedMessages = loadChatHistory(historyId);
    setMessages(loadedMessages);
    setShowHistory(false);
    setShowConversationModal(true);
  };

  // Add file upload handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data: UploadResponse = await response.json();
      setCurrentDocumentId(data.document_id);
      
      // Add system message about uploaded document
      const uploadMessage: Message = {
        id: messages.length + 1,
        type: 'bot',
        content: `I've received your document "${file.name}". Feel free to ask me questions about its content.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, uploadMessage]);
      setShowUploadModal(false);

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage: Message = {
        id: messages.length + 1,
        type: 'bot',
        content: 'Sorry, there was an error uploading your document.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setUploadingFile(false); // Ensure this is called in finally block
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleYoutubeUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    const youtubeUrl = youtubeInputRef.current?.value;
    if (!youtubeUrl) return;

    try {
      setUploadingFile(true);
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ youtube_url: youtubeUrl }),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data: UploadResponse = await response.json();
      setCurrentDocumentId(data.document_id);
      
      // Add system message about uploaded video
      const uploadMessage: Message = {
        id: messages.length + 1,
        type: 'bot',
        content: `I've processed the YouTube video. Feel free to ask me questions about its content.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, uploadMessage]);
      setShowUploadModal(false);

    } catch (error) {
      console.error('YouTube processing error:', error);
      const errorMessage: Message = {
        id: messages.length + 1,
        type: 'bot',
        content: 'Sorry, there was an error processing the YouTube video.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setUploadingFile(false); // Ensure this is called in finally block
      if (youtubeInputRef.current) {
        youtubeInputRef.current.value = '';
      }
    }
  };

  // Update handleSend to include document context
  const handleSend = async (e: React.FormEvent, customMessage?: string) => {
    e.preventDefault();
    if ((!input.trim() && !customMessage) || isGenerating) return;

    const messageToSend = customMessage || input;
    setIsGenerating(true);
    setShowConversationModal(true);

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: messageToSend,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      if (enableWebSearch) {
        setSearchState({ status: 'searching', query: messageToSend });
      }

      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          model_type: selectedProfessor?.modelType || 'openai',
          professor: selectedProfessor,
          enable_search: enableWebSearch,
          document_id: currentDocumentId, // Add document context
          structured_response: true
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      // Handle search results if present
      if (enableWebSearch && data.search_results && data.search_results.length > 0) {
        setSearchState({ status: 'found', query: messageToSend });
        const searchMessage: Message = {
          id: messages.length + 2,
          type: 'search',
          content: 'Search Results:',
          timestamp: new Date(),
          sources: data.search_results
        };
        setMessages(prev => [...prev, searchMessage]);
      }

      // Format the response with source citations if available
      let formattedResponse = data.response;
      if (data.citations) {
        formattedResponse = `${data.response}\n\n---\n\n**Sources Used:**\n${
          data.citations.map((citation: string, index: number) => 
            `${index + 1}. ${citation}`
          ).join('\n')
        }`;
      }

      const botMessage: Message = {
        id: messages.length + (enableWebSearch ? 3 : 2),
        type: 'bot',
        content: formattedResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      setSearchState({ status: 'error', query: messageToSend });
      console.error('Error details:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      const botErrorMessage: Message = {
        id: messages.length + (enableWebSearch ? 3 : 2),
        type: 'bot',
        content: selectedProfessor?.modelType === 'local' 
          ? `LM Studio Error: ${errorMessage}. Please ensure LM Studio is running and a model is loaded.`
          : `Error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botErrorMessage]);
    } finally {
      setIsGenerating(false);
      // Reset search state after delay
      setTimeout(() => {
        setSearchState({ status: null, query: '' });
      }, 2000);
    }
  };

  // Update the SearchingAnimation component
  const SearchingAnimation = () => (

        <span className="text-white text-sm font-medium">Searching the web...</span>
     
  );

  // Update the WebSearchToggle component
  const WebSearchToggle = () => (
    <div className="flex items-center space-x-2 px-4 py-2">
      <Switch
        checked={enableWebSearch}
        onChange={setEnableWebSearch}
        className={`${
          enableWebSearch ? 'bg-gradient-to-r from-cyan-600 to-blue-600' : 'bg-zinc-700'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ring-offset-black`}
      >
        <motion.span
          layout
          className={`${
            enableWebSearch ? 'translate-x-6 bg-white' : 'translate-x-1 bg-zinc-300'
          } inline-block h-4 w-4 transform rounded-full shadow-lg transition-all duration-300`}
        />
      </Switch>
      <motion.div 
        className="flex items-center space-x-2"
        animate={{ color: enableWebSearch ? '#67e8f9' : '#71717a' }}
      >
        <span className="text-sm font-medium">Web Search</span>
        <Globe className="h-4 w-4" />
      </motion.div>
    </div>
  );

  // Add this to your existing search state handling
  useEffect(() => {
    if (searchState.status === 'searching') {
      // Progress bar will automatically start due to the animation
    } else if (searchState.status === 'found' || searchState.status === 'error') {
      // When search is complete, ensure progress bar is at 100%
      const progressBar = document.querySelector('.search-progress-bar') as HTMLElement;
      if (progressBar) {
        progressBar.style.transform = 'translateX(0%)';
      }
    }
  }, [searchState.status]);

  // Add Upload Modal Component
  const UploadModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full mx-4 border border-orange-500/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-orange-500">Upload Content</h3>
          <button
            onClick={() => setShowUploadModal(false)}
            className="text-orange-400 hover:text-orange-300"
            disabled={uploadingFile}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* File Upload Section */}
          <div className="border border-orange-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-400 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Upload Document
              </span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx"
              disabled={uploadingFile}
              className={`block w-full text-sm text-orange-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-orange-500 file:text-black
                hover:file:bg-orange-600
                file:cursor-pointer
                ${uploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <p className="text-xs text-orange-400/60 mt-2">Supported formats: PDF, DOCX</p>
          </div>

          {/* YouTube URL Section */}
          <div className="border border-orange-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-400 flex items-center gap-2">
                <Youtube className="h-4 w-4" />
                YouTube Video
              </span>
            </div>
            <form onSubmit={handleYoutubeUpload} className="flex gap-2">
              <input
                type="url"
                ref={youtubeInputRef}
                placeholder="Paste YouTube URL"
                disabled={uploadingFile}
                className={`flex-1 px-3 py-2 bg-zinc-800 border border-orange-500/20 rounded-lg text-orange-400 text-sm
                  ${uploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <button
                type="submit"
                disabled={uploadingFile}
                className={`px-4 py-2 bg-orange-500 text-black rounded-lg transition-colors
                  ${uploadingFile ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'}`}
              >
                Process
              </button>
            </form>
          </div>
        </div>

        {uploadingFile && (
          <div className="mt-4 flex items-center justify-center text-orange-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Processing...</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative font-inter"> {/* Add font-inter for better typography */}
      {/* Initial welcome message with dashboard-matching styling */}
      <div className="bg-zinc-900/95 backdrop-blur-sm border-t border-orange-500/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-black" />
            </div>
            <p className="text-sm text-orange-200/80 leading-relaxed">{initialBotMessage.content}</p>
          </div>
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 text-orange-400 rounded-lg hover:bg-zinc-700 transition-colors border border-orange-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">History</span>
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 text-orange-400 rounded-lg hover:bg-zinc-700 transition-colors border border-orange-500/20"
            >
              <Upload className="h-4 w-4" />
              <span className="text-sm font-medium">Upload</span>
            </button>
            <WebSearchToggle />
          </div>
        </div>
        <form onSubmit={handleSend} className="mt-4 flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 px-4 py-3 bg-zinc-800 border border-orange-500/20 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-orange-200 text-sm"
            disabled={isGenerating}
          />
          <button
            type="submit"
            className={`px-6 py-3 rounded-r-lg transition-colors ${
              isGenerating 
                ? 'bg-zinc-800 text-gray-500' 
                : 'bg-gradient-to-r from-orange-500 to-amber-500 text-black hover:from-orange-600 hover:to-amber-600'
            }`}
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </form>
      </div>

      {/* Conversation Modal with dashboard theme */}
      {showConversationModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex flex-col bg-black/95 backdrop-blur-sm"
        >
          <div className="p-4 border-b border-orange-500/20 bg-zinc-900 shadow-sm flex justify-between items-center">
            <h3 className="text-xl font-semibold text-orange-500">Conversation</h3>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleClearChat}
                className="px-4 py-2 text-sm bg-gradient-to-r from-orange-500 to-amber-500 text-black rounded-lg hover:from-orange-600 hover:to-amber-600 transition-colors"
              >
                New Chat
              </button>
              <button 
                onClick={() => setShowHistory(true)}
                className="px-4 py-2 text-sm bg-zinc-800 text-orange-400 rounded-lg hover:bg-zinc-700 transition-colors border border-orange-500/20"
              >
                History
              </button>
              <button 
                onClick={() => setShowConversationModal(false)}
                className="p-2 text-orange-400 hover:text-orange-300 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages container with enhanced animations */}
          <div className="flex-1 overflow-y-auto p-6 bg-black/90">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  variants={messageAnimationVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  layout
                  className={`flex items-start gap-4 mb-6 ${
                    message.type === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black'
                        : message.type === 'search'
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-400 text-white'
                          : 'bg-gradient-to-r from-zinc-800 to-zinc-700 text-orange-400'
                    }`}
                  >
                    {message.type === 'user' ? (
                      <User className="h-5 w-5" />
                    ) : message.type === 'search' ? (
                      <Globe className="h-5 w-5" />
                    ) : (
                      <Bot className="h-5 w-5" />
                    )}
                  </motion.div>
                  <div className={`flex-1 ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                    {message.type === 'search' && message.sources ? (
                      <SourcesBox sources={message.sources} />
                    ) : (
                      <motion.div 
                        className={`p-4 rounded-2xl backdrop-blur-sm ${
                          message.type === 'bot' 
                            ? 'bg-gradient-to-br from-zinc-900/95 to-zinc-800/95 border border-orange-500/20 text-white'
                            : 'bg-gradient-to-br from-orange-500 to-amber-500 text-white'
                        }`}
                      >
                        <ReactMarkdown 
                          className="prose prose-invert max-w-none"
                          components={{
                            p: ({children}) => <p className="text-white/90">{children}</p>,
                            a: ({children, href}) => (
                              <a href={href} className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">
                                {children}
                              </a>
                            ),
                            ul: ({children}) => <ul className="text-white/90 list-disc ml-4">{children}</ul>,
                            ol: ({children}) => <ol className="text-white/90 list-decimal ml-4">{children}</ol>,
                            li: ({children}) => <li className="text-white/90">{children}</li>,
                            code: ({children}) => <code className="bg-zinc-800 text-white/90 px-1 rounded">{children}</code>,
                            pre: ({children}) => <pre className="bg-zinc-800 p-4 rounded-lg overflow-x-auto">{children}</pre>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            

            {/* Loading State */}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-start gap-4 mb-6"
              >
                <motion.div
                  variants={loadingVariants}
                  animate="animate"
                  className="flex items-center space-x-3 p-4 bg-gradient-to-r from-zinc-900/90 to-zinc-800/90 rounded-2xl border border-orange-500/20"
                >
                  <Loader2 className="h-5 w-5 animate-spin text-orange-400" />
                  <span className="text-orange-200 font-medium">
                    {loadingStates[currentLoadingState]}
                  </span>
                </motion.div>
              </motion.div>
            )}

            {searchState.status === 'searching' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex  items-center gap-4 mb-6"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
                  <Globe className="h-5 w-5 animate-spin" />
                </div>
                <div className="max-w-[80%] items-start">
                  
                    <SearchingAnimation />
                  
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input at bottom of modal with dashboard theme */}
          <div className="p-4 border-t border-orange-500/20 bg-zinc-900">
            <form onSubmit={handleSend} className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 px-4 py-3 bg-zinc-800 border border-orange-500/20 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-orange-200 text-sm"
                disabled={isGenerating}
              />
              <button
                type="submit"
                className={`px-6 py-3 rounded-r-lg transition-colors ${
                  isGenerating 
                    ? 'bg-zinc-800 text-gray-500' 
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 text-black hover:from-orange-600 hover:to-amber-600'
                }`}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {/* History Modal with dashboard theme */}
      {showHistory && (
        <div className="fixed inset-0 z-40 flex flex-col bg-black">
          <div className="p-4 border-b border-orange-500/20 flex justify-between items-center">
            <h3 className="text-xl font-bold text-orange-500">Chat History</h3>
            <button 
              onClick={() => setShowHistory(false)}
              className="text-orange-400 hover:text-orange-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {chatHistories.length === 0 ? (
              <div className="text-center text-orange-500 mt-8">
                <svg className="w-16 h-16 mx-auto mb-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-lg font-medium">No saved chats yet</p>
                <p className="text-sm mt-2">Your conversations will appear here automatically</p>
              </div>
            ) : (
              <div className="space-y-4">
                {chatHistories.slice().reverse().map(history => (
                  <div
                    key={history.id}
                    className="w-full p-4 bg-white border rounded-lg hover:border-orange-400 transition-colors group"
                  >
                    <div className="flex justify-between items-start">
                      <button
                        onClick={() => handleLoadChatHistory(history.id)}
                        className="flex-1 text-left"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 group-hover:text-orange-600 transition-colors">
                            {history.title}
                          </p>
                          <p className="text-xs text-orange-500 mt-1">
                            {new Date(history.createdAt).toLocaleDateString()} at{' '}
                            {new Date(history.createdAt).toLocaleTimeString()}
                          </p>
                          <div className="mt-2 text-sm text-gray-600">
                            <p className="line-clamp-2">
                              <span className="font-medium">Q:</span> {history.messages[1]?.content}
                            </p>
                            {history.messages[2] && (
                              <p className="line-clamp-2 mt-1">
                                <span className="font-medium">A:</span> {history.messages[2]?.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(history.id)}
                        className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete chat"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal with dashboard theme */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-zinc-900 rounded-lg p-6 max-w-sm mx-4 border border-orange-500/20">
            <h3 className="text-lg font-semibold mb-4 text-orange-500">Delete Chat</h3>
            <p className="text-orange-200/80 mb-6">
              Are you sure you want to delete this chat? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm text-orange-400 hover:text-orange-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteChat(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-sm text-black bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Upload Modal */}
      {showUploadModal && <UploadModal />}
    </div>
  );
}
