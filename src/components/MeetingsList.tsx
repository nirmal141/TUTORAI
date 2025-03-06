import { useState, useEffect } from 'react';
import { Clock, Calendar, User, Mail, FileText, Trash2 } from 'lucide-react';

interface Meeting {
  id: string;
  professor_name: string;
  student_name: string;
  student_email: string;
  date: string;
  start_time: string;
  end_time: string;
  topic: string;
  questions: string | null;
  meeting_link: string | null;
  availability_id: string;
}

interface MeetingsListProps {
  userType: 'professor' | 'student';
  userIdentifier: string; // professor name or student email
}

export default function MeetingsList({ userType, userIdentifier }: MeetingsListProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      
      let url = '';
      if (userType === 'professor') {
        url = `/api/professor/bookings?professor_name=${encodeURIComponent(userIdentifier)}`;
      } else {
        url = `/api/student/bookings?student_email=${encodeURIComponent(userIdentifier)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch meetings');
      }
      
      const data = await response.json();
      setMeetings(data.bookings);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Failed to load meetings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [userType, userIdentifier]);

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this meeting? This action cannot be undone.')) {
      try {
        setCancellingId(bookingId);
        const response = await fetch(`/api/booking/${bookingId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to cancel booking');
        }
        
        // Remove the cancelled meeting from the state
        setMeetings(meetings.filter(meeting => meeting.id !== bookingId));
        
        // Dispatch custom event to notify other components that a booking was cancelled
        window.dispatchEvent(new CustomEvent('booking-cancelled'));
        
        // Show success message
        alert('Meeting cancelled successfully! The time slot is now available for rebooking.');
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel meeting. Please try again.');
      } finally {
        setCancellingId(null);
      }
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

  // Check if meeting is in the past
  const isMeetingPast = (dateString: string, timeString: string): boolean => {
    const meetingDate = new Date(`${dateString}T${timeString}`);
    return meetingDate < new Date();
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">
        {userType === 'professor' ? 'Your Scheduled Meetings' : 'Your Booked Sessions'}
      </h2>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 dark:text-red-400 text-center py-4">{error}</div>
      ) : meetings.length === 0 ? (
        <div className="text-zinc-500 dark:text-zinc-400 text-center py-4">
          No meetings scheduled at this time.
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => {
            const isPast = isMeetingPast(meeting.date, meeting.end_time);
            
            return (
              <div 
                key={meeting.id}
                className={`border ${isPast ? 'border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/70' : 'border-zinc-200 dark:border-zinc-700'} rounded-lg p-4 hover:shadow-md transition-shadow`}
              >
                <div className="flex justify-between">
                  <div className="flex flex-wrap gap-4 justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-indigo-500 mr-2" />
                        <span className="font-medium">{formatDate(meeting.date)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-indigo-500 mr-2" />
                        <span>
                          {formatTime(meeting.start_time)} - {formatTime(meeting.end_time)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {userType === 'professor' ? (
                        <>
                          <div className="flex items-center">
                            <User className="w-5 h-5 text-indigo-500 mr-2" />
                            <span>Student: {meeting.student_name}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Mail className="w-5 h-5 text-indigo-500 mr-2" />
                            <a 
                              href={`mailto:${meeting.student_email}`} 
                              className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              {meeting.student_email}
                            </a>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-indigo-500 mr-2" />
                          <span>Professor: {meeting.professor_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!isPast && (
                    <div>
                      <button
                        onClick={() => handleCancelBooking(meeting.id)}
                        disabled={cancellingId === meeting.id}
                        className={`text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
                          cancellingId === meeting.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="Cancel this meeting"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-start">
                    <FileText className="w-5 h-5 text-indigo-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-zinc-900 dark:text-white">
                        {meeting.topic}
                      </h3>
                      {meeting.questions && (
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                          {meeting.questions}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {meeting.meeting_link && (
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white mb-2">Meeting Link</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input 
                          type="text" 
                          value={meeting.meeting_link} 
                          readOnly 
                          className="text-sm bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-l py-1 px-2 flex-grow"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(meeting.meeting_link || '');
                            const messageElement = document.createElement('div');
                            messageElement.textContent = 'Link copied!';
                            messageElement.className = 'text-green-500 text-xs mt-1';
                            const parentElement = document.activeElement?.parentElement;
                            if (parentElement) {
                              parentElement.appendChild(messageElement);
                              setTimeout(() => parentElement.removeChild(messageElement), 2000);
                            }
                          }}
                          className="text-sm bg-indigo-600 text-white py-1 px-2 rounded-r hover:bg-indigo-700"
                        >
                          Copy
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {new Date(`${meeting.date}T${meeting.start_time}`) > new Date() 
                            ? 'Meeting link is ready. You can join at the scheduled time.' 
                            : 'This meeting is currently active. You can join now.'}
                        </p>
                        
                        <a 
                          href={meeting.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Join Google Meet
                        </a>
                      </div>
                    </div>
                  </div>
                )}
                
                {isPast && (
                  <div className="mt-4 bg-gray-100 dark:bg-zinc-700/30 rounded p-2 text-center text-xs text-gray-500 dark:text-gray-400">
                    This meeting has already concluded
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 