import React, { useState } from 'react';
import { BookOpen, CheckCircle, ArrowRight, MessageSquare, Clock, Award, User, BarChart2, Calendar, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Define types for the course data structure
interface CourseUnit {
  id: number;
  title: string;
  completed: boolean;
}

interface CourseModule {
  id: number;
  title: string;
  units: CourseUnit[];
}

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  image: string;
  category: string;
  prerequisites: string[];
  progress: number;
  modules: CourseModule[];
}

interface HelpResponse {
  question: string;
  answer: string;
}

// Extended course data with roadmap and modules
const courses: Course[] = [
  {
    id: 1,
    title: 'Introduction to Computer Science',
    description: 'Learn the fundamentals of programming and computer science',
    instructor: 'Dr. Smith',
    duration: '12 weeks',
    level: 'Beginner',
    image: 'https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Computer Science',
    prerequisites: ['None - open to beginners'],
    progress: 25,
    modules: [
      {
        id: 1,
        title: 'Getting Started with Programming',
        units: [
          { id: 1, title: 'Introduction to Algorithms', completed: true },
          { id: 2, title: 'Basic Programming Concepts', completed: true },
          { id: 3, title: 'Variables and Data Types', completed: false },
          { id: 4, title: 'Control Flow Statements', completed: false }
        ]
      },
      {
        id: 2,
        title: 'Data Structures and Algorithms',
        units: [
          { id: 1, title: 'Arrays and Lists', completed: false },
          { id: 2, title: 'Stacks and Queues', completed: false },
          { id: 3, title: 'Basic Sorting Algorithms', completed: false },
          { id: 4, title: 'Introduction to Big O Notation', completed: false }
        ]
      },
      {
        id: 3,
        title: 'Object-Oriented Programming',
        units: [
          { id: 1, title: 'Classes and Objects', completed: false },
          { id: 2, title: 'Inheritance and Polymorphism', completed: false },
          { id: 3, title: 'Encapsulation and Abstraction', completed: false },
          { id: 4, title: 'Design Patterns Basics', completed: false }
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Advanced Mathematics',
    description: 'Deep dive into calculus and linear algebra',
    instructor: 'Dr. Johnson',
    duration: '16 weeks',
    level: 'Advanced',
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Mathematics',
    prerequisites: ['Calculus I', 'Basic Linear Algebra'],
    progress: 0,
    modules: [
      {
        id: 1,
        title: 'Multivariable Calculus',
        units: [
          { id: 1, title: 'Partial Derivatives', completed: false },
          { id: 2, title: 'Multiple Integrals', completed: false },
          { id: 3, title: 'Vector Fields', completed: false },
          { id: 4, title: 'Line Integrals', completed: false }
        ]
      },
      {
        id: 2,
        title: 'Linear Algebra Advanced Topics',
        units: [
          { id: 1, title: 'Vector Spaces', completed: false },
          { id: 2, title: 'Eigenvalues and Eigenvectors', completed: false },
          { id: 3, title: 'Matrix Transformations', completed: false },
          { id: 4, title: 'Applications in Machine Learning', completed: false }
        ]
      }
    ]
  },
  {
    id: 3,
    title: 'Physics Fundamentals',
    description: 'Understanding the basic principles of physics',
    instructor: 'Dr. Williams',
    duration: '14 weeks',
    level: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1636466497217-06a74308ff05?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Physics',
    prerequisites: ['Basic Algebra', 'Trigonometry'],
    progress: 10,
    modules: [
      {
        id: 1,
        title: 'Classical Mechanics',
        units: [
          { id: 1, title: 'Newton\'s Laws of Motion', completed: true },
          { id: 2, title: 'Conservation of Energy', completed: false },
          { id: 3, title: 'Momentum and Collisions', completed: false },
          { id: 4, title: 'Rotational Motion', completed: false }
        ]
      },
      {
        id: 2,
        title: 'Waves and Optics',
        units: [
          { id: 1, title: 'Wave Properties', completed: false },
          { id: 2, title: 'Sound Waves', completed: false },
          { id: 3, title: 'Light and Reflection', completed: false },
          { id: 4, title: 'Refraction and Lenses', completed: false }
        ]
      }
    ]
  },
  {
    id: 4,
    title: 'Machine Learning Basics',
    description: 'Introduction to machine learning concepts and applications',
    instructor: 'Prof. Anderson',
    duration: '10 weeks',
    level: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1527430253228-e93688616381?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Computer Science',
    prerequisites: ['Programming Basics', 'Statistics', 'Linear Algebra'],
    progress: 5,
    modules: [
      {
        id: 1,
        title: 'Foundations of Machine Learning',
        units: [
          { id: 1, title: 'What is Machine Learning?', completed: true },
          { id: 2, title: 'Supervised vs Unsupervised Learning', completed: false },
          { id: 3, title: 'Training and Testing Sets', completed: false },
          { id: 4, title: 'Bias and Variance', completed: false }
        ]
      },
      {
        id: 2,
        title: 'Regression Models',
        units: [
          { id: 1, title: 'Linear Regression', completed: false },
          { id: 2, title: 'Gradient Descent', completed: false },
          { id: 3, title: 'Regularization Techniques', completed: false },
          { id: 4, title: 'Polynomial Regression', completed: false }
        ]
      },
      {
        id: 3,
        title: 'Classification Algorithms',
        units: [
          { id: 1, title: 'Logistic Regression', completed: false },
          { id: 2, title: 'Decision Trees', completed: false },
          { id: 3, title: 'Support Vector Machines', completed: false },
          { id: 4, title: 'K-Nearest Neighbors', completed: false }
        ]
      }
    ]
  }
];

// Helper component for course card
const CourseCard = ({ course, onClick }: { course: Course; onClick: (course: Course) => void }) => (
  <div 
    className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-zinc-200 dark:border-zinc-700 cursor-pointer overflow-hidden"
    onClick={() => onClick(course)}
  >
    <div className="h-40 overflow-hidden">
      <img 
        src={course.image} 
        alt={course.title} 
        className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
      />
    </div>
    <div className="p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
          {course.category}
        </span>
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {course.duration}
        </span>
      </div>
      <h2 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-white">{course.title}</h2>
      <p className="text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2">{course.description}</p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1">
          <span>Progress</span>
          <span>{course.progress}%</span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full" 
            style={{ width: `${course.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-300">
          <User className="w-4 h-4 mr-1" />
          {course.instructor}
        </div>
        <span className={`text-xs px-2 py-1 rounded font-medium ${
          course.level === 'Beginner' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
          course.level === 'Intermediate' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' :
          'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
        }`}>
          {course.level}
        </span>
      </div>
    </div>
  </div>
);

// Course detail view with roadmap
const CourseDetail = ({ course, onBack }: { course: Course; onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'roadmap' | 'help'>('overview');
  const [showHelp, setShowHelp] = useState(false);
  const [helpQuestion, setHelpQuestion] = useState('');
  const [helpResponse, setHelpResponse] = useState<HelpResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleHelpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpQuestion.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate AI response
    setTimeout(() => {
      setHelpResponse({
        question: helpQuestion,
        answer: `Here's some help regarding "${helpQuestion}" for the course "${course.title}": This is a simulated response. In a real implementation, this would connect to an AI model that could answer specific questions about the course content, provide clarification on concepts, or guide you through difficult topics.`
      });
      setHelpQuestion('');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={course.image} 
          alt={course.title} 
          className="w-full h-full object-cover"
        />
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
        >
          <ArrowRight className="w-5 h-5 transform rotate-180" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">{course.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-white/90">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span>{course.instructor}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center">
              <BarChart2 className="w-4 h-4 mr-1" />
              <span>{course.level}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-b border-zinc-200 dark:border-zinc-700">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-4 font-medium text-sm ${activeTab === 'overview' 
            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
            : 'text-zinc-600 dark:text-zinc-400'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('roadmap')}
          className={`px-6 py-4 font-medium text-sm ${activeTab === 'roadmap' 
            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
            : 'text-zinc-600 dark:text-zinc-400'}`}
        >
          Learning Roadmap
        </button>
        <button 
          onClick={() => {
            setActiveTab('help');
            setShowHelp(true);
          }}
          className={`px-6 py-4 font-medium text-sm flex items-center ${activeTab === 'help' 
            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
            : 'text-zinc-600 dark:text-zinc-400'}`}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Get Help
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">About this Course</h2>
              <p className="text-zinc-600 dark:text-zinc-400">{course.description}</p>
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">Prerequisites</h2>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400">
                {course.prerequisites.map((prereq, index) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">What You'll Learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {course.modules.flatMap(module => 
                  module.units.slice(0, 2).map(unit => (
                    <div key={`${module.id}-${unit.id}`} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-zinc-700 dark:text-zinc-300">{unit.title}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button className="mt-4 w-full bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 transition-colors font-medium">
              Continue Learning
            </button>
          </div>
        )}
        
        {activeTab === 'roadmap' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-zinc-900 dark:text-white">Course Modules</h2>
              <div className="flex items-center text-sm">
                <div className="flex items-center mr-4">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-zinc-600 dark:text-zinc-400">Completed</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-600 mr-2"></div>
                  <span className="text-zinc-600 dark:text-zinc-400">Pending</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {course.modules.map((module, moduleIndex) => (
                <div 
                  key={module.id} 
                  className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden"
                >
                  <div className="bg-zinc-50 dark:bg-zinc-900 p-4 flex items-center justify-between">
                    <h3 className="font-medium text-zinc-900 dark:text-white">
                      Module {moduleIndex+1}: {module.title}
                    </h3>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {module.units.filter(u => u.completed).length}/{module.units.length} completed
                    </span>
                  </div>
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                    {module.units.map((unit, unitIndex) => (
                      <div 
                        key={unit.id}
                        className={`p-4 flex items-center hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${
                          unit.completed ? 'bg-green-50/50 dark:bg-green-900/10' : ''
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                          unit.completed 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'
                        }`}>
                          {unit.completed ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <span className="text-xs">{moduleIndex+1}.{unitIndex+1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${
                            unit.completed 
                              ? 'text-zinc-900 dark:text-white' 
                              : 'text-zinc-600 dark:text-zinc-400'
                          }`}>
                            {unit.title}
                          </h4>
                        </div>
                        <button className={`text-xs px-3 py-1 rounded-full ${
                          unit.completed
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {unit.completed ? 'Completed' : 'Start'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'help' && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-blue-600 dark:text-blue-400">
              <h2 className="font-medium flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Get personalized help for this course
              </h2>
              <p className="text-sm mt-1">
                Ask questions about course content, get clarification on difficult concepts, or request additional resources.
              </p>
            </div>
            
            <form onSubmit={handleHelpSubmit} className="space-y-4">
              <div>
                <label htmlFor="help-question" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Your Question
                </label>
                <textarea
                  id="help-question"
                  placeholder="What do you need help with? Ask about specific topics or concepts..."
                  value={helpQuestion}
                  onChange={(e) => setHelpQuestion(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>
              <button 
                type="submit"
                disabled={!helpQuestion.trim() || isSubmitting}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Get Help
                  </>
                )}
              </button>
            </form>
            
            {helpResponse && (
              <div className="mt-6 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                <div className="bg-zinc-50 dark:bg-zinc-900 p-4">
                  <h3 className="font-medium text-zinc-900 dark:text-white">Your Question</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-1">{helpResponse.question}</p>
                </div>
                <div className="p-4 bg-white dark:bg-zinc-800">
                  <h3 className="font-medium text-zinc-900 dark:text-white">Answer</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-1">{helpResponse.answer}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function CoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  
  const filteredCourses = courses.filter(course => {
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterLevel && course.level !== filterLevel) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Your Learning Journey</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Browse courses and follow structured learning paths</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white w-full sm:w-auto"
              />
              <Search className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedCourse ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              key="course-detail"
            >
              <CourseDetail 
                course={selectedCourse} 
                onBack={() => setSelectedCourse(null)} 
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              key="course-list"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <CourseCard 
                      key={course.id} 
                      course={course} 
                      onClick={setSelectedCourse} 
                    />
                  ))
                ) : (
                  <div className="col-span-3 py-12 text-center">
                    <p className="text-zinc-500 dark:text-zinc-400">No courses found matching your criteria.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 