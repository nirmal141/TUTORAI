import { useState, useEffect } from 'react';
import { Calendar, User, Mail, FileText } from 'lucide-react';

interface Availability {
  id: string;
  professor_name: string;
  date: string;
  start_time: string;
  end_time: string;
  meeting_link: string | null;
  is_booked: boolean;
}

interface BookMeetingFormProps {
  professorName?: string; // Optional: if provided, will filter availabilities by professor
  onSuccess?: () => void;
}

export default function BookMeetingForm({ professorName, onSuccess }: BookMeetingFormProps) {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState<string | null>(null);
  
  // Form fields
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch availabilities function
  const fetchAvailabilities = async () => {
    try {
      setLoading(true);
      const url = professorName 
        ? `/api/professor/availability?professor_name=${encodeURIComponent(professorName)}`
        : '/api/professor/availability';
        
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch availabilities');
      }
      
      const data = await response.json();
      // Filter out already booked slots
      const availableSlots = data.availabilities.filter(
        (slot: Availability) => !slot.is_booked
      );
      
      setAvailabilities(availableSlots);
    } catch (err) {
      console.error('Error fetching availabilities:', err);
      setError('Failed to load available time slots. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch availabilities on component mount
  useEffect(() => {
    fetchAvailabilities();
    
    // Set up automatic refreshing to get latest availability (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchAvailabilities();
    }, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [professorName]);

  // Add an event listener for a custom event that can be triggered when bookings are cancelled
  useEffect(() => {
    const handleBookingCancelled = () => {
      fetchAvailabilities();
    };
    
    window.addEventListener('booking-cancelled', handleBookingCancelled);
    
    return () => {
      window.removeEventListener('booking-cancelled', handleBookingCancelled);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAvailability || !studentName || !studentEmail || !topic) {
      setMessage({ text: 'Please fill in all required fields', type: 'error' });
      return;
    }
    
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });
    
    try {
      const response = await fetch('/api/student/book-meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          availability_id: selectedAvailability,
          student_name: studentName,
          student_email: studentEmail,
          topic,
          questions: questions || null,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Find the availability that was just booked to get the meeting link
        const bookedSlot = availabilities.find(a => a.id === selectedAvailability);
        const meetingLink = bookedSlot?.meeting_link;
        
        setMessage({ 
          text: meetingLink 
            ? 'Meeting booked successfully. You can join using the Google Meet link below.' 
            : 'Meeting booked successfully.', 
          type: 'success' 
        });
        
        // If there's a meeting link, display it prominently
        if (meetingLink) {
          // Instead of just removing the slot, update UI to show the booking details with link
          const linkElement = document.createElement('a');
          linkElement.href = meetingLink;
          linkElement.target = '_blank';
          linkElement.textContent = meetingLink;
          
          // Store the link for display in the UI
          localStorage.setItem('lastBookedMeeting', JSON.stringify({
            professorName: bookedSlot.professor_name,
            date: bookedSlot.date,
            startTime: bookedSlot.start_time,
            endTime: bookedSlot.end_time,
            link: meetingLink,
            topic
          }));
        }
        
        // Reset form
        setSelectedAvailability(null);
        setStudentName('');
        setStudentEmail('');
        setTopic('');
        setQuestions('');
        
        // Remove the booked slot from availabilities
        setAvailabilities(availabilities.filter(a => a.id !== selectedAvailability));
        
        // Call success callback if provided
        if (onSuccess) onSuccess();
      } else {
        setMessage({ text: data.message || 'Failed to book meeting', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
      console.error('Error booking meeting:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return new Date(0, 0, 0, parseInt(hours), parseInt(minutes)).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
        Book a Meeting with {professorName ? professorName : 'a Professor'}
      </h2>
      
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
      
      {/* Display meeting details if just booked */}
      {message.type === 'success' && localStorage.getItem('lastBookedMeeting') && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md">
          <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Your Meeting Details</h3>
          
          {(() => {
            const meetingData = JSON.parse(localStorage.getItem('lastBookedMeeting') || '{}');
            return (
              <div className="space-y-2">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <span className="font-medium">Professor:</span> {meetingData.professorName}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <span className="font-medium">Date:</span> {formatDate(meetingData.date)}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <span className="font-medium">Time:</span> {formatTime(meetingData.startTime)} - {formatTime(meetingData.endTime)}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <span className="font-medium">Topic:</span> {meetingData.topic}
                </p>
                
                <div className="pt-2">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Google Meet Link:</p>
                  <div className="flex items-center">
                    <input 
                      type="text" 
                      value={meetingData.link} 
                      readOnly 
                      className="text-sm bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-800 rounded-l py-1 px-2 flex-grow"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(meetingData.link);
                        setMessage({ text: 'Meeting link copied to clipboard!', type: 'success' });
                      }}
                      className="text-sm bg-blue-600 text-white py-1 px-2 rounded-r hover:bg-blue-700"
                    >
                      Copy
                    </button>
                  </div>
                  <a 
                    href={meetingData.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Join Google Meet
                  </a>
                </div>
                
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
                  * This link has been automatically generated for your meeting. Save it or bookmark this page.
                </p>
              </div>
            );
          })()}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 dark:text-red-400 text-center py-4">{error}</div>
      ) : availabilities.length === 0 ? (
        <div className="text-zinc-500 dark:text-zinc-400 text-center py-4">
          No available time slots found. Please check back later.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Available Time Slots <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto p-2 border border-zinc-300 dark:border-zinc-600 rounded-md">
              {availabilities.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-3 rounded-md border cursor-pointer transition-colors ${
                    selectedAvailability === slot.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
                  }`}
                  onClick={() => setSelectedAvailability(slot.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-zinc-500 dark:text-zinc-400 mr-1" />
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {formatDate(slot.date)}
                        </span>
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </div>
                    </div>
                    {!professorName && (
                      <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Prof. {slot.professor_name}
                      </div>
                    )}
                  </div>
                  {selectedAvailability === slot.id && slot.meeting_link && (
                    <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                      <span className="font-medium">Google Meet:</span> This session includes a Google Meet link that will be shared after booking.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  type="text"
                  id="studentName"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="block w-full pl-10 py-2 pr-3 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="studentEmail" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Your Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  type="email"
                  id="studentEmail"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="block w-full pl-10 py-2 pr-3 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Meeting Topic <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="block w-full pl-10 py-2 pr-3 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                placeholder="e.g., Assignment Help, Career Advice, etc."
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="questions" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Your Questions (optional)
            </label>
            <textarea
              id="questions"
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
              rows={4}
              className="block w-full py-2 px-3 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
              placeholder="List any specific questions or topics you'd like to discuss"
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !selectedAvailability}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              (isSubmitting || !selectedAvailability) ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Booking...' : 'Book Meeting'}
          </button>
        </form>
      )}
    </div>
  );
} 