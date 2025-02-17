import { Mail, Phone, Globe, BookOpen } from 'lucide-react';

const professors = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    title: 'Professor of Computer Science',
    specialization: 'Artificial Intelligence & Machine Learning',
    email: 'sarah.johnson@university.edu',
    phone: '+1 (555) 123-4567',
    office: 'Science Building, Room 405',
    courses: ['Introduction to AI', 'Advanced Machine Learning'],
    availability: 'Monday, Wednesday 2-4 PM',
    imageUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    title: 'Associate Professor of Mathematics',
    specialization: 'Applied Mathematics & Statistics',
    email: 'michael.chen@university.edu',
    phone: '+1 (555) 234-5678',
    office: 'Mathematics Building, Room 302',
    courses: ['Advanced Calculus', 'Statistical Methods'],
    availability: 'Tuesday, Thursday 1-3 PM',
    imageUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  {
    id: 3,
    name: 'Dr. Emily Rodriguez',
    title: 'Professor of Physics',
    specialization: 'Quantum Physics & Theoretical Physics',
    email: 'emily.rodriguez@university.edu',
    phone: '+1 (555) 345-6789',
    office: 'Physics Building, Room 201',
    courses: ['Quantum Mechanics', 'Theoretical Physics'],
    availability: 'Wednesday, Friday 10 AM-12 PM',
    imageUrl: 'https://randomuser.me/api/portraits/women/3.jpg',
  },
];

export default function ProfessorsPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Background gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-orange-950/30 to-amber-950/30 blur-3xl opacity-50 transform rotate-12" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-900/20 to-amber-900/20 blur-3xl opacity-50 transform -rotate-12" />
      </div>

      <div className="relative p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500 mb-8">
            Our Professors
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professors.map((professor) => (
              <div 
                key={professor.id}
                className="bg-zinc-900 rounded-xl shadow-md overflow-hidden hover:shadow-orange-500/10 transition-all duration-300 border border-orange-500/20"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={professor.imageUrl}
                      alt={professor.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-orange-500"
                    />
                    <div>
                      <h2 className="text-xl font-semibold text-orange-200">{professor.name}</h2>
                      <p className="text-sm text-orange-400">{professor.title}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <p className="text-sm text-orange-400">
                      <span className="font-medium">Specialization:</span> {professor.specialization}
                    </p>
                    
                    <div className="flex items-center space-x-2 text-sm text-orange-400">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${professor.email}`} className="hover:text-orange-500">
                        {professor.email}
                      </a>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-orange-400">
                      <Phone className="w-4 h-4" />
                      <span>{professor.phone}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-orange-400">
                      <Globe className="w-4 h-4" />
                      <span>{professor.office}</span>
                    </div>
                  </div>

                  <div className="border-t border-orange-500/20 pt-4">
                    <h3 className="text-sm font-medium text-orange-200 mb-2">Courses</h3>
                    <div className="flex flex-wrap gap-2">
                      {professor.courses.map((course) => (
                        <span
                          key={course}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                        >
                          <BookOpen className="w-3 h-3 mr-1" />
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-orange-500/20">
                    <h3 className="text-sm font-medium text-orange-200 mb-2">Office Hours</h3>
                    <p className="text-sm text-orange-400">{professor.availability}</p>
                  </div>

                  <button className="mt-6 w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-700 hover:to-amber-700 transition-all duration-200">
                    Schedule Meeting
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 