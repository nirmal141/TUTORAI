import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, Users, Book, Shield } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Advanced AI models that mimic professor teaching styles for personalized education",
      gradient: "from-orange-500 to-amber-500"
    },
    {
      icon: Users,
      title: "Personalized Experience",
      description: "Adaptive learning paths tailored to individual student needs and progress",
      gradient: "from-amber-500 to-yellow-500"
    },
    {
      icon: Book,
      title: "Comprehensive Knowledge",
      description: "Extensive database of educational content and real-time support",
      gradient: "from-orange-600 to-amber-600"
    },
    {
      icon: Shield,
      title: "Ethical AI",
      description: "Privacy-focused approach with transparent AI decision-making",
      gradient: "from-amber-600 to-yellow-600"
    }
  ];

  const stats = [
    { value: "24/7", label: "Availability" },
    { value: "1.2s", label: "Response Time" },
    { value: "95%", label: "Accuracy Rate" },
    { value: "2.4TB", label: "Knowledge Base" }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-orange-950/30 to-amber-950/30 blur-3xl opacity-50 transform rotate-12" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-900/20 to-amber-900/20 blur-3xl opacity-50 transform -rotate-12" />
      </div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8"
        >
          <h1 className="text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              TutorAI
            </span>
          </h1>
          <p className="text-2xl text-orange-200/80 max-w-3xl mx-auto">
            An AI-powered educational platform that mimics professor teaching styles for enhanced learning experiences.
          </p>
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-black font-semibold flex items-center gap-2 hover:from-orange-600 hover:to-amber-600 transition-all"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-orange-500/20 rounded-xl text-orange-400 font-semibold hover:bg-orange-500/10 transition-all"
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent"
              >
                {stat.value}
              </motion.div>
              <div className="mt-2 text-orange-200/60">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Features Section */}
        <div className="mt-32">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-6 rounded-2xl bg-zinc-900/50 border border-orange-500/10 hover:border-orange-500/20 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-orange-400 mb-2">{feature.title}</h3>
                <p className="text-orange-200/60">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Project Overview Section */}
        <div className="mt-32">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Project Overview
          </h2>
          <div className="prose prose-invert max-w-4xl mx-auto">
            <p className="text-lg text-orange-200/80 leading-relaxed">
              TutorAI is an innovative AI-powered educational tool designed to simulate the teaching style of specific professors. 
              By leveraging advanced natural language processing, machine learning, and dialogue management techniques, 
              TutorAI provides students with highly personalized learning experiences that adapt to their individual needs.
            </p>
            {/* Add more project details as needed */}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-32 text-center"
        >
          <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Ready to Transform Your Learning Experience?
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="px-12 py-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-black font-semibold text-xl flex items-center gap-2 mx-auto hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            Get Started Now
            <ArrowRight className="h-6 w-6" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
} 