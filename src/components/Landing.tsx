import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Brain, Users, Book, Shield, ChevronDown, GraduationCap, 
  Wifi, WifiOff, Zap, Database, Sparkles, Lock, Globe, Laptop,
  BookOpen, Lightbulb, Code, PenTool, Atom,
  MonitorDown, Apple, Download
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Floating animation for background elements
const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Text reveal animation
const textReveal = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

// Stagger children animation
const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Educational background symbols component
const EducationalSymbols = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        variants={floatingAnimation}
        initial="initial"
        animate="animate"
        className="absolute top-1/4 left-1/4 opacity-[0.25] dark:opacity-[0.15]"
      >
        <Atom className="w-24 h-24 text-zinc-800 dark:text-zinc-100" />
      </motion.div>
      <motion.div
        variants={floatingAnimation}
        initial="initial"
        animate="animate"
        className="absolute top-1/3 right-1/4 opacity-[0.25] dark:opacity-[0.15]"
      >
        <Code className="w-16 h-16 text-zinc-800 dark:text-zinc-100" />
      </motion.div>
      <motion.div
        variants={floatingAnimation}
        initial="initial"
        animate="animate"
        className="absolute bottom-1/4 left-1/3 opacity-[0.25] dark:opacity-[0.15]"
      >
        <BookOpen className="w-20 h-20 text-zinc-800 dark:text-zinc-100" />
      </motion.div>
      <motion.div
        variants={floatingAnimation}
        initial="initial"
        animate="animate"
        className="absolute top-2/3 right-1/3 opacity-[0.25] dark:opacity-[0.15]"
      >
        <PenTool className="w-16 h-16 text-zinc-800 dark:text-zinc-100" />
      </motion.div>
    </div>
  );
};

// Animated text component
const AnimatedText = ({ text, className }: { text: string, className?: string }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className={className}
    >
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          variants={textReveal}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

// Scroll progress indicator
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  
  return (
    <motion.div
      className="fixed left-0 top-0 right-0 h-1 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 transform origin-left z-50"
      style={{ scaleX: scrollYProgress }}
    />
  );
};

// Add new animation variants
const fadeInScale = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  }
};

const slideInFromRight = {
  initial: { x: 100, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

// Particle animation component
const ParticleEffect = () => {
  const particles = Array.from({ length: 20 });
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-zinc-400 to-zinc-600 dark:from-zinc-300 dark:to-zinc-500 rounded-full"
          initial={{
            opacity: 0,
            scale: 0,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  );
};

// Glowing dot grid background
const GlowingDotGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at center, currentColor 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
        mask: 'linear-gradient(to bottom, transparent, black, transparent)'
      }} />
    </div>
  );
};

// Animated gradient border component
const AnimatedBorder = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative p-[2px] rounded-xl overflow-hidden bg-gradient-to-r from-zinc-400/50 via-zinc-300/50 to-zinc-400/50 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-zinc-400 via-zinc-300 to-zinc-400 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700"
        animate={{
          x: ["0%", "100%", "0%"],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ filter: "blur(8px)" }}
      />
      <div className="relative bg-white dark:bg-zinc-900 rounded-xl">
        {children}
      </div>
    </div>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: featuresRef,
    offset: ["start end", "end start"]
  });

  const featuresOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const featuresY = useTransform(scrollYProgress, [0, 0.2], [100, 0]);

  const features = [
    {
      icon: WifiOff,
      title: "Offline Learning",
      description: "Experience accelerated AI learning powered by Snapdragon X Elite's NPU, delivering desktop-class performance",
      gradient: "from-zinc-700 to-zinc-900 dark:from-zinc-200 dark:to-white"
    },
    {
      icon: Brain,
      title: "NPU-Optimized AI",
      description: "Leveraging Qualcomm's Neural Processing Unit for lightning-fast local AI model execution and efficient learning",
      gradient: "from-zinc-800 to-zinc-950 dark:from-zinc-100 dark:to-zinc-300"
    },
    {
      icon: Database,
      title: "Local Knowledge Base",
      description: "Hardware-accelerated knowledge processing and retrieval optimized for Snapdragon X Elite architecture",
      gradient: "from-zinc-700 to-zinc-900 dark:from-zinc-200 dark:to-white"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Secure on-device AI processing with dedicated neural engine support for enhanced data protection",
      gradient: "from-zinc-800 to-zinc-950 dark:from-zinc-100 dark:to-zinc-300"
    }
  ];

  const advancedFeatures = [
    {
      icon: Laptop,
      title: "NPU-Powered Learning",
      description: "Optimized for Snapdragon X Elite's Neural Processing Unit",
      features: [
        "Up to 45 TOPS AI performance",
        "Hardware-accelerated model inference",
        "Efficient power consumption",
        "Desktop-class AI capabilities"
      ]
    },
    {
      icon: Sparkles,
      title: "Smart Learning",
      description: "AI acceleration powered by Qualcomm's latest NPU technology",
      features: [
        "Real-time model adaptation",
        "Neural engine optimization",
        "Advanced AI processing",
        "Efficient resource utilization"
      ]
    },
    {
      icon: Lock,
      title: "Enhanced Security",
      description: "Secure AI processing with hardware-level protection",
      features: [
        "Dedicated security engine",
        "Hardware encryption",
        "Secure AI execution",
        "Protected model storage"
      ]
    },
    {
      icon: Globe,
      title: "Hybrid Performance",
      description: "Seamless transition between online and offline modes",
      features: [
        "NPU-accelerated offline processing",
        "Optimized cloud synchronization",
        "Efficient resource management",
        "Adaptive performance scaling"
      ]
    }
  ];

  const faqs = [
    {
      question: "How does TutorAI leverage the Snapdragon X Elite NPU?",
      answer: "TutorAI is specifically optimized for Qualcomm's Snapdragon X Elite Neural Processing Unit, delivering up to 45 TOPS of AI performance. This enables desktop-class AI capabilities, allowing our models to run efficiently while maintaining high performance and low power consumption."
    },
    {
      question: "What makes TutorAI different from other AI tutoring platforms?",
      answer: "Our partnership with Qualcomm and optimization for the Snapdragon X Elite platform sets us apart. We leverage the dedicated NPU to run complex AI models locally with unprecedented efficiency, providing a truly responsive and personalized learning experience without cloud dependence."
    },
    {
      question: "How does offline learning work in TutorAI?",
      answer: "TutorAI uses LM Studio to run AI models locally on your device. This means you can continue learning even without internet connectivity. Your progress, materials, and AI interactions are stored locally and can optionally sync when you're back online."
    },
    {
      question: "What subjects are available offline?",
      answer: "All subjects including Mathematics, Physics, Chemistry, Biology, and Computer Science are available offline. Our local AI models are optimized to provide comprehensive coverage across all disciplines while maintaining fast response times."
    },
    {
      question: "How does TutorAI protect my privacy?",
      answer: "We prioritize your privacy with our local-first approach. All learning interactions happen on your device, and your data never leaves without your permission. You have complete control over what gets synchronized to the cloud."
    },
    {
      question: "Can I switch between online and offline modes?",
      answer: "Yes! TutorAI seamlessly transitions between online and offline modes. When online, you get additional features like model updates and optional cloud sync. When offline, you maintain full functionality with your local AI models."
    }
  ];

  // Add mouse parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      mouseX.set((clientX - centerX) / centerX);
      mouseY.set((clientY - centerY) / centerY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 relative">
      <ScrollProgress />
      <ParticleEffect />
      <GlowingDotGrid />
      
      {/* Update the header with animated border */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 w-full z-50 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800"
      >
        <AnimatedBorder>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-zinc-900 dark:text-white" />
                <span className="ml-2 text-xl font-semibold text-zinc-900 dark:text-white">TutorAI</span>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </AnimatedBorder>
      </motion.header>

      {/* Hero Section with enhanced animations */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <EducationalSymbols />
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-800 dark:to-zinc-900"
          style={{
            opacity: 0.5,
            x: useTransform(smoothMouseX, [-1, 1], [-20, 20]),
            y: useTransform(smoothMouseY, [-1, 1], [-20, 20]),
          }}
        />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-8"
            >
              <WifiOff className="h-4 w-4 text-zinc-900 dark:text-white mr-2" />
              <span className="text-sm font-medium text-zinc-900 dark:text-white">Works Offline</span>
            </motion.div>
            
            <AnimatedText
              text="Learn Anywhere with Offline-First AI Education"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white mb-6"
            />
            
            <motion.p
              variants={textReveal}
              initial="initial"
              animate="animate"
              className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto mb-8"
            >
              Experience the future of education with TutorAI's revolutionary offline learning system. 
              Get personalized AI tutoring anytime, anywhere – no internet required.
            </motion.p>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div variants={textReveal}>
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-lg px-8 py-6 group"
                >
                  <span className="relative">
                    Start Learning Now
                    <motion.span
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-current transform scale-x-0 group-hover:scale-x-100 transition-transform"
                      initial={false}
                    />
                  </span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              <motion.div variants={textReveal}>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 text-lg px-8 py-6"
                >
                  Explore Features
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section with proper spacing */}
      <motion.section
        ref={featuresRef}
        style={{ 
          opacity: featuresOpacity, 
          y: featuresY,
          perspective: 1000 
        }}
        className="py-24 bg-zinc-50 dark:bg-zinc-800/50"
        id="features"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={textReveal}
              className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4"
            >
              Revolutionary Offline Learning
            </motion.h2>
            <motion.p
              variants={textReveal}
              className="text-lg text-zinc-600 dark:text-zinc-400"
            >
              Experience AI-powered education that works without internet
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, rotateX: 45 }}
                whileInView={{ opacity: 1, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.2,
                  type: "spring",
                  damping: 15 
                }}
                className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-lg dark:shadow-zinc-900/30"
              >
                <div className="flex flex-col items-start">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className="h-6 w-6 text-white dark:text-zinc-900" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Coming Soon Section with proper spacing */}
      <section className="py-24 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-8"
            >
              <Download className="h-4 w-4 text-zinc-900 dark:text-white mr-2" />
              <span className="text-sm font-medium text-zinc-900 dark:text-white">Optimized for Snapdragon</span>
            </motion.div>
            
            <motion.h2
              variants={textReveal}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-6"
            >
              Desktop Applications
            </motion.h2>
            <motion.p
              variants={textReveal}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="text-lg text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto mb-12"
            >
              We're working with Qualcomm to bring you native desktop applications optimized for Snapdragon X Elite's NPU. Experience the future of AI-powered learning with desktop-class performance and efficiency.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-lg dark:shadow-zinc-900/30"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-6"
                >
                  <MonitorDown className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2 text-center">
                  Windows on Snapdragon
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-center">
                  Optimized for Windows on Snapdragon devices, delivering exceptional AI performance with NPU acceleration
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-lg dark:shadow-zinc-900/30"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center mx-auto mb-6"
                >
                  <Apple className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2 text-center">
                  macOS App
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-center">
                  Native macOS application with cross-platform AI optimization and seamless performance
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Advanced Features Section with proper spacing */}
      <section className="py-24 bg-zinc-50 dark:bg-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={textReveal}
              className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4"
            >
              Advanced Capabilities
            </motion.h2>
            <motion.p
              variants={textReveal}
              className="text-lg text-zinc-600 dark:text-zinc-400"
            >
              Discover what makes TutorAI unique
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {advancedFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-lg dark:shadow-zinc-900/30"
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8 }}
                    className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800"
                  >
                    <feature.icon className="h-6 w-6 text-zinc-900 dark:text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.features.map((item, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          viewport={{ once: true }}
                          className="flex items-center text-zinc-600 dark:text-zinc-400"
                        >
                          <Zap className="h-4 w-4 mr-2 text-zinc-900 dark:text-white" />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section with proper spacing */}
      <section className="py-24 bg-white dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={textReveal}
              className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4"
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.p
              variants={textReveal}
              className="text-lg text-zinc-600 dark:text-zinc-400"
            >
              Learn more about our offline-first approach
            </motion.p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="text-lg font-medium text-zinc-900 dark:text-white">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openFaqIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaqIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4">
                        <p className="text-zinc-600 dark:text-zinc-400">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with proper spacing */}
      <section className="py-24 bg-zinc-50 dark:bg-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <motion.h2
              variants={textReveal}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4"
            >
              Ready to Learn Anywhere?
            </motion.h2>
            <motion.p
              variants={textReveal}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="text-lg text-zinc-600 dark:text-zinc-400 mb-8"
            >
              Join thousands of students experiencing the future of offline AI education
            </motion.p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => navigate('/register')}
                className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-lg px-8 py-6"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer with proper spacing */}
      <footer className="py-12 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center mb-4"
            >
              <GraduationCap className="h-6 w-6 text-zinc-900 dark:text-white" />
              <span className="ml-2 text-lg font-semibold text-zinc-900 dark:text-white">TutorAI</span>
            </motion.div>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              © {new Date().getFullYear()} TutorAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 