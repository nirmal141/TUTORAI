import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Brain, Clock, Sparkles, Zap, Star, Rocket, Globe } from 'lucide-react';
import { SelectedProfessor } from './Chat';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';


interface DashboardProps {
  onSelectProfessor: (prof: SelectedProfessor) => void;
}

export default function Dashboard({ onSelectProfessor }: DashboardProps) {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('student');

  const stats = [
    { 
      icon: Rocket, 
      label: 'Active Sessions', 
      value: '892', 
      change: '+12.3%',
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-950/10'
    },
    { 
      icon: Globe, 
      label: 'AI Professors', 
      value: '24', 
      change: '+4 this week',
      color: 'from-orange-600 to-amber-600',
      bgColor: 'bg-orange-950/10'
    },
    { 
      icon: Zap, 
      label: 'Response Time', 
      value: '1.2s', 
      change: '-0.3s',
      color: 'from-amber-500 to-yellow-500',
      bgColor: 'bg-orange-950/10'
    },
    { 
      icon: Brain, 
      label: 'Knowledge Base', 
      value: '2.4TB', 
      change: '+240GB',
      color: 'from-orange-400 to-amber-400',
      bgColor: 'bg-orange-950/10'
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
      name: 'Dr. Smith', 
      field: 'Mathematics',
      specialty: 'Advanced Calculus',
      availability: '24/7',
      rating: 4.9,
      gradient: 'from-[#FF6B6B] to-[#FF8E53]'
    },
    { 
      name: 'Prof. Johnson', 
      field: 'Physics',
      specialty: 'Quantum Mechanics',
      availability: '24/7',
      rating: 4.8
    },
    { 
      name: 'Dr. Williams', 
      field: 'Computer Science',
      specialty: 'Machine Learning',
      availability: '24/7',
      rating: 4.7
    },
    { 
      name: 'Prof. Yann LeCun', 
      field: 'Machine Learning & AI',
      specialty: 'Deep Learning',
      availability: '24/7',
      rating: 5.0
    },
    { 
      name: 'Prof. Andrew Ng', 
      field: 'Deep Learning & AI',
      specialty: 'Neural Networks',
      availability: '24/7',
      rating: 4.9
    },
  ];

  // Also include a general advice option

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
    <div className="min-h-screen bg-black">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-orange-950/30 to-amber-950/30 blur-3xl opacity-50 transform rotate-12" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-900/20 to-amber-900/20 blur-3xl opacity-50 transform -rotate-12" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500 mb-4 tracking-tight">
            Tutor.AI
          </h1>
          <p className="text-lg text-orange-200/80 max-w-2xl mx-auto font-light">
            Experience personalized learning with our advanced AI professors
          </p>
        </motion.div>

        {/* Add this at the top of your dashboard */}
        <div className="mb-6 flex space-x-2">
          <Button
            className={`${activeView === 'student' ? 'bg-orange-500 text-white' : ''}`}
            onClick={() => {
              setActiveView('student');
              navigate('/');
            }}
          >
            Student Dashboard
          </Button>
          <Button
            className={`${activeView === 'professor' ? 'bg-orange-500 text-white' : ''}`}
            onClick={() => {
              setActiveView('professor');
              navigate('/professor-dashboard');
            }}
          >
            Professor Dashboard
          </Button>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative overflow-hidden border-none bg-zinc-900 shadow-xl hover:shadow-orange-500/10 transition-all duration-500 ${stat.bgColor}`}>
                <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-orange-500 to-transparent" />
                <CardContent className="p-6 relative">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                        <stat.icon className="h-6 w-6 text-black" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-orange-200/60">{stat.label}</p>
                        <h3 className="text-3xl font-bold mt-1 text-orange-500">
                          {stat.value}
                        </h3>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-zinc-800 text-orange-400">
                      {stat.change}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Professors Grid */}
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-orange-500 tracking-tight">
              Available Professors
            </h2>
            <Button 
              variant="outline" 
              className="gap-2 border-2 border-orange-500/20 hover:border-orange-500/40 text-orange-500"
            >
              <Users className="h-4 w-4" />
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {professors.map((prof, index) => (
              <motion.div
                key={prof.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <HoverCard>
                  <HoverCardTrigger>
                    <Card 
                      className="cursor-pointer group overflow-hidden bg-zinc-900 border-orange-500/10 hover:border-orange-500/20 transition-all duration-300"
                      onClick={() => handleProfessorClick(prof)}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <h3 className="text-xl font-semibold text-orange-500 group-hover:text-orange-400 transition-colors">
                                {prof.name}
                              </h3>
                              <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-amber-500 text-black font-medium">
                                {prof.field}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-orange-200/60">
                              <Clock className="h-4 w-4" />
                              {prof.availability}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-5 w-5 fill-current text-amber-500" />
                            <span className="font-medium text-orange-200">{prof.rating}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 backdrop-blur-lg bg-zinc-900/90 border-orange-500/20">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-orange-500">{prof.name}</h4>
                      <p className="text-sm text-orange-200/60">Specializes in {prof.specialty}</p>
                      <div className="pt-2 flex gap-2">
                        <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-amber-500 text-black">
                          {prof.field}
                        </Badge>
                        <Badge variant="outline" className="border-2 border-orange-500/20 text-orange-500">
                          {prof.availability}
                        </Badge>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Success Alert */}
        {showSuccessAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-4 right-4 z-50"
          >
            <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
              <CardContent className="p-4 flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-green-500" />
                <span className="text-green-700 dark:text-green-300">
                  Professor {currentProfessor?.name} has been selected!
                </span>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Enhanced Dialog */}
        <Dialog open={showSelectModal} onOpenChange={() => setShowSelectModal(false)}>
          <DialogContent className="bg-zinc-900 border-orange-500/20">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-orange-500">
                Configure {currentProfessor?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Select
                value={teachingMode}
                onValueChange={(value) => setTeachingMode(value)}
              >
                <SelectTrigger className="bg-zinc-800 border-orange-500/20 text-orange-200">
                  <SelectValue placeholder="Select teaching mode" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-orange-500/20">
                  <SelectItem value="Virtual">Virtual</SelectItem>
                  <SelectItem value="In-Person">In-Person</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={adviceType}
                onValueChange={(value) => setAdviceType(value)}
              >
                <SelectTrigger className="bg-zinc-800 border-orange-500/20 text-orange-200">
                  <SelectValue placeholder="Select advice type" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-orange-500/20">
                  <SelectItem value="Subject-Specific Advice">Subject-Specific Advice</SelectItem>
                  <SelectItem value="General Career Advice">General Career Advice</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={modelType}
                onValueChange={(value) => setModelType(value)}
              >
                <SelectTrigger className="bg-zinc-800 border-orange-500/20 text-orange-200">
                  <SelectValue placeholder="Select model type" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-orange-500/20">
                  <SelectItem value="openai">OpenAI (Online)</SelectItem>
                  <SelectItem value="local">Local LLM (Offline)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button 
                onClick={confirmSelection}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-black hover:from-orange-600 hover:to-amber-600"
              >
                Confirm Selection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
