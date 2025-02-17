const courses = [
  {
    id: 1,
    title: 'Introduction to Computer Science',
    description: 'Learn the fundamentals of programming and computer science',
    instructor: 'Dr. Smith',
    duration: '12 weeks',
    level: 'Beginner',
  },
  {
    id: 2,
    title: 'Advanced Mathematics',
    description: 'Deep dive into calculus and linear algebra',
    instructor: 'Dr. Johnson',
    duration: '16 weeks',
    level: 'Advanced',
  },
  // Add more courses as needed
];

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Background gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-orange-950/30 to-amber-950/30 blur-3xl opacity-50 transform rotate-12" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-900/20 to-amber-900/20 blur-3xl opacity-50 transform -rotate-12" />
      </div>

      <div className="relative p-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500 mb-8">
          Available Courses
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div 
              key={course.id} 
              className="bg-zinc-900 rounded-lg shadow-md p-6 hover:shadow-orange-500/10 transition-all duration-300 border border-orange-500/20"
            >
              <h2 className="text-xl font-semibold mb-2 text-orange-500">{course.title}</h2>
              <p className="text-orange-200/60 mb-4">{course.description}</p>
              <div className="space-y-2">
                <p className="text-sm text-orange-200/80">
                  <span className="font-medium text-orange-400">Instructor:</span> {course.instructor}
                </p>
                <p className="text-sm text-orange-200/80">
                  <span className="font-medium text-orange-400">Duration:</span> {course.duration}
                </p>
                <p className="text-sm text-orange-200/80">
                  <span className="font-medium text-orange-400">Level:</span> {course.level}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 