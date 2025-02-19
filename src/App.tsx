import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import Dashboard from './components/Dashboard';
import CoursesPage from './pages/CoursesPage';
import ProfessorsPage from './pages/ProfessorsPage';
import ModelsPage from './pages/ModelsPage';
import SettingsPage from './pages/SettingsPage';
import { useState } from 'react';
import { SelectedProfessor } from './components/Chat';
import { NextUIProvider } from '@nextui-org/react';
import ProfessorDashboard from './components/ProfessorDashboard';

function App() {
  const [selectedProfessor, setSelectedProfessor] = useState<SelectedProfessor | null>(null);

  return (
    <NextUIProvider>
      <Router>
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <main className="flex-1 flex flex-col">
            <div className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard onSelectProfessor={setSelectedProfessor} />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/professors" element={<ProfessorsPage />} />
                <Route path="/models" element={<ModelsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/professor-dashboard" element={<ProfessorDashboard />} />
              </Routes>
            </div>
            <div className="border-t">
              <Chat selectedProfessor={selectedProfessor} />
            </div>
          </main>
        </div>
      </Router>
    </NextUIProvider>
  );
}

export default App;
