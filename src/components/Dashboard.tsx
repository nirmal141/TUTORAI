import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Brain, Sparkles, Zap, Star, ChevronRight, Search, MessageSquare, Lightbulb, BookOpen, Check, GraduationCap } from 'lucide-react';
import { SelectedProfessor } from './Chat';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from 'react-router-dom';
import { ChangeEvent } from 'react';
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface DashboardProps {
  onSelectProfessor: (prof: SelectedProfessor) => void;
}

export default function Dashboard({ onSelectProfessor }: DashboardProps) {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('student');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { 
      icon: MessageSquare, 
      label: 'Active Sessions', 
      value: '892', 
      change: '+12.3%',
    },
    { 
      icon: Users, 
      label: 'AI Professors', 
      value: '5', 
      change: '+4 this week',
    },
    { 
      icon: Zap, 
      label: 'Response Time', 
      value: '1.2s', 
      change: '-0.3s',
    },
    { 
      icon: Brain, 
      label: 'Knowledge Base', 
      value: '160 GB', 
      change: '+240GB',
    },
  ];

  // For professor selection modal
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [currentProfessor, setCurrentProfessor] = useState<{ name: string; field: string } | null>(null);
  const [teachingMode, setTeachingMode] = useState('Virtual');
  const [adviceType, setAdviceType] = useState('Subject-Specific Advice');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [modelType, setModelType] = useState('openai');

  // Dummy professor list
  const professors = [
    { 
      name: 'Prof. Terrence Tao', 
      field: 'Mathematics',
      specialty: 'Advanced Calculus',
      availability: '24/7',
      rating: 4.9,
      icon: BookOpen,
    },
    { 
      name: 'Prof. Lisa Randall', 
      field: 'Physics',
      specialty: 'Quantum Mechanics',
      availability: '24/7',
      rating: 4.8,
      icon: Lightbulb,
    },
    { 
      name: 'Prof. David Malan', 
      field: 'Computer Science',
      specialty: 'Machine Learning',
      availability: '24/7',
      rating: 4.7,
      icon: Brain,
    },
    { 
      name: 'Prof. Yann LeCun', 
      field: 'Machine Learning & AI',
      specialty: 'Deep Learning',
      availability: '24/7',
      rating: 5.0,
      icon: Sparkles,
    },
    { 
      name: 'Prof. Andrew Ng', 
      field: 'Deep Learning & AI',
      specialty: 'Neural Networks',
      availability: '24/7',
      rating: 4.9,
      icon: Star,
    },
  ];

  const handleProfessorClick = (prof: { name: string; field: string }) => {
    setCurrentProfessor(prof);
    setShowSelectModal(true);
  };

  const confirmSelection = () => {
    if (currentProfessor) {
      onSelectProfessor({
        name: currentProfessor.name,
        field: currentProfessor.field,
        teachingMode,
        adviceType,
        modelType,
      });
      setShowSelectModal(false);
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    }
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

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    Your personal AI learning assistant
                  </p>
                </div>
              </motion.div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Theme Toggle with enhanced styling */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <ThemeToggle />
              </motion.div>
              
              {/* Enhanced Search Bar */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
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

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="h-full border-zinc-200/50 dark:border-zinc-700/50 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex flex-col h-full">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="p-2 rounded-md bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-600 w-fit mb-3"
                    >
                      <stat.icon className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                    </motion.div>
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                      <h3 className="text-2xl font-semibold mt-1 text-zinc-900 dark:text-white">
                        {stat.value}
                      </h3>
                    </div>
                    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700">
                      <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-300 font-normal backdrop-blur-sm">
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Professors Section */}
        <div className="space-y-6">
          <motion.div 
            className="flex justify-between items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-medium text-zinc-900 dark:text-white">
              Available Professors
            </h2>
            <Button 
              variant="outline" 
              className="text-xs gap-1 border-zinc-200/50 dark:border-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md backdrop-blur-sm"
              size="sm"
            >
              <Users className="h-3.5 w-3.5" />
              View All
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {professors.map((prof, index) => (
              <motion.div
                key={prof.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleProfessorClick(prof)}
              >
                <Card className="cursor-pointer border-zinc-200/50 dark:border-zinc-700/50 bg-white/80 dark:bg-zinc-800/80 hover:shadow-xl transition-all duration-300 overflow-hidden group backdrop-blur-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="p-3 rounded-md bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-600 group-hover:from-zinc-200 group-hover:to-zinc-300 dark:group-hover:from-zinc-600 dark:group-hover:to-zinc-500 transition-colors duration-300"
                      >
                        <prof.icon className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="font-medium text-zinc-900 dark:text-white group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors duration-300">
                          {prof.name}
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                          {prof.field}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex items-center">
                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                            <span className="text-xs font-medium ml-1 text-zinc-600 dark:text-zinc-300">
                              {prof.rating}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">•</span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {prof.specialty}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Professor Selection Modal */}
      <Dialog open={showSelectModal} onOpenChange={setShowSelectModal}>
        <DialogContent className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200/50 dark:border-zinc-700/50 text-zinc-900 dark:text-zinc-100 sm:max-w-md backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium">
              {currentProfessor?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Teaching Mode</p>
              <Select value={teachingMode} onValueChange={setTeachingMode}>
                <SelectTrigger className="border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50">
                  <SelectValue placeholder="Select teaching mode" />
                </SelectTrigger>
                <SelectContent className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-sm">
                  <SelectItem value="Virtual">Virtual</SelectItem>
                  <SelectItem value="Interactive">Interactive</SelectItem>
                  <SelectItem value="Guided">Guided</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Advice Type</p>
              <Select value={adviceType} onValueChange={setAdviceType}>
                <SelectTrigger className="border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50">
                  <SelectValue placeholder="Select advice type" />
                </SelectTrigger>
                <SelectContent className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-sm">
                  <SelectItem value="Subject-Specific Advice">Subject-Specific Advice</SelectItem>
                  <SelectItem value="General Learning Tips">General Learning Tips</SelectItem>
                  <SelectItem value="Career Guidance">Career Guidance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Model Type</p>
              <Select value={modelType} onValueChange={setModelType}>
                <SelectTrigger className="border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50">
                  <SelectValue placeholder="Select model type" />
                </SelectTrigger>
                <SelectContent className="bg-white/80 dark:bg-zinc-900/80 border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-sm">
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="local">Local Model</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowSelectModal(false)}
              className="border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmSelection}
              className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              Start Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Success Alert */}
      <AnimatePresence>
        {showSuccessAlert && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-4 right-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm"
          >
            <div className="flex items-center gap-2">
              <div className="p-1 bg-white/20 dark:bg-zinc-900/20 rounded-full">
                <Check className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium">
                Session started with {currentProfessor?.name}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
