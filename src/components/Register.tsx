import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Eye, EyeOff, Lock, Mail, User, Building } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { supabase, UserRole, Institution } from '@/lib/supabase';

// Sample universities to add if none exist
const SAMPLE_UNIVERSITIES = [
  { id: 'nyu-id', name: 'New York University (NYU)', domain: 'nyu.edu' },
  { id: 'neu-id', name: 'Northeastern University (NEU)', domain: 'northeastern.edu' },
  { id: 'mit-id', name: 'Massachusetts Institute of Technology (MIT)', domain: 'mit.edu' },
  { id: 'stanford-id', name: 'Stanford University', domain: 'stanford.edu' },
  { id: 'harvard-id', name: 'Harvard University', domain: 'harvard.edu' },
  { id: 'berkeley-id', name: 'UC Berkeley', domain: 'berkeley.edu' },
];

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  // Initialize sample institutions if none exist
  async function initializeSampleInstitutions() {
    try {
      // Check if any institutions exist
      const { data: existingInstitutions, error: checkError } = await supabase
        .from('institutions')
        .select('id')
        .limit(1);
      
      if (checkError) {
        console.error('Error checking institutions:', checkError);
        return false;
      }
      
      // If no institutions exist, add sample universities
      if (!existingInstitutions || existingInstitutions.length === 0) {
        console.log('No institutions found, adding sample universities...');
        
        for (const uni of SAMPLE_UNIVERSITIES) {
          const { error } = await supabase
            .from('institutions')
            .insert({
              name: uni.name,
              domain: uni.domain
            });
          
          if (error) {
            console.error(`Error adding institution ${uni.name}:`, error);
          } else {
            console.log(`Added institution: ${uni.name}`);
          }
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error initializing sample institutions:', error);
      return false;
    }
  }
  
  // Fetch institutions on component mount
  useEffect(() => {
    async function fetchInstitutions() {
      try {
        setLoadingInstitutions(true);
        
        // First try to initialize sample institutions if needed
        const initialized = await initializeSampleInstitutions();
        
        // Then fetch all institutions
        const { data, error } = await supabase
          .from('institutions')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Error fetching institutions:', error);
          setFetchFailed(true);
          // Use sample universities as fallback
          setInstitutions(SAMPLE_UNIVERSITIES as Institution[]);
          return;
        }
        
        if (data && data.length > 0) {
          setInstitutions(data);
        } else if (initialized) {
          // If we just initialized institutions, fetch them again
          const { data: refreshData, error: refreshError } = await supabase
            .from('institutions')
            .select('*')
            .order('name');
            
          if (refreshError) {
            console.error('Error refreshing institutions after initialization:', refreshError);
            setFetchFailed(true);
            setInstitutions(SAMPLE_UNIVERSITIES as Institution[]);
          } else {
            setInstitutions(refreshData || []);
          }
        } else {
          // Still no institutions, use sample as fallback
          setInstitutions(SAMPLE_UNIVERSITIES as Institution[]);
          setFetchFailed(true);
        }
      } catch (error) {
        console.error('Error in fetchInstitutions:', error);
        setFetchFailed(true);
        // Use sample universities as fallback
        setInstitutions(SAMPLE_UNIVERSITIES as Institution[]);
      } finally {
        setLoadingInstitutions(false);
      }
    }
    
    fetchInstitutions();
  }, []);
  
  const handleRoleChange = (value: string) => {
    // Ensure the role value matches exactly what the database expects
    if (value === 'student' || value === 'teacher' || value === 'institution_admin') {
      setRole(value as UserRole);
    } else {
      console.error('Invalid role value:', value);
      // Map UI-friendly names to database values if needed
      if (value === 'Institution Admin') {
        setRole('institution_admin');
      } else {
        setRole('student'); // Default fallback
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);
    
    if (!email || !password || !fullName || !role) {
      setFormError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }
    
    // Validate institution ID for teachers and institution admins
    if ((role === 'teacher' || role === 'institution_admin') && !institutionId) {
      setFormError('Institution is required for teachers and admins');
      setIsLoading(false);
      return;
    }
    
    try {
      // For students, institution ID is optional
      const instId = role === 'student' && !institutionId ? null : institutionId;
      
      console.log('Signing up with:', { email, fullName, role, institutionId: instId });
      
      const { error } = await signUp(email, password, fullName, role, instId);
      
      if (error) {
        console.error('Registration error:', error);
        setFormError(error.message || 'Failed to register');
        setIsLoading(false);
        return;
      }
      
      // Redirect to login page with success message
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please verify your email and then log in.' 
        } 
      });
    } catch (error: any) {
      console.error('Unexpected error during registration:', error);
      setFormError(error.message || 'An unexpected error occurred');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Create an Account
            </CardTitle>
            <CardDescription className="text-center">
              Enter your details to register for TutorAI
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {formError && (
                <Alert variant="destructive" className="text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              
              {fetchFailed && (
                <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 mb-2">
                  <AlertDescription className="text-amber-700 dark:text-amber-400">
                    Using sample institutions. Some features may be limited.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input 
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="institution_admin">Institution Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(role === 'teacher' || role === 'institution_admin' || role === 'student') && (
                <div className="space-y-2">
                  <Label htmlFor="institution">
                    Institution
                    {role !== 'student' && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Select 
                      value={institutionId || undefined} 
                      onValueChange={setInstitutionId}
                      disabled={loadingInstitutions}
                    >
                      <SelectTrigger className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 pl-10">
                        <SelectValue placeholder={loadingInstitutions ? "Loading institutions..." : "Select your institution"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        {institutions.map((institution) => (
                          <SelectItem key={institution.id} value={institution.id}>
                            {institution.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <span className="mr-2">Creating Account</span>
                    <div className="animate-spin h-4 w-4 border-2 border-white dark:border-zinc-900 border-t-transparent dark:border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  'Sign up'
                )}
              </Button>
              
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link 
                  to="/login" 
                  className="font-medium text-zinc-900 hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
} 