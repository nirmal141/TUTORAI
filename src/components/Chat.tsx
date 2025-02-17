// chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // <-- Import react-markdown
import { useChatHistory } from '../hooks/useChatHistory';

export interface Message {
  id: number;
  type: 'user' | 'bot';
  content: string;   // This content can contain Markdown
  timestamp: Date;
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
}

export default function Chat({ selectedProfessor }: ChatProps) {
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
    content: `Welcome to class! I'm Professor ${selectedProfessor?.name || 'Assistant'}, 
and I'll be your instructor in ${selectedProfessor?.field || 'General Studies'}. 
${selectedProfessor?.teachingMode === 'Socratic' 
  ? "I believe in learning through questioning and discussion."
  : selectedProfessor?.teachingMode === 'Practical' 
    ? "I focus on practical, hands-on learning approaches."
    : "I'm here to guide you through your learning journey."
}

Feel free to ask me any questions about ${selectedProfessor?.field || 'the subject'}, 
whether it's about course content, research guidance, or ${selectedProfessor?.adviceType} advice. 
Let's make this a productive learning session!`,
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    setIsGenerating(true);
    setShowConversationModal(true);
    
    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      console.log('Sending request with model type:', selectedProfessor?.modelType);
      
      // Enhanced context and role-specific prompting
      const professorContext = {
        name: selectedProfessor?.name || 'Assistant',
        field: selectedProfessor?.field || 'General Knowledge',
        teachingMode: selectedProfessor?.teachingMode || 'Helpful',
        adviceType: selectedProfessor?.adviceType || 'General',
        rolePrompt: `You are Professor ${selectedProfessor?.name}, an experienced educator in ${selectedProfessor?.field}. 
          Your teaching style is ${selectedProfessor?.teachingMode}, and you specialize in providing ${selectedProfessor?.adviceType} advice. 
          Interact as if you're in a classroom setting, using appropriate academic language and examples from your field. 
          Feel free to reference academic concepts, research, and real-world applications in your responses. 
          If a student needs guidance, provide it from your perspective as an experienced educator in ${selectedProfessor?.field}.
          Maintain a professional yet approachable demeanor, encouraging critical thinking and deeper understanding.`
      };

      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          model_type: selectedProfessor?.modelType || 'openai',
          professor: professorContext
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error response:', data);
        throw new Error(data.detail || 'An error occurred');
      }

      const botMessage: Message = {
        id: messages.length + 2,
        type: 'bot',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('Error details:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      const botErrorMessage: Message = {
        id: messages.length + 2,
        type: 'bot',
        content: selectedProfessor?.modelType === 'local' 
          ? `LM Studio Error: ${errorMessage}. Please ensure LM Studio is running and a model is loaded.`
          : `Error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botErrorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

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
                className={`flex items-start gap-4 mb-6 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black' 
                      : 'bg-zinc-800 text-orange-400 border border-orange-500/20'
                  }`}
                >
                  {message.type === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                <div className={`max-w-[80%] ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-4 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black'
                        : 'bg-zinc-900 text-orange-200 border border-orange-500/20'
                    }`}
                  >
                    <ReactMarkdown
                      className={`prose prose-sm max-w-none ${
                        message.type === 'user' ? 'prose-invert' : 'prose-orange'
                      }`}
                      components={{
                        p: ({ node, ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2 space-y-1" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2 space-y-1" {...props} />,
                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2 mt-4" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-md font-semibold mb-2 mt-3" {...props} />,
                        code: ({ node, inline, ...props }) => (
                          inline 
                            ? <code className="bg-zinc-800 px-1 rounded text-orange-200" {...props} />
                            : <code className="block bg-zinc-800 p-2 rounded my-2 text-orange-200" {...props} />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote className="border-l-4 border-orange-500 pl-4 italic my-2" {...props} />
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  <span className="text-xs text-orange-200/40 mt-2 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-800 text-orange-400 border border-orange-500/20">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="max-w-[80%] items-start">
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-orange-500/20">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
                      <span className="text-sm text-orange-200/80">{loadingStates[currentLoadingState]}</span>
                    </div>
                  </div>
                </div>
              </div>
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
