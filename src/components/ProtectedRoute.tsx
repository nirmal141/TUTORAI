import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/supabase';
import { ReactNode, useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, session, loading, forceCreateProfile } = useAuth();
  const location = useLocation();
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    // Add a timeout to prevent infinite loading state
    const timeoutId = setTimeout(() => {
      setTimeoutOccurred(true);
      setLocalLoading(false);
    }, 5000); // 5 seconds timeout

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    console.log("ProtectedRoute state:", {
      isLoading: loading,
      hasSession: !!session,
      hasUser: !!user,
      userRole: user?.role,
      allowedRoles,
      path: location.pathname,
      timeoutOccurred
    });

    // If we have a session but no user, and the timeout occurred, 
    // try to force create a profile as a last resort
    if (session?.user && !user && timeoutOccurred) {
      console.log("ProtectedRoute: Timeout occurred, forcing profile creation");
      forceCreateProfile(session.user.id, session.user.email || "user@example.com")
        .then(() => {
          console.log("ProtectedRoute: Force create profile completed");
          setLocalLoading(false);
        });
    } else if (!loading) {
      setLocalLoading(false);
    }
  }, [user, session, loading, allowedRoles, location, timeoutOccurred, forceCreateProfile]);

  // Show loading state while authentication is being checked
  if (loading && localLoading && !timeoutOccurred) {
    console.log("ProtectedRoute: Still loading auth state");
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  // If there's a session but no user profile yet, show a secondary loading state
  // This gives the auth context time to create a fallback profile if needed
  if (session && !user && localLoading && !timeoutOccurred) {
    console.log("ProtectedRoute: Session exists but no user profile yet");
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-zinc-900 dark:border-white mb-4"></div>
        <p className="text-zinc-600 dark:text-zinc-400">Loading your profile...</p>
      </div>
    );
  }

  // If we've timed out but have a session, proceed anyway
  if (timeoutOccurred && session) {
    console.log("ProtectedRoute: Timeout occurred but session exists, proceeding");
    return <>{children}</>;
  }

  // If user is not authenticated, redirect to login
  if (!session) {
    console.log("ProtectedRoute: No session, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified and user's role is not included, redirect to unauthorized page
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    console.log(`ProtectedRoute: User role (${user.role}) not in allowed roles, redirecting to unauthorized`);
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // If user is authenticated and has the required role (or we've timed out), render the children
  console.log("ProtectedRoute: Access granted");
  return <>{children}</>;
} 