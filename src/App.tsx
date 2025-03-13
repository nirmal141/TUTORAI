import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import type { SelectedProfessor } from './components/Chat';
import { AnimatePresence, motion } from 'framer-motion';
import ProfessorDashboard from './components/ProfessorDashboard';
import CoursesPage from './pages/CoursesPage';
import ProfessorsPage from './pages/ProfessorsPage';
import ModelsPage from './pages/ModelsPage';
import SettingsPage from './pages/SettingsPage';
import ResourcesPage from './pages/ResourcesPage';
import InstitutionsPage from './pages/InstitutionsPage';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider } from './lib/auth-context';
import ProtectedRoute from './components/ProtectedRoute';

// Debug: Check if this file renders
console.log("App.tsx is rendering");

function AppContent() {
  console.log("AppContent rendered");

  const [selectedProfessor, setSelectedProfessor] = useState<SelectedProfessor | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  const handleSelectProfessor = (prof: SelectedProfessor) => {
    setSelectedProfessor(prof);
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setIsChatExpanded(false);
  };

  const handleToggleExpand = () => {
    setIsChatExpanded(!isChatExpanded);
  };
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <div className="h-full overflow-auto">
              <Dashboard onSelectProfessor={handleSelectProfessor} />
            </div>
            
            <AnimatePresence>
              {isChatOpen && selectedProfessor && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className={`fixed transition-all duration-300 ease-in-out ${
                    isChatExpanded
                      ? 'inset-4 w-auto h-auto'
                      : 'bottom-4 right-4 w-[500px] h-[600px]'
                  } bg-white dark:bg-zinc-900 rounded-lg shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden`}
                >
                  <Chat 
                    selectedProfessor={selectedProfessor} 
                    onClose={handleCloseChat}
                    isExpanded={isChatExpanded}
                    onToggleExpand={handleToggleExpand}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/professor-dashboard" element={
        <ProtectedRoute allowedRoles={['teacher', 'institution_admin']}>
          <Layout>
            <div className="h-full overflow-auto">
              <ProfessorDashboard />
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/courses" element={
        <ProtectedRoute>
          <Layout>
            <div className="h-full overflow-auto">
              <CoursesPage />
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/professors" element={
        <ProtectedRoute>
          <Layout>
            <div className="h-full overflow-auto">
              <ProfessorsPage />
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/resources" element={
        <ProtectedRoute>
          <Layout>
            <div className="h-full overflow-auto">
              <ResourcesPage />
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/models" element={
        <ProtectedRoute>
          <Layout>
            <div className="h-full overflow-auto">
              <ModelsPage />
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout>
            <div className="h-full overflow-auto">
              <SettingsPage />
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/institutions" element={
        <ProtectedRoute allowedRoles={['institution_admin']}>
          <Layout>
            <div className="h-full overflow-auto">
              <InstitutionsPage />
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Unauthorized page */}
      <Route path="/unauthorized" element={
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-900 p-4">
          <h1 className="text-2xl font-bold mb-2">Unauthorized Access</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">You don't have permission to access this page.</p>
          <button 
            onClick={() => window.history.back()} 
            className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-md"
          >
            Go Back
          </button>
        </div>
      } />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  console.log("App component is rendering");

  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
