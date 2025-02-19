// chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Trash2, Search, Globe, Database } from 'lucide-react';
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

  // Add a ref to track if initial generation has happened
  const initialGenerationDone = useRef(false);

  // Move the state inside the component
  const [expandedSearchId, setExpandedSearchId] = useState<number | null>(null);
  const [searchState, setSearchState] = useState<SearchState>({ status: null, query: '' });
  const [searchAnimation, setSearchAnimation] = useState(0);

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
        setSearchAnimation((prev) => (prev + 1) % 3);
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
      // Always show searching animation when web search is enabled
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
          enable_search: enableWebSearch
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

      // Format bot response with markdown
      const botMessage: Message = {
        id: messages.length + (enableWebSearch ? 3 : 2),
        type: 'bot',
        content: data.response,
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

  // Add this search animation component
  const SearchingAnimation = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center space-x-2 text-cyan-400"
    >
      <Globe className="h-4 w-4 animate-spin" />
      <span className="text-sm">
        Searching the web
        <span className="inline-block w-8">
          {'.'.repeat(searchAnimation + 1)}
        </span>
      </span>
    </motion.div>
  );

  // Add the web search toggle component
  const WebSearchToggle = () => (
    <div className=" items-center space-x-2 px-4 py-2">
      <Switch
        checked={enableWebSearch}
        onChange={setEnableWebSearch}
        className={`${
          enableWebSearch ? 'bg-cyan-600' : 'bg-zinc-700'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2`}
      >
        <span className="sr-only">Enable web search</span>
        <span
          className={`${
            enableWebSearch ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </Switch>
      <span className="text-sm text-cyan-300">
        Web Search {enableWebSearch ? 'Enabled' : 'Disabled'}
      </span>
      <Globe className={`h-4 w-4 ${enableWebSearch ? 'text-cyan-400' : 'text-zinc-500'}`} />
    </div>
  );

  return (
    <div className="relative">
      {/* Initial welcome message with dashboard-matching styling */}
      <div className="bg-zinc-900 border-t border-orange-500/20 p-4">
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
          <div className=" items-center space-x-2">
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
        <div className="fixed inset-0 z-40 flex flex-col bg-black">
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

          {/* Messages container with dashboard theme */}
          <div className="flex-1 overflow-y-auto p-6 bg-black">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex items-start gap-4 mb-6 ${
                  message.type === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black'
                      : message.type === 'search'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-400 text-white'
                        : 'bg-gradient-to-r from-zinc-800 to-zinc-700 text-orange-400 border border-orange-500/20'
                  }`}
                >
                  {message.type === 'user' ? (
                    <User className="h-5 w-5" />
                  ) : message.type === 'search' ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  ) : (
                    <Bot className="h-5 w-5" />
                  )}
                </div>
                <div className={`max-w-[80%] ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`p-4 rounded-2xl backdrop-blur-sm ${
                      message.type === 'search' 
                        ? 'bg-gradient-to-br from-blue-900/90 to-cyan-900/90 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                        : message.type === 'user'
                          ? 'bg-gradient-to-br from-zinc-900 to-zinc-800 text-white border border-orange-500/20 shadow-lg shadow-orange-500/5'
                          : 'bg-gradient-to-br from-zinc-900 to-zinc-800 text-white border border-orange-500/20 shadow-lg shadow-orange-500/5'
                    }`}
                  >
                    {message.type === 'search' ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                      >
                        <div 
                          className="flex items-center justify-between mb-3 cursor-pointer"
                          onClick={() => setExpandedSearchId(expandedSearchId === message.id ? null : message.id)}
                        >
                          <div className="flex items-center space-x-2">
                            <Search className="h-5 w-5 text-cyan-400" />
                            <h3 className="text-lg font-semibold text-cyan-300">
                              Academic & Research Sources ({message.sources?.filter(s => s.is_academic).length || 0})
                            </h3>
                          </div>
                          <motion.div
                            animate={{ rotate: expandedSearchId === message.id ? 180 : 0 }}
                            className="text-cyan-400"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </motion.div>
                        </div>

                        {/* Compact View */}
                        {expandedSearchId !== message.id && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-wrap gap-2"
                          >
                            {message.sources?.map((source, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`px-3 py-1.5 rounded-full ${
                                  source.is_academic 
                                    ? 'bg-blue-900/40 border-blue-500/20 text-blue-300' 
                                    : 'bg-cyan-900/40 border-cyan-500/20 text-cyan-300'
                                } border text-sm flex items-center space-x-2 hover:bg-opacity-60 transition-colors cursor-pointer`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(source.link, '_blank');
                                }}
                              >
                                {source.is_academic ? (
                                  <Database className="h-3.5 w-3.5" />
                                ) : (
                                  <Globe className="h-3.5 w-3.5" />
                                )}
                                <span>{getDomainFromUrl(source.link)}</span>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}

                        {/* Expanded View with academic highlighting */}
                        <AnimatePresence>
                          {expandedSearchId === message.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-3 mt-3 overflow-hidden"
                            >
                              {/* Academic sources first */}
                              {message.sources?.filter(s => s.is_academic).map((source, index) => (
                                <motion.div
                                  key={`academic-${index}`}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="p-4 rounded-lg bg-blue-950/50 border border-blue-500/20 
                                           hover:border-blue-500/40 transition-all"
                                >
                                  <a
                                    href={source.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block group"
                                  >
                                    <div className="flex items-start justify-between">
                                      <h4 className="text-cyan-300 font-medium group-hover:text-cyan-200 
                                                   transition-colors flex-1">
                                        {source.title}
                                      </h4>
                                      <span className="text-xs text-cyan-400 px-2 py-1 bg-cyan-950/50 
                                                     rounded-full ml-2">
                                        {getDomainFromUrl(source.link)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-cyan-200/70 mt-2 line-clamp-2 
                                              group-hover:text-cyan-200/90 transition-colors">
                                      {source.summary}
                                    </p>
                                    <motion.div 
                                      className="flex items-center justify-between mt-3"
                                      whileHover={{ scale: 1.02 }}
                                    >
                                      <div className="flex items-center text-xs text-cyan-400 
                                                   group-hover:text-cyan-300">
                                        <Database className="h-4 w-4 mr-1" />
                                        View Source
                                      </div>
                                      <span className="text-xs text-cyan-400/60">
                                        Educational Resource
                                      </span>
                                    </motion.div>
                                  </a>
                                </motion.div>
                              ))}
                              
                              {/* Other sources */}
                              {message.sources?.filter(s => !s.is_academic).map((source, index) => (
                                <motion.div
                                  key={`other-${index}`}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="p-4 rounded-lg bg-cyan-950/50 border border-cyan-500/20 
                                           hover:border-cyan-500/40 transition-all"
                                >
                                  <a
                                    href={source.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block group"
                                  >
                                    <div className="flex items-start justify-between">
                                      <h4 className="text-cyan-300 font-medium group-hover:text-cyan-200 
                                                   transition-colors flex-1">
                                        {source.title}
                                      </h4>
                                      <span className="text-xs text-cyan-400 px-2 py-1 bg-cyan-950/50 
                                                     rounded-full ml-2">
                                        {getDomainFromUrl(source.link)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-cyan-200/70 mt-2 line-clamp-2 
                                              group-hover:text-cyan-200/90 transition-colors">
                                      {source.summary}
                                    </p>
                                    <motion.div 
                                      className="flex items-center justify-between mt-3"
                                      whileHover={{ scale: 1.02 }}
                                    >
                                      <div className="flex items-center text-xs text-cyan-400 
                                                   group-hover:text-cyan-300">
                                        <Database className="h-4 w-4 mr-1" />
                                        View Source
                                      </div>
                                      <span className="text-xs text-cyan-400/60">
                                        Educational Resource
                                      </span>
                                    </motion.div>
                                  </a>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ) : (
                      <ReactMarkdown 
                        className={`prose prose-invert max-w-none
                          prose-p:text-white prose-headings:text-white
                          prose-strong:text-white prose-em:text-white/90
                          prose-code:text-white/90 prose-pre:bg-black/20
                          prose-a:text-white prose-a:underline hover:prose-a:text-white/90
                          prose-li:text-white`}
                      >
                        {message.content}
                      </ReactMarkdown>
                    )}
                  </div>
                  <span className="text-xs text-orange-200/40 mt-2 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-zinc-800 to-zinc-700 text-orange-400 border border-orange-500/20">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="max-w-[80%] items-start">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white border border-orange-500/20 shadow-lg shadow-orange-500/5">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span className="text-sm text-white">{loadingStates[currentLoadingState]}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {searchState.status === 'searching' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-start gap-4 mb-6"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
                  <Globe className="h-5 w-5 animate-spin" />
                </div>
                <div className="max-w-[80%] items-start">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-900/90 to-blue-900/90 border border-cyan-500/30">
                    <SearchingAnimation />
                  </div>
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
        </div>
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
    </div>
  );
}
