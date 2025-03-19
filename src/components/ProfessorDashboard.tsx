import React, { useState } from 'react';
import { Brain, FileText, Calendar, ChevronRight, GraduationCap, Search } from 'lucide-react';
import Chat from './Chat';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface TeachingOptions {
  grade: string;
  subject: string;
  language: string;
  teachingMode: 'concept' | 'practice' | 'curriculum';
  duration?: string;
  modelType: 'openai' | 'local';
}

export default function ProfessorDashboard() {
  const [options, setOptions] = useState<TeachingOptions>({
    grade: '',
    subject: '',
    language: 'English',
    teachingMode: 'concept',
    modelType: 'openai'
  });
  const [showChat, setShowChat] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [activeView, setActiveView] = useState('professor');
  const navigate = useNavigate();

  const grades = ['6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'];
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Literature', 'History'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];
  const durations = ['1 Week', '2 Weeks', '1 Month', '3 Months', '6 Months', 'Full Year'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!options.grade || !options.subject) {
      alert('Please select both grade and subject');
      return;
    }
    setShowChat(true);
  };

  const generateInitialPrompt = () => {
    const basePrompt = `As an expert educator teaching ${options.subject} for ${options.grade} in ${options.language}, `;
    
    switch (options.teachingMode) {
      case 'concept':
        return basePrompt + `please provide a detailed explanation of key concepts that students should understand. Include examples and visual representations where appropriate.`;
      case 'practice':
        return basePrompt + `please generate a set of practice questions with varying difficulty levels. Include solutions and explanations.`;
      case 'curriculum':
        return basePrompt + `please create a ${options.duration} curriculum plan. Include learning objectives, key topics, suggested activities, and assessment methods.`;
      default:
        return basePrompt;
    }
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setIsChatExpanded(false);
  };

  const handleToggleExpand = () => {
    setIsChatExpanded(!isChatExpanded);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-800 dark:to-zinc-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at center, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          opacity: 0.15
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Enhanced Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center cursor-pointer"
                onClick={() => navigate('/')}
              >
                <GraduationCap className="h-10 w-10 text-zinc-900 dark:text-white" />
                <div className="ml-3">
                  <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    TutorAI
                  </h1>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Professor Dashboard
                  </p>
                </div>
              </motion.div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <ThemeToggle />
              </motion.div>
              
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input 
                  type="text" 
                  placeholder="Search resources..." 
                  className="pl-10 bg-white/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Navigation Tabs */}
        <div className="mb-10">
          <motion.div 
            className="border-b border-zinc-200 dark:border-zinc-800"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex space-x-8">
              <Button
                variant="ghost"
                className={`px-0 py-4 rounded-none font-medium text-sm relative ${
                  activeView === 'student' 
                    ? 'text-zinc-900 dark:text-white' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
                onClick={() => {
                  setActiveView('student');
                  navigate('/dashboard');
                }}
              >
                Student Dashboard
                {activeView === 'student' && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-zinc-500 to-zinc-900 dark:from-zinc-400 dark:to-white"
                  />
                )}
              </Button>
              <Button
                variant="ghost"
                className={`px-0 py-4 rounded-none font-medium text-sm relative ${
                  activeView === 'professor' 
                    ? 'text-zinc-900 dark:text-white' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
                onClick={() => {
                  setActiveView('professor');
                  navigate('/professor-dashboard');
                }}
              >
                Professor Dashboard
                {activeView === 'professor' && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-zinc-500 to-zinc-900 dark:from-zinc-400 dark:to-white"
                  />
                )}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Teaching Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { 
              mode: 'concept', 
              icon: Brain, 
              label: 'Teach Concepts', 
              desc: 'Generate explanations and examples for key concepts'
            },
            { 
              mode: 'practice', 
              icon: FileText, 
              label: 'Practice Questions', 
              desc: 'Create exercises and problems for students'
            },
            { 
              mode: 'curriculum', 
              icon: Calendar, 
              label: 'Generate Curriculum', 
              desc: 'Plan a comprehensive learning schedule'
            }
          ].map(({ mode, icon: Icon, label, desc }) => (
            <motion.div
              key={mode}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className={`h-full cursor-pointer border-zinc-200/50 dark:border-zinc-700/50 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 ${
                  options.teachingMode === mode
                    ? 'border-zinc-300 dark:border-zinc-600'
                    : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-700/80'
                }`}
                onClick={() => setOptions(prev => ({ ...prev, teachingMode: mode as TeachingOptions['teachingMode'] }))}
              >
                <CardContent className="p-6">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={`p-3 rounded-lg w-fit mb-4 ${
                      options.teachingMode === mode
                        ? 'bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-600 dark:to-zinc-500'
                        : 'bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-600'
                    }`}
                  >
                    <Icon className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-white">{label}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-zinc-200/50 dark:border-zinc-700/50 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Grade Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Grade Level</label>
                  <select
                    value={options.grade}
                    onChange={(e) => setOptions(prev => ({ ...prev, grade: e.target.value }))}
                    className="w-full bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 focus:border-zinc-500 dark:focus:border-zinc-400 backdrop-blur-sm"
                  >
                    <option value="">Select Grade</option>
                    {grades.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>

                {/* Subject Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Subject</label>
                  <select
                    value={options.subject}
                    onChange={(e) => setOptions(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 focus:border-zinc-500 dark:focus:border-zinc-400 backdrop-blur-sm"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                {/* Language Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Teaching Language</label>
                  <select
                    value={options.language}
                    onChange={(e) => setOptions(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 focus:border-zinc-500 dark:focus:border-zinc-400 backdrop-blur-sm"
                  >
                    {languages.map(language => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </select>
                </div>

                {/* Model Type Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">AI Model</label>
                  <select
                    value={options.modelType}
                    onChange={(e) => setOptions(prev => ({ 
                      ...prev, 
                      modelType: e.target.value as 'openai' | 'local' 
                    }))}
                    className="w-full bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 focus:border-zinc-500 dark:focus:border-zinc-400 backdrop-blur-sm"
                  >
                    <option value="openai">OpenAI (Online)</option>
                    <option value="local">LM Studio (Offline)</option>
                  </select>
                </div>

                {/* Duration Selection (only for curriculum mode) */}
                {options.teachingMode === 'curriculum' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Curriculum Duration</label>
                    <select
                      value={options.duration}
                      onChange={(e) => setOptions(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 focus:border-zinc-500 dark:focus:border-zinc-400 backdrop-blur-sm"
                    >
                      <option value="">Select Duration</option>
                      {durations.map(duration => (
                        <option key={duration} value={duration}>{duration}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full md:w-auto px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center space-x-2 backdrop-blur-sm"
                >
                  <span>Generate Teaching Material</span>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.form>

        {/* Chat Integration */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`fixed transition-all duration-300 ease-in-out ${
                isChatExpanded
                  ? 'inset-4 w-auto h-auto'
                  : 'bottom-4 right-4 w-[500px] h-[600px]'
              } bg-white/80 dark:bg-zinc-900/80 rounded-lg shadow-2xl border border-zinc-200/50 dark:border-zinc-700/50 overflow-hidden backdrop-blur-sm`}
            >
              <Chat
                selectedProfessor={{
                  name: "AI Educator",
                  field: options.subject,
                  teachingMode: options.teachingMode,
                  adviceType: "educational",
                  modelType: options.modelType
                }}
                initialPrompt={generateInitialPrompt()}
                onClose={handleCloseChat}
                isExpanded={isChatExpanded}
                onToggleExpand={handleToggleExpand}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 