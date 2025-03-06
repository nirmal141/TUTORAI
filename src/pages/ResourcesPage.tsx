import React, { useState, useEffect, useRef } from 'react';
import { Upload, File, Image, FileText, Trash2, Download, Search, MessageSquare, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadFile, deleteDocument, getFileUrl, listDocuments, logDocumentAccess } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import type { Document, DocumentType, SubjectType, Profile } from '@/lib/supabase';

interface Resource extends Document {
  access_logs?: {
    count: number;
  }[];
}

interface DocumentChat {
  resourceId: string | null;
  isOpen: boolean;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    isLoading?: boolean;
  }>;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | ''>('');
  const [selectedDocument, setSelectedDocument] = useState<Resource | null>(null);
  const [documentChat, setDocumentChat] = useState<DocumentChat>({
    resourceId: null,
    isOpen: false,
    messages: []
  });
  const [userMessage, setUserMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChatModal, setShowChatModal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Mock user for demo
  const mockUser = {
    id: "mock-user-id",
    role: "student"
  };
  
  // Use mock user instead of authentication
  const currentUser = mockUser;
  const userProfile = { id: mockUser.id, full_name: "Demo User", role: "student" as const, created_at: "", updated_at: "" };

  useEffect(() => {
    console.log('Effect triggered - loading resources');
    loadResources();
  }, [selectedSubject, searchQuery]);

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [documentChat.messages]);

  const loadResources = async () => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('Loading resources...', { selectedSubject, searchQuery });
      const data = await listDocuments({
        subject: selectedSubject || undefined,
        search: searchQuery || undefined,
      });
      console.log('Resources loaded:', data);
      setResources(data || []);
    } catch (error) {
      console.error('Error loading resources:', error);
      setError('Failed to load resources. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !currentUser) {
      setError('No files selected or user not logged in');
      return;
    }

    const file = files[0];
    
    // Validate file size (10MB limit for example)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError(`File too large. Maximum size is ${formatFileSize(maxSize)}`);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);
      
      // Extract file type from extension
      const fileType = getFileType(file.type);
      
      // Upload the file
      const uploadedDocument = await uploadFile(file, {
        title: file.name,
        description: '',
        type: fileType,
        subject: selectedSubject || 'other',
        uploaded_by: currentUser.id,
        is_public: true,
        mime_type: file.type
      });
      
      // Set progress to 100% when complete
      setUploadProgress(100);
      
      console.log('Document uploaded successfully:', uploadedDocument);
      
      // Reload resources
      await loadResources();
      
      // Reset the file input
      event.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setError(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      setError(null);
      await deleteDocument(id);
      setResources(resources.filter(r => r.id !== id));
      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      setError('Failed to delete resource. Please try again.');
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      setError(null);
      const fileUrl = getFileUrl(resource.file_path);
      console.log('Downloading file from URL:', fileUrl);
      
      // Log the access before attempting download
      await logDocumentAccess(resource.id, 'download');
      
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resource.title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Failed to download file. Please try again.');
    }
  };

  const handleOpenDocument = async (resource: Resource) => {
    try {
      setError(null);
      const fileUrl = getFileUrl(resource.file_path);
      console.log('Opening document from URL:', fileUrl);
      
      // Log the access before opening
      await logDocumentAccess(resource.id, 'view');
      
      // For PDFs and images, open in a new tab
      if (resource.type === 'pdf' || resource.type === 'image') {
        window.open(fileUrl, '_blank');
      } else {
        // For other file types, trigger download
        handleDownload(resource);
      }
      
      setSelectedDocument(resource);
      setDocumentChat({
        resourceId: resource.id,
        isOpen: false,
        messages: []
      });
    } catch (error) {
      console.error('Error opening document:', error);
      setError('Failed to open document. Please try again.');
    }
  };

  const handleCloseDocument = () => {
    setSelectedDocument(null);
    setDocumentChat({
      resourceId: null,
      isOpen: false,
      messages: []
    });
  };

  const handleOpenChat = async () => {
    if (!selectedDocument) return;
    
    try {
      await logDocumentAccess(selectedDocument.id, 'chat');
      setDocumentChat(prev => ({
        ...prev,
        isOpen: true,
        resourceId: selectedDocument.id
      }));
      setShowChatModal(true);
    } catch (error) {
      console.error('Error opening chat:', error);
      // Add error notification here
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim() || !selectedDocument) return;

    const newUserMessage = {
      role: 'user' as const,
      content: userMessage,
    };

    // Add user message to chat
    setDocumentChat(prev => ({
      ...prev,
      messages: [...prev.messages, newUserMessage]
    }));

    // Create loading message
    const loadingMessage = {
      role: 'assistant' as const,
      content: '...',
      isLoading: true
    };

    // Add loading message
    setDocumentChat(prev => ({
      ...prev,
      messages: [...prev.messages, loadingMessage]
    }));

    // Clear input
    setUserMessage('');

    try {
      // Get document URL
      const documentUrl = getFileUrl(selectedDocument.file_path);
      console.log('Processing document chat for URL:', documentUrl);

      // Call backend API
      const response = await fetch('http://localhost:8000/api/document-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: selectedDocument.id,
          document_url: documentUrl,
          document_title: selectedDocument.title,
          message: newUserMessage.content,
          previous_messages: documentChat.messages.filter(msg => !msg.isLoading)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to process document');
      }

      // Modify where you update state to set the messages with the real response
      setDocumentChat(prev => {
        const updatedMessages = [...prev.messages.slice(0, -1), {
          role: 'assistant' as const,
          content: data.response,
          isLoading: false
        }];
        
        // Schedule scroll for after the message is rendered
        setTimeout(() => {
          if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        
        return {
          ...prev,
          messages: updatedMessages
        };
      });
    } catch (error) {
      console.error('Error getting document chat response:', error);
      
      // Replace loading message with error and ensure scrolling
      setDocumentChat(prev => {
        const updatedMessages = [...prev.messages.slice(0, -1), {
          role: 'assistant' as const,
          content: 'Sorry, I encountered an error analyzing this document. The server might be down or the PDF extraction failed. Please try again.',
          isLoading: false
        }];
        
        // Schedule scroll for after the error message is rendered
        setTimeout(() => {
          if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        
        return {
          ...prev,
          messages: updatedMessages
        };
      });
    }
  };

  const handleCloseChatModal = () => {
    setShowChatModal(false);
  };

  const getFileType = (mimeType: string): Resource['type'] => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('document')) return 'document';
    return 'other';
  };

  const getFileIcon = (type: Resource['type']) => {
    switch (type) {
      case 'image': return <Image className="w-6 h-6" />;
      case 'pdf': return <FileText className="w-6 h-6" />;
      case 'document': return <File className="w-6 h-6" />;
      default: return <File className="w-6 h-6" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">Teaching Resources</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Upload and manage educational resources for students</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
            />
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value as SubjectType | '')}
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
          >
            <option value="">All Subjects</option>
            <option value="mathematics">Mathematics</option>
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
            <option value="biology">Biology</option>
            <option value="computer_science">Computer Science</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Upload Button with Progress */}
        <div className="mb-6">
          <label className="inline-flex items-center px-4 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors cursor-pointer">
            <Upload className="w-5 h-5 mr-2" />
            {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload Resources'}
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              disabled={isUploading}
            />
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-6">
          {/* Resources List */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500 dark:text-zinc-400" />
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-12">
                <File className="w-12 h-12 mx-auto text-zinc-400 dark:text-zinc-600 mb-4" />
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">No resources found</h3>
                <p className="text-zinc-500 dark:text-zinc-400">
                  {searchQuery || selectedSubject
                    ? "No resources match your search criteria"
                    : "Upload your first resource to get started"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <button
                        onClick={() => handleOpenDocument(resource)}
                        className="flex items-center flex-1 text-left"
                      >
                        {getFileIcon(resource.type)}
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-zinc-900 dark:text-white">{resource.title}</h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {formatFileSize(resource.file_size)}
                          </p>
                          {resource.access_logs && Array.isArray(resource.access_logs) && resource.access_logs.length >= 3 && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              Views: {resource.access_logs[0]?.count || 0} • 
                              Downloads: {resource.access_logs[1]?.count || 0} •
                              Chats: {resource.access_logs[2]?.count || 0}
                            </p>
                          )}
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        {/* Chat Button - More prominent */}
                        <div className="relative group">
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation(); // Prevent opening the document
                              try {
                                // First set the selected document
                                setSelectedDocument(resource);
                                
                                // Then log the access
                                await logDocumentAccess(resource.id, 'chat');
                                
                                // Setup chat state
                                setDocumentChat(prev => ({
                                  ...prev,
                                  isOpen: true,
                                  resourceId: resource.id,
                                  messages: [] // Reset messages for a fresh chat
                                }));
                                
                                // Open the modal immediately
                                setShowChatModal(true);
                              } catch (error) {
                                console.error('Error starting chat:', error);
                              }
                            }}
                            className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 rounded-md transition-colors text-blue-600 dark:text-blue-400 shadow-sm"
                            aria-label="Chat with document"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            Chat with this document
                          </div>
                        </div>
                        
                        {/* Download Button */}
                        <div className="relative group">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent opening the document
                              handleDownload(resource);
                            }}
                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
                            aria-label="Download document"
                          >
                            <Download className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                          </button>
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            Download
                          </div>
                        </div>
                        
                        {/* Delete Button */}
                        <div className="relative group">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent opening the document
                              handleDeleteResource(resource.id);
                            }}
                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
                            aria-label="Delete document"
                          >
                            <Trash2 className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                          </button>
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            Delete
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Document Viewer & Chat */}
          <AnimatePresence>
            {selectedDocument && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-96 border-l border-zinc-200 dark:border-zinc-700 pl-6"
              >
                <div className="sticky top-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                      {selectedDocument.title}
                    </h3>
                    <button
                      onClick={handleCloseDocument}
                      className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      ×
                    </button>
                  </div>

                  {/* Document Content */}
                  <div className="mb-6">
                    {selectedDocument.type === 'image' ? (
                      <img
                        src={getFileUrl(selectedDocument.file_path)}
                        alt={selectedDocument.title}
                        className="w-full rounded-md shadow-md"
                      />
                    ) : selectedDocument.type === 'pdf' ? (
                      <div className="rounded-lg overflow-hidden shadow-md border border-zinc-200 dark:border-zinc-700">
                        <iframe
                          src={getFileUrl(selectedDocument.file_path)}
                          className="w-full h-[550px]"
                          title={selectedDocument.title}
                        />
                      </div>
                    ) : (
                      <div className="prose dark:prose-invert max-w-none p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                        <p className="text-zinc-600 dark:text-zinc-400">
                          {selectedDocument.type === 'document' ? (
                            <>
                              This is a document file. 
                              <button
                                onClick={() => handleDownload(selectedDocument)}
                                className="ml-2 text-blue-600 dark:text-blue-500 hover:underline"
                              >
                                Click here to download
                              </button>
                            </>
                          ) : (
                            'Preview not available for this file type'
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Chat Button */}
                  <div className="mt-6">
                    <button
                      onClick={handleOpenChat}
                      className="flex items-center justify-center gap-3 px-6 py-5 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <div className="bg-white/20 rounded-full p-2.5">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <span className="font-medium text-lg">Chat with this document</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat Modal */}
      {showChatModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-2">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  {getFileIcon(selectedDocument.type)}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                    Chat with {selectedDocument.title}
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Ask questions about this document
                  </p>
                </div>
              </div>
              <button 
                onClick={handleCloseChatModal}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 dark:text-zinc-400">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            {/* Chat area with document preview */}
            <div className="flex flex-1 overflow-hidden">
              {/* Document preview */}
              <div className="w-1/2 p-5 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto max-h-[calc(95vh-140px)] scrollbar-thin scrollbar-thumb-zinc-400 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
                {selectedDocument.type === 'image' ? (
                  <img
                    src={getFileUrl(selectedDocument.file_path)}
                    alt={selectedDocument.title}
                    className="w-full rounded-md shadow-md"
                  />
                ) : selectedDocument.type === 'pdf' ? (
                  <div className="rounded-lg overflow-hidden shadow-md border border-zinc-200 dark:border-zinc-700 h-[650px]">
                    <iframe
                      src={getFileUrl(selectedDocument.file_path)}
                      className="w-full h-full"
                      title={selectedDocument.title}
                    />
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {selectedDocument.type === 'document' ? (
                        <>
                          This is a document file. 
                          <button
                            onClick={() => handleDownload(selectedDocument)}
                            className="ml-2 text-blue-600 dark:text-blue-500 hover:underline"
                          >
                            Click here to download
                          </button>
                        </>
                      ) : (
                        'Preview not available for this file type'
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Chat messages */}
              <div className="w-1/2 flex flex-col h-full overflow-hidden">
                <div className="flex-1 p-5 overflow-y-auto max-h-[calc(95vh-180px)] scrollbar-thin scrollbar-thumb-zinc-400 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
                  {documentChat.messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400 text-center">
                      <div>
                        <MessageSquare className="w-20 h-20 mx-auto mb-6 opacity-20" />
                        <p className="text-xl font-medium mb-2">Ask questions about this document</p>
                        <p className="text-sm mt-2 max-w-md">
                          The AI will analyze the content and provide answers based on what's in the document.
                          <br />Try asking specific questions about the content, facts, or details.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 min-h-full">
                      {documentChat.messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.role === 'assistant' && (
                            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mr-3 mt-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                              </svg>
                            </div>
                          )}
                          <div
                            className={`max-w-[85%] p-4 rounded-xl ${
                              message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                            } ${message.isLoading ? 'animate-pulse' : ''}`}
                          >
                            {message.isLoading ? (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap text-base">{message.content}</div>
                            )}
                          </div>
                          {message.role === 'user' && (
                            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-blue-600 flex items-center justify-center ml-3 mt-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={chatEndRef} className="h-4" id="chat-end"></div> {/* Adds a bit of space at the bottom */}
                    </div>
                  )}
                </div>

                {/* Input area */}
                <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Ask about this document..."
                      className="flex-1 px-5 py-4 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-base"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!userMessage.trim()}
                      className="p-4 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-90">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3 text-xs text-center text-zinc-500 dark:text-zinc-400">
                    AI responses are generated based on the document content
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 