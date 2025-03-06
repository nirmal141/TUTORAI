// chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Loader2, Globe, Upload, FileText, Youtube, X, Clock, MessageSquare, Minimize2, Maximize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // <-- Import react-markdown
import { useChatHistory } from '../hooks/useChatHistory';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@headlessui/react';
import { Button } from './ui/button';
import { Input } from './ui/input';

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
  onClose?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
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

export default function Chat({ selectedProfessor, initialPrompt, onClose, isExpanded, onToggleExpand }: ChatProps) {
  const {
    chatHistories,
    saveNewChat,
    loadChatHistory,
    startNewChat,
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
    
    // Add a subtle notification
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-500 flex items-center gap-2';
    notification.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <span>Chat cleared successfully</span>
    `;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(20px)';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  };

  const handleLoadChatHistory = (historyId: string) => {
    const loadedMessages = loadChatHistory(historyId);
    setMessages(loadedMessages);
    setShowHistory(false);
    setShowConversationModal(true);
    
    // Add loading animation
    const chatContainer = document.querySelector('.chat-messages-container');
    if (chatContainer) {
      chatContainer.classList.add('loading-pulse');
      setTimeout(() => chatContainer.classList.remove('loading-pulse'), 800);
    }
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

  // Update the SearchingAnimation component with a more modern design
  const SearchingAnimation = () => (
    <div className="flex flex-col items-start">
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
      </div>
      <div className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent font-medium">
        Searching the web for relevant information...
      </div>
      <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
        <div className="search-progress-bar h-full w-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transform -translate-x-full animate-search-progress"></div>
      </div>
    </div>
  );

  // Update the WebSearchToggle component with a more modern design
  const WebSearchToggle = () => (
    <div className="flex items-center space-x-2 px-4 py-2">
      <Switch
        checked={enableWebSearch}
        onChange={setEnableWebSearch}
        className={`${
          enableWebSearch ? 'bg-gradient-to-r from-blue-600 to-cyan-400' : 'bg-zinc-800'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 ring-offset-black`}
      >
        <span className="sr-only">Enable web search</span>
        <motion.span
          layout
          className={`${
            enableWebSearch ? 'translate-x-6 bg-white' : 'translate-x-1 bg-zinc-400'
          } inline-block h-4 w-4 transform rounded-full shadow-lg transition-all duration-300`}
        />
      </Switch>
      <motion.div 
        className="flex items-center space-x-2"
        animate={{ 
          color: enableWebSearch ? '#38bdf8' : '#71717a',
          scale: enableWebSearch ? 1.05 : 1
        }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-sm font-medium">Web Search</span>
        <Globe className="h-4 w-4" />
      </motion.div>
    </div>
  );

  // Add Upload Modal Component with a more modern design
  const UploadModal = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-xl p-6 max-w-md w-full mx-4 border border-blue-500/20 shadow-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Upload Content</h3>
          <button
            onClick={() => setShowUploadModal(false)}
            className="text-zinc-400 hover:text-white transition-colors"
            disabled={uploadingFile}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* File Upload Section */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="border border-blue-500/20 rounded-xl p-5 bg-zinc-900/50"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-blue-400 flex items-center gap-2 font-medium">
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
              className={`block w-full text-sm text-blue-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-gradient-to-r file:from-blue-600 file:to-cyan-400 file:text-white
                hover:file:opacity-90
                file:cursor-pointer file:transition-opacity
                ${uploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <p className="text-xs text-blue-400/60 mt-2">Supported formats: PDF, DOCX</p>
          </motion.div>

          {/* YouTube URL Section */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="border border-blue-500/20 rounded-xl p-5 bg-zinc-900/50"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-blue-400 flex items-center gap-2 font-medium">
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
                className={`flex-1 px-3 py-2 bg-zinc-800/80 border border-blue-500/20 rounded-lg text-blue-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50
                  ${uploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <button
                type="submit"
                disabled={uploadingFile}
                className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-400 text-white rounded-lg transition-all
                  ${uploadingFile ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-blue-500/20'}`}
              >
                Process
              </button>
            </form>
          </motion.div>
        </div>

        {uploadingFile && (
          <div className="mt-6 flex flex-col items-center justify-center">
            <div className="relative w-16 h-16 mb-3">
              <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-r-2 border-l-2 border-cyan-400 animate-spin animation-delay-150"></div>
              <div className="absolute inset-4 rounded-full border-t-2 border-b-2 border-blue-300 animate-spin animation-delay-300"></div>
            </div>
            <span className="text-blue-400 font-medium">Processing your content...</span>
            <p className="text-xs text-blue-400/60 mt-1">This may take a moment</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <Bot className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <h3 className="font-medium text-zinc-900 dark:text-white">
              {selectedProfessor?.name || 'AI Assistant'}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {selectedProfessor?.field || 'Ready to help'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHistory(true)}
            className="rounded-md h-9 w-9 p-0"
            title="Chat History"
          >
            <Clock className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowUploadModal(true)}
            className="rounded-md h-9 w-9 p-0"
            title="Upload Document"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <WebSearchToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleExpand}
            className="rounded-md h-9 w-9 p-0"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-md h-9 w-9 p-0"
            title="Close Chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-start gap-3 ${
                message.type === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              {message.type === 'search' && message.sources ? (
                <SourcesBox sources={message.sources} />
              ) : (
                <div className={`p-4 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                } max-w-[80%]`}>
                  <ReactMarkdown 
                    className="text-sm prose dark:prose-invert max-w-none"
                    components={{
                      p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                      a: ({children, href}) => (
                        <a href={href} className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300" target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                      ul: ({children}) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                      li: ({children}) => <li>{children}</li>,
                      code: ({children}) => (
                        <code className="bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-sm">
                          {children}
                        </code>
                      ),
                      pre: ({children}) => (
                        <pre className="bg-zinc-200 dark:bg-zinc-700 p-3 rounded-lg overflow-x-auto my-2">
                          {children}
                        </pre>
                      ),
                      blockquote: ({children}) => (
                        <blockquote className="border-l-4 border-zinc-300 dark:border-zinc-600 pl-4 italic my-2">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                  <span className="text-xs opacity-50 mt-2 block">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">{loadingStates[currentLoadingState]}</span>
            </motion.div>
          )}
          {searchState.status === 'searching' && (
            <SearchingAnimation />
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || isGenerating}
            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </form>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 w-[480px] max-h-[80vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-medium">Chat History</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHistory(false)}
                  className="rounded-md h-9 w-9 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {chatHistories.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-6 w-6 text-zinc-400" />
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400">No chat history yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatHistories.map((history) => (
                      <motion.button
                        key={history.id}
                        onClick={() => {
                          handleLoadChatHistory(history.id);
                          setShowHistory(false);
                        }}
                        className="w-full text-left p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium group-hover:text-blue-500 transition-colors">
                            {history.title || 'Untitled Chat'}
                          </h4>
                          <span className="text-xs text-zinc-500">
                            {new Date(history.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {history.messages[1] && (
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                            {history.messages[1].content}
                          </p>
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                <Button
                  variant="outline"
                  onClick={handleClearChat}
                  className="text-red-500 hover:text-red-600"
                >
                  Clear All History
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      {showUploadModal && <UploadModal />}
    </div>
  );
}
