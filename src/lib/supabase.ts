import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  }
});

// Initialize session check
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user?.id);
});

// Types based on the exact database schema
export type DocumentType = 'document' | 'image' | 'pdf' | 'other';
export type SubjectType = 'mathematics' | 'physics' | 'chemistry' | 'biology' | 'computer_science' | 'other';
export type UserRole = 'student' | 'teacher';

export interface Document {
  id: string;
  title: string;
  description: string | null;
  type: DocumentType;
  subject: SubjectType | null;
  file_path: string;
  file_size: number;
  mime_type: string | null;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  metadata: Record<string, any> | null;
}

export interface DocumentAccessLog {
  id: string;
  document_id: string;
  user_id: string;
  accessed_at: string;
  action_type: 'view' | 'download' | 'chat';
}

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

interface DocumentMetadata {
  title: string;
  description?: string | null;
  type: DocumentType;
  subject?: SubjectType | null;
  uploaded_by: string;
  is_public: boolean;
  mime_type?: string | null;
  metadata?: Record<string, any> | null;
}

// Mock user ID for demo purposes without authentication - using a valid UUID format
export const MOCK_USER_ID = "00000000-0000-4000-a000-000000000000";

export async function uploadFile(file: File, metadata: DocumentMetadata) {
  try {
    // 1. Upload file to storage
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const filePath = `${timestamp}-${randomId}.${fileExt}`;
    
    console.log('Uploading file to storage:', { filePath, metadata });
    
    // Use mock user ID instead of authentication
    const userId = MOCK_USER_ID;
    
    // Ensure metadata has the correct uploader ID
    metadata.uploaded_by = userId;
    
    // 1. Upload file to storage
    const { data: storageData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Error uploading to storage:', uploadError);
      throw new Error(`Error uploading file: ${uploadError.message}`);
    }
    
    console.log('Storage upload complete:', storageData);
    
    // 2. Insert record in database
    const { data: document, error: insertError } = await supabase
      .from('documents')
      .insert({
        title: metadata.title,
        description: metadata.description || null,
        type: metadata.type,
        subject: metadata.subject || null,
        file_path: filePath,
        file_size: file.size,
        mime_type: metadata.mime_type || file.type,
        uploaded_by: userId,
        is_public: metadata.is_public,
        metadata: metadata.metadata || {}
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating document record:', insertError);
      
      // Attempt to delete the file from storage since the database insert failed
      try {
        await supabase.storage.from('documents').remove([filePath]);
        console.log('Deleted file from storage after database insert failed');
      } catch (cleanupError) {
        console.error('Error cleaning up file after failed insert:', cleanupError);
      }
      
      throw new Error(`Error creating document record: ${insertError.message}`);
    }
    
    return document;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error;
  }
}

async function listStorageFiles() {
  try {
    console.log('Listing files in storage bucket...');
    const { data, error } = await supabase.storage
      .from('documents')
      .list();

    if (error) {
      console.error('Error listing storage files:', error);
      throw error;
    }

    console.log('Files in storage bucket:', data);
    return data;
  } catch (error) {
    console.error('Error in listStorageFiles:', error);
    throw error;
  }
}

async function syncStorageWithDatabase() {
  try {
    console.log('Syncing storage files with database...');
    
    // Get files from storage
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('documents')
      .list();

    if (storageError) throw storageError;
    if (!storageFiles?.length) return;

    // Get existing documents from database
    const { data: existingDocs, error: dbError } = await supabase
      .from('documents')
      .select('file_path');

    if (dbError) throw dbError;

    // Find files that don't have database records
    const existingPaths = new Set(existingDocs?.map(doc => doc.file_path) || []);
    const missingFiles = storageFiles.filter(file => !existingPaths.has(file.name));

    if (missingFiles.length === 0) {
      console.log('All files are synced with database');
      return;
    }

    console.log('Found missing database records for files:', missingFiles);

    // Use mock user ID instead of authentication
    const userId = MOCK_USER_ID;

    // Create database records for missing files
    const documentsToInsert = missingFiles.map(file => ({
      title: file.name,
      description: 'Automatically synced from storage',
      type: getFileTypeFromName(file.name),
      subject: 'other',
      file_path: file.name,
      file_size: 0, // We don't have this information from storage list
      mime_type: getMimeType(file.name),
      uploaded_by: userId,
      is_public: true,
      metadata: {}
    }));

    const { data: insertedDocs, error: insertError } = await supabase
      .from('documents')
      .insert(documentsToInsert)
      .select();

    if (insertError) throw insertError;

    console.log('Successfully synced files with database:', insertedDocs);
  } catch (error) {
    console.error('Error syncing storage with database:', error);
  }
}

function getFileTypeFromName(filename: string): DocumentType {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return 'other';
  
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx', 'txt'].includes(ext)) return 'document';
  return 'other';
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return 'application/octet-stream';
  
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

interface AccessLog {
  document_id: string;
  action_type: 'view' | 'download' | 'chat';
  count: number;
}

export async function listDocuments({ subject, search }: { subject?: SubjectType; search?: string }) {
  try {
    console.log('Listing documents with params:', { subject, search });
    
    // First, sync storage files with database
    try {
      await syncStorageWithDatabase();
    } catch (syncError) {
      console.error('Error syncing storage with database:', syncError);
      // Continue with the query even if sync fails
    }
    
    // First get the documents
    let query = supabase
      .from('documents')
      .select('*');

    if (subject) {
      query = query.eq('subject', subject);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Add ordering by created_at to show newest files first
    query = query.order('created_at', { ascending: false });

    console.log('Executing documents query...');
    const { data: documents, error: docsError } = await query;
    
    if (docsError) {
      console.error('Error fetching documents:', docsError);
      throw new Error(`Failed to fetch documents: ${docsError.message}`);
    }

    if (!documents) {
      console.log('No documents found');
      return [];
    }

    // Then get the access logs for these documents
    const { data: accessLogs, error: logsError } = await supabase
      .from('document_access_logs')
      .select('document_id, action_type')
      .in('document_id', documents.map(doc => doc.id));

    if (logsError) {
      console.error('Error fetching access logs:', logsError);
      // Continue without access logs
    }

    // Process the documents with access logs
    const processedData = documents.map(doc => {
      const docLogs = (accessLogs as { document_id: string; action_type: 'view' | 'download' | 'chat' }[] | null)?.filter(log => log.document_id === doc.id) || [];
      const processedLogs = {
        views: docLogs.filter(log => log.action_type === 'view').length,
        downloads: docLogs.filter(log => log.action_type === 'download').length,
        chats: docLogs.filter(log => log.action_type === 'chat').length
      };

      return {
        ...doc,
        access_logs: [
          { count: processedLogs.views },
          { count: processedLogs.downloads },
          { count: processedLogs.chats }
        ]
      };
    });

    console.log('Documents processed:', processedData);
    return processedData;
  } catch (error) {
    console.error('Error listing documents:', error);
    throw error instanceof Error ? error : new Error('An unknown error occurred while listing documents');
  }
}

export async function deleteDocument(id: string) {
  try {
    console.log('Deleting document with ID:', id);
    
    // 1. Get the document to find its file path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching document for deletion:', fetchError);
      throw new Error(`Could not find document to delete: ${fetchError.message}`);
    }

    if (!document) {
      console.error('Document not found for deletion');
      throw new Error('Document not found');
    }

    console.log('Found document for deletion:', document);

    // 2. Delete the file from storage
    if (document?.file_path) {
      console.log('Attempting to delete file from storage:', document.file_path);
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      } else {
        console.log('Successfully deleted file from storage');
      }
    }

    // 3. Delete the document record (this will cascade delete access logs)
    console.log('Deleting document record from database');
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Error deleting document from database:', dbError);
      throw new Error(`Failed to delete document record: ${dbError.message}`);
    }

    console.log('Document successfully deleted');
    return true;
  } catch (error) {
    console.error('Error in deleteDocument:', error);
    throw error;
  }
}

export async function logDocumentAccess(documentId: string, action: 'view' | 'download' | 'chat') {
  try {
    // Use mock user ID instead of authentication
    const userId = MOCK_USER_ID;
    
    console.log(`Logging document access: ${action} for document ${documentId} by user ${userId}`);
    
    const { data, error } = await supabase
      .from('document_access_logs')
      .insert({
        document_id: documentId,
        user_id: userId,
        action_type: action
      });
    
    if (error) {
      console.error('Error logging document access:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in logDocumentAccess:', error);
    return null;
  }
}

export function getFileUrl(filePath: string) {
  try {
    console.log('Getting public URL for file:', filePath);
    
    if (!filePath) {
      throw new Error('File path is required');
    }

    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);
    
    if (!data.publicUrl) {
      throw new Error('Failed to generate public URL');
    }
    
    console.log('Generated public URL:', data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('Error generating file URL:', error);
    throw error;
  }
} 