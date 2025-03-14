/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: 'https://mcmsvjxmrjfobnztwybz.supabase.co'
  readonly VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbXN2anhtcmpmb2JuenR3eWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODMyODksImV4cCI6MjA1NjU1OTI4OX0.z3ciTdvVnAyAf6H0DnfW9WkWtLs3ZlzTFhKiiPdqDiY'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 