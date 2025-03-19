import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Eye, EyeOff, Lock, Mail, GraduationCap } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to '/dashboard'
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);
    
    if (!email || !password) {
      setFormError('Please enter both email and password');
      setIsLoading(false);
      return;
    }
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setFormError(error.message || 'Failed to sign in');
        setIsLoading(false);
        return;
      }
      
      // Redirect to the page user tried to access or dashboard
      navigate(from, { replace: true });
    } catch (error: any) {
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
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-center text-zinc-600 dark:text-zinc-400">
                    Sign in to continue your learning journey
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
                  </AnimatePresence>
                  
                  <motion.div variants={formControls} initial="initial" animate="animate" className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input
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
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <Input 
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
                    <div className="text-right">
                      <Link 
                        to="/forgot-password" 
                        className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </motion.div>
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
                          <span className="mr-2">Signing in</span>
                          <div className="animate-spin h-4 w-4 border-2 border-white dark:border-zinc-900 border-t-transparent dark:border-t-transparent rounded-full"></div>
                        </div>
                      ) : (
                        'Sign in'
                      )}
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center text-sm"
                  >
                    Don't have an account?{" "}
                    <Link 
                      to="/register" 
                      className="font-medium text-zinc-900 hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300 transition-colors"
                    >
                      Sign up
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