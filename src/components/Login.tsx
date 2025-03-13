import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to '/'
  const from = (location.state as any)?.from?.pathname || '/';
  
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
              TutorAI Login
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to sign in to your account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {formError && (
                <Alert variant="destructive" className="text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input
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
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input 
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
                <div className="text-right">
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200" 
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
              
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link 
                  to="/register" 
                  className="font-medium text-zinc-900 hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
} 