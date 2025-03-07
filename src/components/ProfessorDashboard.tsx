import React, { useState } from 'react';
import { Brain, FileText, Calendar, ArrowRight } from 'lucide-react';
import Chat from './Chat';

interface TeachingOptions {
  grade: string;
  subject: string;
  language: string;
  teachingMode: 'concept' | 'practice' | 'curriculum';
  duration?: string; // Only for curriculum mode
  modelType: 'openai' | 'local'; // Add model type selection
}

export default function ProfessorDashboard() {
  const [options, setOptions] = useState<TeachingOptions>({
    grade: '',
    subject: '',
    language: 'English',
    teachingMode: 'concept',
    modelType: 'openai' // Default to OpenAI
  });
  const [showChat, setShowChat] = useState(false);

  const grades = ['6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'];
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Literature', 'History'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];
  const durations = ['1 Week', '2 Weeks', '1 Month', '3 Months', '6 Months', 'Full Year'];
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileDetails, setUploadedFileDetails] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!options.grade || !options.subject) {
      alert('Please select both grade and subject');
      return;
    }
    setShowChat(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setUploadedFileDetails(file.name);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }
    // Handle the file upload logic here
    alert(`File "${uploadedFileDetails}" uploaded successfully!`);
  };

  // Generate initial prompt based on teaching mode
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

  return (
    <div className="min-h-screen bg-black text-orange-200 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-orange-500 mb-8">Professor Dashboard</h1>
        
        {/* Teaching Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { mode: 'concept', icon: Brain, label: 'Teach Concepts', 
              desc: 'Generate explanations and examples for key concepts' },
            { mode: 'practice', icon: FileText, label: 'Practice Questions', 
              desc: 'Create exercises and problems for students' },
            { mode: 'curriculum', icon: Calendar, label: 'Generate Curriculum', 
              desc: 'Plan a comprehensive learning schedule' }
          ].map(({ mode, icon: Icon, label, desc }) => (
            <button
              key={mode}
              onClick={() => setOptions(prev => ({ ...prev, teachingMode: mode as TeachingOptions['teachingMode'] }))}
              className={`p-6 rounded-lg border transition-all ${
                options.teachingMode === mode
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-orange-500/20 hover:border-orange-500/50'
              }`}
            >
              <Icon className="w-8 h-8 mb-3 text-orange-400" />
              <h3 className="text-lg font-semibold mb-2">{label}</h3>
              <p className="text-sm text-orange-200/60">{desc}</p>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grade Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Grade Level</label>
              <select
                value={options.grade}
                onChange={(e) => setOptions(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full bg-zinc-900 border border-orange-500/20 rounded-lg p-3 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Select Grade</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            {/* Subject Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Subject</label>
              <select
                value={options.subject}
                onChange={(e) => setOptions(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full bg-zinc-900 border border-orange-500/20 rounded-lg p-3 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Teaching Language</label>
              <select
                value={options.language}
                onChange={(e) => setOptions(prev => ({ ...prev, language: e.target.value }))}
                className="w-full bg-zinc-900 border border-orange-500/20 rounded-lg p-3 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                {languages.map(language => (
                  <option key={language} value={language}>{language}</option>
                ))}
              </select>
            </div>

            {/* Add Model Type Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">AI Model</label>
              <select
                value={options.modelType}
                onChange={(e) => setOptions(prev => ({ 
                  ...prev, 
                  modelType: e.target.value as 'openai' | 'local' 
                }))}
                className="w-full bg-zinc-900 border border-orange-500/20 rounded-lg p-3 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                <option value="openai">OpenAI (Online)</option>
                <option value="local">LM Studio (Offline)</option>
              </select>
            </div>

            {/* Duration Selection (only for curriculum mode) */}
            {options.teachingMode === 'curriculum' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">Curriculum Duration</label>
                <select
                  value={options.duration}
                  onChange={(e) => setOptions(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full bg-zinc-900 border border-orange-500/20 rounded-lg p-3 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                >
                  <option value="">Select Duration</option>
                  {durations.map(duration => (
                    <option key={duration} value={duration}>{duration}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-black rounded-lg hover:from-orange-600 hover:to-amber-600 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Generate Teaching Material</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>



        <form onSubmit={handlePdfUploadSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grade Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Grade Level</label>
              <select
                value={options.grade}
                onChange={(e) => setOptions(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full bg-zinc-900 border border-orange-500/20 rounded-lg p-3 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Select Grade</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            {/* Subject Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Subject</label>
              <select
                value={options.subject}
                onChange={(e) => setOptions(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full bg-zinc-900 border border-orange-500/20 rounded-lg p-3 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-black rounded-lg hover:from-orange-600 hover:to-amber-600 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Generate Teaching Material</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>


        
      {/* File Upload Section */}
      <div className="mt-8 space-y-6">
          <h2 className="text-xl font-semibold text-orange-400">Upload Teaching Document</h2>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full text-orange-200 border border-orange-500/20 rounded-lg p-3 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
          <p className="text-sm text-orange-300">{uploadedFileDetails || 'No file selected'}</p>
          <button
            onClick={handleUpload}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-colors"
          >
            Upload Document
          </button>
      </div>
    </div>

        {/* Chat Integration */}
        {showChat && (
          <div className="mt-8">
            <Chat
              selectedProfessor={{
                name: "AI Educator",
                field: options.subject,
                teachingMode: options.teachingMode,
                adviceType: "educational",
                modelType: options.modelType
              }}
              initialPrompt={generateInitialPrompt()}
            />
          </div>
        )}
  </div>
  );
} 