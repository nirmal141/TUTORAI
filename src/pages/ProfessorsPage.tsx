import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, Plus, Trash } from 'lucide-react';
import BookMeetingForm from '../components/BookMeetingForm';
import ProfessorAvailabilityForm from '../components/ProfessorAvailabilityForm';
import MeetingsList from '../components/MeetingsList';

// Type definition for professor
interface Professor {
  id: string;
  name: string;
  title: string;
  specialization: string;
  email: string;
  phone: string;
  office: string;
}

// Type definition for availability
interface Availability {
  id: string;
  professor_name: string;
  date: string;
  start_time: string;
  end_time: string;
  meeting_link: string | null;
  is_booked: boolean;
}

export default function ProfessorsPage() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false); // In a real app, this would come from authentication
  
  // Demo values - in a real app these would come from user authentication/profile
  const [studentEmail, setStudentEmail] = useState('student@example.com');
  const [showMeetingsList, setShowMeetingsList] = useState(false);
  
  // State for professor data and availabilities
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for professor registration form
  const [newProfessor, setNewProfessor] = useState({
    name: '',
    title: '',
    specialization: '',
    email: '',
    phone: '',
    office: ''
  });
  
  // Fetch all professors and their availabilities
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // In a real app, you would fetch professors from a database
      // For demo purposes, we'll create some example professors if none exist
      const storedProfessors = localStorage.getItem('professors');
      let professorsList = [];
      
      if (storedProfessors) {
        professorsList = JSON.parse(storedProfessors);
      } else {
        // Default professor if none exist
        const defaultProfessor = {
          id: Math.random().toString(36).substring(2, 9),
          name: 'Dr. Sarah Johnson',
          title: 'Professor of Computer Science',
          specialization: 'Artificial Intelligence & Machine Learning',
          email: 'sarah.johnson@university.edu',
          phone: '+1 (555) 123-4567',
          office: 'Science Building, Room 405',
        };
        professorsList = [defaultProfessor];
        localStorage.setItem('professors', JSON.stringify(professorsList));
      }
      
      setProfessors(professorsList);
      
      // Fetch availabilities from the API
      try {
        const response = await fetch('/api/professor/availability');
        if (response.ok) {
          const data = await response.json();
          setAvailabilities(data.availabilities);
        }
      } catch (error) {
        console.error('Error fetching availabilities:', error);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, []);
  
  // Handle scheduling meeting
  const handleScheduleClick = (professorName: string) => {
    setSelectedProfessor(professorName);
    setIsBookingModalOpen(true);
  };

  // Handle setting availability
  const handleSetAvailabilityClick = (professorName: string) => {
    setSelectedProfessor(professorName);
    setIsAvailabilityModalOpen(true);
  };
  
  // Close modals
  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedProfessor(null);
  };

  const closeAvailabilityModal = () => {
    setIsAvailabilityModalOpen(false);
    setSelectedProfessor(null);
    
    // Refresh availabilities after setting new ones
    const fetchAvailabilities = async () => {
      try {
        const response = await fetch('/api/professor/availability');
        if (response.ok) {
          const data = await response.json();
          setAvailabilities(data.availabilities);
        }
      } catch (error) {
        console.error('Error fetching availabilities:', error);
      }
    };
    
    fetchAvailabilities();
  };
  
  const closeRegistrationModal = () => {
    setIsRegistrationModalOpen(false);
  };
  
  // Handle professor registration
  const handleProfessorRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProfessorWithId = {
      ...newProfessor,
      id: Math.random().toString(36).substring(2, 9),
    };
    
    const updatedProfessors = [...professors, newProfessorWithId];
    setProfessors(updatedProfessors);
    
    // In a real app, you would save this to a database
    localStorage.setItem('professors', JSON.stringify(updatedProfessors));
    
    // Reset form
    setNewProfessor({
      name: '',
      title: '',
      specialization: '',
      email: '',
      phone: '',
      office: ''
    });
    
    closeRegistrationModal();
  };
  
  // Handle input change for professor registration
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProfessor({
      ...newProfessor,
      [name]: value
    });
  };
  
  // Delete a professor (for demo purposes)
  const deleteProfessor = (id: string) => {
    const updatedProfessors = professors.filter(prof => prof.id !== id);
    setProfessors(updatedProfessors);
    localStorage.setItem('professors', JSON.stringify(updatedProfessors));
  };
  
  // Count availabilities per professor
  const getAvailabilityCount = (professorName: string) => {
    return availabilities.filter(a => 
      a.professor_name === professorName && !a.is_booked
    ).length;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">Our Professors</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Meet our faculty members and schedule meetings</p>
          </div>
          
          {/* Toggle for demo purposes */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Student View</span>
            <button 
              onClick={() => setIsAdmin(!isAdmin)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                isAdmin ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAdmin ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Professor View</span>
          </div>
        </div>
        
        {/* Admin actions */}
        {isAdmin && (
          <div className="mb-6">
            <button
              onClick={() => setIsRegistrationModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Register as Professor</span>
            </button>
          </div>
        )}
        
        {/* Toggle button for meetings list */}
        <div className="mb-6">
          <button
            onClick={() => setShowMeetingsList(!showMeetingsList)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            <span>
              {showMeetingsList ? 'Hide' : 'Show'} {isAdmin ? 'Scheduled Meetings' : 'Your Bookings'}
            </span>
          </button>
        </div>
        
        {/* Meetings list */}
        {showMeetingsList && (
          <div className="mb-8">
            {isAdmin && professors.length > 0 ? (
              // If admin and professors exist, show the first professor's meetings
              <MeetingsList userType="professor" userIdentifier={professors[0].name} />
            ) : !isAdmin ? (
              <MeetingsList userType="student" userIdentifier={studentEmail} />
            ) : (
              <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
                <p className="text-zinc-500 dark:text-zinc-400 text-center">
                  Please register as a professor first to view meetings.
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Demo student email input for testing */}
        {!isAdmin && showMeetingsList && (
          <div className="mb-8 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-md">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              For demo purposes, enter your email to view your bookings:
            </p>
            <div className="flex">
              <input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                className="flex-grow px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-l-md bg-white dark:bg-zinc-900"
                placeholder="your@email.com"
              />
              <button
                onClick={() => setShowMeetingsList(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-md"
              >
                View
              </button>
            </div>
          </div>
        )}
        
        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          /* Professors grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professors.length === 0 ? (
              <div className="col-span-3 bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-8 text-center">
                <p className="text-zinc-500 dark:text-zinc-400 mb-4">No professors registered yet.</p>
                {isAdmin && (
                  <button
                    onClick={() => setIsRegistrationModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                  >
                    Register as Professor
                  </button>
                )}
              </div>
            ) : (
              professors.map((professor) => (
                <div 
                  key={professor.id}
                  className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="p-6">
                    <div className="flex justify-between">
                      <div className="mb-4">
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">{professor.name}</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{professor.title}</p>
                      </div>
                      
                      {/* Admin can delete professors */}
                      {isAdmin && (
                        <button 
                          onClick={() => deleteProfessor(professor.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete Professor"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 mb-4">
                      <p className="text-sm text-zinc-600 dark:text-zinc-300">
                        <span className="font-medium text-zinc-900 dark:text-white">Specialization:</span>{' '}
                        {professor.specialization}
                      </p>
                      
                      <div className="flex items-center space-x-2 text-sm text-zinc-600 dark:text-zinc-300">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${professor.email}`} className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                          {professor.email}
                        </a>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-zinc-600 dark:text-zinc-300">
                        <Phone className="w-4 h-4" />
                        <span>{professor.phone}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-zinc-600 dark:text-zinc-300">
                        <User className="w-4 h-4" />
                        <span>{professor.office}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-zinc-900 dark:text-white">Available Time Slots</h3>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full">
                          {getAvailabilityCount(professor.name)} available
                        </span>
                      </div>
                    </div>

                    {isAdmin ? (
                      <button 
                        onClick={() => handleSetAvailabilityClick(professor.name)}
                        className="mt-6 w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Set Availability
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleScheduleClick(professor.name)}
                        className="mt-6 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Meeting
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="relative bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-3xl w-full overflow-hidden">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                onClick={closeBookingModal}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <BookMeetingForm 
                professorName={selectedProfessor || undefined} 
                onSuccess={closeBookingModal}
              />
            </div>
          </div>
        </div>
      )}

      {/* Availability Modal */}
      {isAvailabilityModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="relative bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-2xl w-full overflow-hidden">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                onClick={closeAvailabilityModal}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <ProfessorAvailabilityForm 
                professorName={selectedProfessor || ''} 
                onSuccess={closeAvailabilityModal}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Professor Registration Modal */}
      {isRegistrationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="relative bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-2xl w-full overflow-hidden">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                onClick={closeRegistrationModal}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Register as Professor</h2>
              <form onSubmit={handleProfessorRegistration} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newProfessor.name}
                    onChange={handleInputChange}
                    className="block w-full py-2 px-3 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newProfessor.title}
                    onChange={handleInputChange}
                    className="block w-full py-2 px-3 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={newProfessor.specialization}
                    onChange={handleInputChange}
                    className="block w-full py-2 px-3 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newProfessor.email}
                    onChange={handleInputChange}
                    className="block w-full py-2 px-3 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={newProfessor.phone}
                    onChange={handleInputChange}
                    className="block w-full py-2 px-3 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Office Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="office"
                    value={newProfessor.office}
                    onChange={handleInputChange}
                    className="block w-full py-2 px-3 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Register
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 