import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Eye, EyeOff, Lock, Mail, User, Building, GraduationCap } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { supabase, UserRole, Institution } from '@/lib/supabase';

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const formControls = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

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
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  // Fetch institutions on component mount
  useEffect(() => {
    async function fetchInstitutions() {
      try {
        setLoadingInstitutions(true);
        setFetchError(null);
        
        console.log('Fetching institutions...');
        const { data, error } = await supabase
          .from('institutions')
          .select('id, name, domain, created_at, updated_at')
          .order('name');
        
        if (error) {
          console.error('Error fetching institutions:', error);
          setFetchError('Failed to load institutions. Please try again later.');
          return;
        }
        
        if (data) {
          console.log('Raw institutions data:', data);
          // Ensure the data matches the Institution type
          const typedInstitutions: Institution[] = data.map(item => ({
            id: item.id,
            name: item.name,
            domain: item.domain,
            created_at: item.created_at,
            updated_at: item.updated_at
          }));
          console.log('Processed institutions:', typedInstitutions);
          setInstitutions(typedInstitutions);
          
          if (typedInstitutions.length === 0) {
            setFetchError('No institutions found in the database.');
          }
        } else {
          console.log('No data returned from query');
          setFetchError('No institutions found in the database.');
        }
      } catch (error) {
        console.error('Error in fetchInstitutions:', error);
        setFetchError('An unexpected error occurred while loading institutions.');
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
    <div className="min-h-screen bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-800 dark:to-zinc-900 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at center, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          opacity: 0.15
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-8 left-4 flex items-center cursor-pointer"
          onClick={() => navigate('/')}
        >
          <GraduationCap className="h-8 w-8 text-zinc-900 dark:text-white" />
          <span className="ml-2 text-xl font-semibold text-zinc-900 dark:text-white">TutorAI</span>
        </motion.div>

        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-md"
          >
            <Card className="border-zinc-200/50 dark:border-zinc-700/50 shadow-xl backdrop-blur-sm bg-white/80 dark:bg-zinc-900/80">
              <CardHeader className="space-y-1">
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardTitle className="text-2xl font-bold text-center text-zinc-900 dark:text-white">
                    Join TutorAI
                  </CardTitle>
                  <CardDescription className="text-center text-zinc-600 dark:text-zinc-400">
                    Create your account and start learning
                  </CardDescription>
                </motion.div>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <AnimatePresence mode="wait">
                    {formError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Alert variant="destructive" className="text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                          <AlertDescription>{formError}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}

                    {fetchError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                          <AlertDescription className="text-amber-700 dark:text-amber-400">
                            {fetchError}
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <motion.div variants={formControls} initial="initial" animate="animate" className="space-y-2">
                    <Label htmlFor="fullName" className="text-zinc-700 dark:text-zinc-300">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 bg-white/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                        required
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div variants={formControls} initial="initial" animate="animate" className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-white/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                        required
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div variants={formControls} initial="initial" animate="animate" className="space-y-2">
                    <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input 
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 bg-white/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                        required
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                  
                  <motion.div variants={formControls} initial="initial" animate="animate" className="space-y-2">
                    <Label htmlFor="role" className="text-zinc-700 dark:text-zinc-300">Role</Label>
                    <Select value={role} onValueChange={handleRoleChange}>
                      <SelectTrigger className="border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="institution_admin">Institution Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                  
                  {(role === 'teacher' || role === 'institution_admin' || role === 'student') && (
                    <motion.div
                      variants={formControls}
                      initial="initial"
                      animate="animate"
                      className="space-y-2"
                    >
                      <Label htmlFor="institution" className="text-zinc-700 dark:text-zinc-300">
                        Institution {role !== 'student' && <span className="text-red-500">*</span>}
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                        <Select
                          value={institutionId || ''}
                          onValueChange={setInstitutionId}
                          disabled={loadingInstitutions}
                        >
                          <SelectTrigger className="pl-10 border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50">
                            <SelectValue placeholder={loadingInstitutions ? 'Loading...' : 'Select your institution'} />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                            {institutions.map((institution) => (
                              <SelectItem key={institution.id} value={institution.id}>
                                {institution.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full"
                  >
                    <Button 
                      type="submit" 
                      className="w-full bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-200" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <span className="mr-2">Creating account</span>
                          <div className="animate-spin h-4 w-4 border-2 border-white dark:border-zinc-900 border-t-transparent dark:border-t-transparent rounded-full"></div>
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center text-sm"
                  >
                    Already have an account?{" "}
                    <Link 
                      to="/login" 
                      className="font-medium text-zinc-900 hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300 transition-colors"
                    >
                      Sign in
                    </Link>
                  </motion.div>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 