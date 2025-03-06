import { useState } from 'react';
import { Calendar, Clock, Link } from 'lucide-react';

interface AvailabilityFormProps {
  professorName: string;
  onSuccess?: () => void;
}

export default function ProfessorAvailabilityForm({ professorName, onSuccess }: AvailabilityFormProps) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [generatedLink, setGeneratedLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !startTime || !endTime) {
      setMessage({ text: 'Please fill in all required fields', type: 'error' });
      return;
    }
    
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });
    
    try {
      const response = await fetch('/api/professor/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professor_name: professorName,
          date,
          start_time: startTime,
          end_time: endTime,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ text: 'Availability added successfully', type: 'success' });
        // Store the generated meeting link
        setGeneratedLink(data.meeting_link);
        
        // Reset form fields
        setDate('');
        setStartTime('');
        setEndTime('');
        
        // Call success callback if provided
        if (onSuccess) onSuccess();
      } else {
        setMessage({ text: data.message || 'Failed to add availability', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
      console.error('Error adding availability:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Set Your Availability</h2>
      
      {message.text && (
        <div 
          className={`p-3 mb-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
          }`}
        >
          {message.text}
        </div>
      )}
      
      {generatedLink && (
        <div className="p-4 mb-4 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center mb-2">
            <Link className="w-4 h-4 mr-1" />
            Meeting Link Generated
          </h3>
          <p className="text-xs text-blue-700 dark:text-blue-400 mb-2">
            A Google Meet link has been automatically generated for this time slot:
          </p>
          <div className="flex items-center">
            <input 
              type="text" 
              value={generatedLink} 
              readOnly 
              className="text-xs bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-800 rounded-l py-1 px-2 flex-grow"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedLink);
                setMessage({ text: 'Link copied to clipboard!', type: 'success' });
                setTimeout(() => setMessage({ text: '', type: '' }), 2000);
              }}
              className="text-xs bg-blue-600 text-white py-1 px-2 rounded-r hover:bg-blue-700"
            >
              Copy
            </button>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full pl-10 py-2 pr-3 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Start Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="block w-full pl-10 py-2 pr-3 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              End Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="block w-full pl-10 py-2 pr-3 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="text-xs text-zinc-500 dark:text-zinc-400 italic">
          Note: A Google Meet link will be automatically generated when you add availability.
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Adding...' : 'Add Availability'}
        </button>
      </form>
    </div>
  );
} 