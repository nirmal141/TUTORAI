import React, { useState, useEffect } from 'react';
import { FileText, X, Upload, ExternalLink, CornerDownLeft } from 'lucide-react';
import { Button } from './ui/button';

interface Document {
  document_id: string;
  filename: string;
  title: string;
  description: string;
  file_path: string;
  content_preview?: string;
  type?: 'file' | 'youtube';
  upload_time?: number;
}

interface DocumentsPanelProps {
  activeDocumentId: string | null;
  onSelectDocument: (doc: Document) => void;
  onUploadClick: () => void;
  onClearActiveDocument: () => void;
}

export default function DocumentsPanel({
  activeDocumentId,
  onSelectDocument,
  onUploadClick,
  onClearActiveDocument
}: DocumentsPanelProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8000/api/documents');
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      setError('Error loading documents. Please try again.');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-200">Your Documents</h3>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onUploadClick}
          className="h-8 px-2 text-xs"
        >
          <Upload className="h-3.5 w-3.5 mr-1.5" />
          Upload
        </Button>
      </div>
      
      <div className="p-2 h-[300px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin h-5 w-5 border-b-2 border-blue-400 rounded-full"></div>
          </div>
        ) : error ? (
          <div className="text-sm text-red-400 p-4 text-center">{error}</div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <FileText className="h-8 w-8 text-zinc-600 mb-2" />
            <p className="text-sm text-zinc-500">No documents uploaded yet</p>
            <Button 
              variant="link" 
              className="text-blue-400 text-xs mt-2"
              onClick={onUploadClick}
            >
              Upload your first document
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div 
                key={doc.document_id}
                className={`p-3 rounded-md transition-colors cursor-pointer 
                  ${activeDocumentId === doc.document_id 
                    ? 'bg-blue-500/10 border border-blue-500/30' 
                    : 'border border-transparent hover:bg-zinc-800'}`}
                onClick={() => onSelectDocument(doc)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <FileText className={`h-5 w-5 ${activeDocumentId === doc.document_id ? 'text-blue-400' : 'text-zinc-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium truncate ${activeDocumentId === doc.document_id ? 'text-blue-400' : 'text-zinc-300'}`}>
                        {doc.title || doc.filename}
                      </p>
                      {activeDocumentId === doc.document_id && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onClearActiveDocument();
                          }}
                          className="text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 truncate">{doc.filename}</p>
                    {activeDocumentId === doc.document_id && (
                      <div className="mt-2 text-xs text-blue-400 flex items-center">
                        <CornerDownLeft className="h-3.5 w-3.5 mr-1" />
                        Active in chat
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 