import React, { useState, useEffect, useRef } from 'react';
import { Upload, File, Image, FileText, Trash2, Download, Search, MessageSquare, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadFile, deleteDocument, getFileUrl, listDocuments, logDocumentAccess } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/language-context';
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
    timestamp?: string;
  }>;
}

export default function ResourcesPage() {
  const { t } = useLanguage();
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

      //once the file is uplaoded, append it to the RAG
      const formData = new FormData();
      formData.append('file', file);

      //below api is to add the pdf to our RAG
      const response = await fetch("http://localhost:8000/add_to_rag/", {  // Explicit backend URL
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to add file to RAG");
      }
      console.log("File successfully added to RAG");
      
      // Reload resources
      await loadResources();
      
      // Reset the file input
      event.target.value = '';
    }   
    catch (error) {
      console.error('Upload error:', error);
      setError(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      setError(null);
      setIsLoading(true); // Show loading state while deleting
      
      // Get the resource information before deleting it
      const resourceToDelete = resources.find(r => r.id === id);
      
      if (!resourceToDelete) {
        throw new Error('Resource not found');
      }
      
      console.log('Deleting resource:', resourceToDelete);
      
      // First delete from database
      const deleteResult = await deleteDocument(id);
      console.log('Database deletion result:', deleteResult);
      
      if (!deleteResult) {
        throw new Error('Failed to delete from database');
      }
      
      // Remove from RAG system
      try {
        console.log('Attempting to remove from RAG system:', id, resourceToDelete.file_path);
        
        const response = await fetch("http://localhost:8000/remove_from_rag/", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            document_id: id,
            file_path: resourceToDelete.file_path,
            title: resourceToDelete.title // Adding title for better identification
          })
        });

        const responseText = await response.text();
        console.log('RAG removal response:', response.status, responseText);

        if (!response.ok) {
          console.error('Failed to remove document from RAG system:', responseText);
          // Don't throw here, but set an error message
          setError('Document removed from database but may still exist in the chat system. Please refresh.');
        } else {
          console.log("Document successfully removed from RAG system");
        }
      } catch (ragError) {
        console.error('Error removing from RAG system:', ragError);
        setError('Document removed from database but failed to remove from chat system. Please refresh.');
      }
      
      // Verify deletion from database before updating UI
      // Wait a moment to ensure deletion propagates
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force reload resources to ensure UI is in sync with database
      await loadResources();
      
      // Reset selected document if it was the one deleted
      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
      }
      
      console.log('Resource deletion completed');
      
    } catch (error) {
      console.error('Error deleting resource:', error);
      setError(`Failed to delete resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
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

    // Create timestamp for this message
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMessage = {
      role: 'user' as const,
      content: userMessage,
      timestamp
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
      isLoading: true,
      timestamp: timestamp
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
          isLoading: false,
          timestamp
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
          isLoading: false,
          timestamp
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

  const renderFormattedContent = (content: string): JSX.Element => {
    // Basic Markdown-style formatting
    // Convert code blocks
    const processedContent = content
      // Process code blocks (```code```) - must do this before other replacements
      .replace(/```([\s\S]*?)```/g, (_, code) => {
        return `<div class="my-2 p-4 bg-zinc-200 dark:bg-zinc-700 rounded-md font-mono text-sm overflow-x-auto">${code.trim()}</div>`;
      })
      // Process inline code (`code`)
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-sm font-mono">$1</code>')
      // Process lists (- item)
      .replace(/^\s*-\s+(.+)$/gm, '<li class="ml-4">$1</li>')
      // Process headers (# Header)
      .replace(/^#\s+(.+)$/gm, '<h3 class="text-lg font-bold my-2">$1</h3>')
      .replace(/^##\s+(.+)$/gm, '<h4 class="text-md font-bold my-1">$1</h4>')
      // Process bold (**bold**)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Process emphasis (*italic*)
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Preserve paragraph breaks
      .split('\n\n').join('<br/><br/>');

    // Use dangerouslySetInnerHTML to render the processed content
    return <div dangerouslySetInnerHTML={{ __html: processedContent }} />;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">{t('resources.title')}</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{t('resources.description')}</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder={t('resources.search')}
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
            <option value="">{t('resources.all_subjects')}</option>
            <option value="mathematics">{t('resources.mathematics')}</option>
            <option value="physics">{t('resources.physics')}</option>
            <option value="chemistry">{t('resources.chemistry')}</option>
            <option value="biology">{t('resources.biology')}</option>
            <option value="computer_science">{t('resources.computer_science')}</option>
            <option value="other">{t('resources.other')}</option>
          </select>
        </div>

        {/* Upload Button with Progress */}
        <div className="mb-6">
          <label className="inline-flex items-center px-4 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors cursor-pointer">
            <Upload className="w-5 h-5 mr-2" />
            {isUploading ? `${t('resources.uploading')} ${uploadProgress}%` : t('resources.upload')}
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
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm animate-pulse p-6 border border-zinc-200 dark:border-zinc-700">
                <div className="h-32 bg-zinc-200 dark:bg-zinc-700 rounded-md mb-4"></div>
                <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded-md mb-2 w-3/4"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded-md mb-4 w-1/2"></div>
                <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded-md"></div>
              </div>
            ))
          ) : resources.length === 0 ? (
            // Empty state
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mb-4" />
              <h3 className="text-xl font-medium text-zinc-900 dark:text-white mb-2">
                {searchQuery || selectedSubject ? t('resources.no_resources_match') : t('resources.no_resources')}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                {searchQuery || selectedSubject ? '' : t('resources.upload_first')}
              </p>
            </div>
          ) : (
            // Resources list
            resources.map((resource) => (
              <div
                key={resource.id}
                onClick={() => handleOpenDocument(resource)}
                className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6 border border-zinc-200 dark:border-zinc-700 cursor-pointer transition-all hover:shadow-md"
              >
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-md">
                    {getFileIcon(resource.type)}
                  </div>
                  <div className="ml-3 flex-1 truncate">
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white truncate">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {new Date(resource.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {/* Resource stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
                  <div className="bg-zinc-100 dark:bg-zinc-700/50 rounded-md p-2">
                    <div className="font-medium text-zinc-800 dark:text-zinc-200">
                      {resource.access_logs?.find(log => log.count)?.count || 0}
                    </div>
                    <div className="text-zinc-500 dark:text-zinc-400">{t('resources.views')}</div>
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-700/50 rounded-md p-2">
                    <div className="font-medium text-zinc-800 dark:text-zinc-200">
                      {resource.access_logs?.find(log => log.count)?.count || 0}
                    </div>
                    <div className="text-zinc-500 dark:text-zinc-400">{t('resources.downloads')}</div>
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-700/50 rounded-md p-2">
                    <div className="font-medium text-zinc-800 dark:text-zinc-200">
                      {resource.access_logs?.find(log => log.count)?.count || 0}
                    </div>
                    <div className="text-zinc-500 dark:text-zinc-400">{t('resources.chats')}</div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex justify-between mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(resource);
                    }}
                    className="text-sm flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    {t('resources.download')}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Create a direct chat handler function that doesn't rely on selectedDocument state
                      const openChatForResource = async (resource: Resource) => {
                        try {
                          await logDocumentAccess(resource.id, 'chat');
                          setDocumentChat({
                            resourceId: resource.id,
                            isOpen: true,
                            messages: []
                          });
                          setSelectedDocument(resource);
                          setShowChatModal(true);
                        } catch (error) {
                          console.error('Error opening chat:', error);
                        }
                      };
                      
                      // Call the function directly with this resource
                      openChatForResource(resource);
                    }}
                    className="text-sm flex items-center text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {t('resources.chat_with')}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteResource(resource.id);
                    }}
                    className="text-sm flex items-center text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {t('resources.delete')}
                  </button>
                </div>
              </div>
            ))
          )}
          
          {/* Selected document details */}
          <AnimatePresence>
            {selectedDocument && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-10 overflow-y-auto"
                onClick={handleCloseDocument}
              >
                <div className="flex items-center justify-center min-h-screen p-4">
                  <motion.div 
                    className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 w-full max-w-4xl max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ y: 50 }}
                    animate={{ y: 0 }}
                  >
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-md">
                          {getFileIcon(selectedDocument.type)}
                        </div>
                        <div className="ml-3">
                          <h3 className="text-xl font-medium text-zinc-900 dark:text-white">
                            {selectedDocument.title}
                          </h3>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {new Date(selectedDocument.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleCloseDocument}
                        className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="p-6 max-h-[calc(90vh-11rem)] overflow-y-auto">
                      {selectedDocument.type === 'image' ? (
                        <img
                          src={getFileUrl(selectedDocument.file_path)}
                          alt={selectedDocument.title}
                          className="w-full h-auto rounded-lg"
                        />
                      ) : selectedDocument.type === 'pdf' ? (
                        <div className="rounded-lg overflow-hidden shadow-md border border-zinc-200 dark:border-zinc-700 h-[500px]">
                          <iframe
                            src={getFileUrl(selectedDocument.file_path)}
                            className="w-full h-full"
                            title={selectedDocument.title}
                          />
                        </div>
                      ) : (
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="text-zinc-600 dark:text-zinc-400">
                            {selectedDocument.type === 'document' ? (
                              <>
                                {t('resources.document_file')}. 
                                <button
                                  onClick={() => handleDownload(selectedDocument)}
                                  className="ml-2 text-blue-600 dark:text-blue-500 hover:underline"
                                >
                                  {t('resources.click_download')}
                                </button>
                              </>
                            ) : (
                              t('resources.preview_unavailable')
                            )}
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-6">
                        <button
                          onClick={handleOpenChat}
                          className="flex items-center justify-center gap-3 px-6 py-5 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                          <div className="bg-white/20 rounded-full p-2.5">
                            <MessageSquare className="w-6 h-6" />
                          </div>
                          <span className="font-medium text-lg">{t('resources.chat_with_document')}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat Modal */}
      {showChatModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-2 overflow-hidden">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col relative">
            {/* Close button moved outside header for better visibility */}
            <button 
              onClick={handleCloseChatModal}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors z-10"
              aria-label={t('actions.close')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 dark:text-zinc-400">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            {/* Header */}
            <div className="flex items-center p-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  {getFileIcon(selectedDocument.type)}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white pr-10">
                    {t('resources.chat_with')} {selectedDocument.title}
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {t('resources.ask_questions')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Chat area with document preview - made responsive */}
            <div className="flex flex-1 flex-col md:flex-row">
              {/* Document preview */}
              <div className="w-full md:w-1/2 p-5 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto h-[300px] md:h-auto md:max-h-[calc(95vh-140px)] scrollbar-thin scrollbar-thumb-zinc-400 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
                {selectedDocument.type === 'image' ? (
                  <img
                    src={getFileUrl(selectedDocument.file_path)}
                    alt={selectedDocument.title}
                    className="w-full rounded-md shadow-md"
                  />
                ) : selectedDocument.type === 'pdf' ? (
                  <div className="rounded-lg overflow-hidden shadow-md border border-zinc-200 dark:border-zinc-700 h-[500px] md:h-[650px]">
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
                          {t('resources.document_file')}
                          <button
                            onClick={() => handleDownload(selectedDocument)}
                            className="ml-2 text-blue-600 dark:text-blue-500 hover:underline"
                          >
                            {t('resources.click_download')}
                          </button>
                        </>
                      ) : (
                        t('resources.preview_unavailable')
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Chat messages */}
              <div className="w-full md:w-1/2 flex flex-col h-full overflow-hidden">
                {/* Messages container with fixed height and scrolling */}
                <div className="flex-1 p-5 overflow-y-auto min-h-[300px] md:min-h-[400px] max-h-[calc(95vh-250px)] md:max-h-[calc(95vh-200px)] scrollbar scrollbar-thin scrollbar-thumb-zinc-400 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
                  {documentChat.messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400 text-center">
                      <div>
                        <MessageSquare className="w-20 h-20 mx-auto mb-6 opacity-20" />
                        <p className="text-xl font-medium mb-2">{t('resources.ask_questions')}</p>
                        <p className="text-sm mt-2 max-w-md">
                          {t('resources.ai_analyze')}
                          <br />{t('resources.try_asking')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 pb-2">
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
                          <div className={`max-w-[85%] flex flex-col ${message.isLoading ? 'animate-pulse' : ''}`}>
                            {/* Message content */}
                            <div
                              className={`p-4 rounded-xl shadow-sm ${
                                message.role === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                              }`}
                            >
                              {message.isLoading ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                  <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                  <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                              ) : (
                                <div className="whitespace-pre-wrap text-base prose dark:prose-invert max-w-none">
                                  {/* Render message content with special formatting */}
                                  {renderFormattedContent(message.content)}
                                </div>
                              )}
                            </div>
                            
                            {/* Timestamp */}
                            <div className={`text-xs mt-1 ${
                              message.role === 'user' ? 'text-right text-zinc-500 dark:text-zinc-400' : 'text-left text-zinc-500 dark:text-zinc-400'
                            }`}>
                              {message.timestamp}
                            </div>
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
                      placeholder={t('resources.ask_about')}
                      className="flex-1 px-5 py-4 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-base"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!userMessage.trim() || documentChat.messages.some(m => m.isLoading)}
                      className={`p-4 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white transition-colors`}
                    >
                      {documentChat.messages.some(m => m.isLoading) ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                      )}
                    </button>
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