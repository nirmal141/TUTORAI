import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

  // Default to student view, but this could be configurable
  const defaultUserRole = 'student';
  
  return (
    <Layout>
      <div className="h-full overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard onSelectProfessor={handleSelectProfessor} />} />
          <Route path="/professor-dashboard" element={<ProfessorDashboard />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/professors" element={<ProfessorsPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
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
  );
}

export default function App() {
  console.log("App component is rendering");

  return (
    <Router>
      <AppContent />
    </Router>
  );
}
