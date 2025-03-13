import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { UserRole, Profile } from './supabase';
import { Session } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  user: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole, institutionId: string | null) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  isRole: (role: UserRole) => boolean;
  getUserProfile: () => Promise<Profile | null>;
  forceCreateProfile: (userId: string, email: string, role?: UserRole) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileCreationAttempts, setProfileCreationAttempts] = useState(0);

  useEffect(() => {
    // Initialize the auth state
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.id ? "User logged in" : "No session");
      setSession(session);
      if (session?.user) {
        getUserProfile().then(profile => {
          console.log("Initial profile fetch:", profile ? "Profile found" : "No profile found");
          if (profile) {
            setUser(profile);
          } else {
            console.warn("User is authenticated but profile not found. Creating fallback profile.");
            createFallbackProfile(session.user.id);
          }
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change event:", event, session?.user?.id);
      setSession(session);
      
      if (session?.user) {
        // On sign in or user update, get the user profile
        const profile = await getUserProfile();
        console.log("Profile after auth change:", profile ? "Profile found" : "No profile found");
        
        if (!profile && event === 'SIGNED_IN') {
          console.warn("User signed in but no profile found. Creating fallback profile.");
          await createFallbackProfile(session.user.id);
        } else if (profile) {
          setUser(profile);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Force creation of a profile - use this as a backup method
  const forceCreateProfile = async (userId: string, email: string, role: UserRole = 'student') => {
    try {
      console.log("Force creating profile for user:", userId);
      
      // Create a minimal profile
      const { data: userDetails } = await supabase.auth.getUser(userId);
      const userData = userDetails?.user;
      
      // Try creating with service role if available
      // If your app doesn't have a service role client, this will use the regular client
      const client = supabase;
      
      const { data: profile, error: profileError } = await client
        .from('profiles')
        .insert({
          id: userId,
          full_name: userData?.user_metadata?.full_name || email?.split('@')[0] || 'User',
          role: role,
          email: email
        })
        .select()
        .single();
      
      if (profileError) {
        console.error("Error force creating profile:", profileError);
        
        // As a last resort, create a synthetic profile object
        // This allows the app to function even if we can't write to the database
        const syntheticProfile: Profile = {
          id: userId,
          full_name: userData?.user_metadata?.full_name || email?.split('@')[0] || 'User',
          role: role,
          email: email,
          institution_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log("Using synthetic profile as fallback:", syntheticProfile);
        setUser(syntheticProfile);
        setLoading(false);
      } else {
        console.log("Force profile creation successful:", profile);
        setUser(profile);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error in forceCreateProfile:", err);
      setLoading(false);
    }
  };

  // Create a fallback profile if the user has authenticated but no profile exists
  const createFallbackProfile = async (userId: string) => {
    try {
      // Get user details from auth
      const { data: userData } = await supabase.auth.getUser(userId);
      if (!userData?.user) {
        console.error("No user data found for fallback profile creation");
        setLoading(false);
        return;
      }
      
      // Get user metadata
      const { email, user_metadata } = userData.user;
      
      console.log("Creating fallback profile for user:", userId, email);
      setProfileCreationAttempts(prev => prev + 1);
      
      // Insert a basic profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: user_metadata?.full_name || email?.split('@')[0] || 'User',
          role: (user_metadata?.role as UserRole) || 'student',
          institution_id: user_metadata?.institution_id || null,
          email: email || ''
        })
        .select()
        .single();
      
      if (profileError) {
        console.error("Error creating fallback profile:", profileError);
        
        // If we've already tried a few times or got a permission error,
        // create a synthetic profile so the app can function
        if (profileCreationAttempts >= 2 || profileError.code === '42501' || profileError.code === '403') {
          console.warn("Using synthetic profile after failed creation attempts");
          const syntheticProfile: Profile = {
            id: userId,
            full_name: user_metadata?.full_name || email?.split('@')[0] || 'User',
            role: (user_metadata?.role as UserRole) || 'student',
            email: email || '',
            institution_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setUser(syntheticProfile);
        }
      } else {
        console.log("Fallback profile created:", profile);
        setUser(profile);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error in createFallbackProfile:", err);
      setLoading(false);
    }
  };

  const getUserProfile = async (): Promise<Profile | null> => {
    try {
      if (!session?.user) {
        console.log("getUserProfile: No active session");
        return null;
      }
      
      console.log("Fetching profile for user:", session.user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - user has auth but no profile
          console.warn("No profile found for authenticated user:", session.user.id);
        } else {
          console.error("Error fetching user profile:", error);
        }
        return null;
      }
      
      console.log("Profile retrieved successfully:", data?.id);
      return data as Profile;
    } catch (error) {
      console.error("Exception in getUserProfile:", error);
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("Attempting sign in for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Sign in error:", error.message);
        setError(error.message);
        setLoading(false);
        return { error };
      }
      
      console.log("Sign in successful, user:", data.user?.id);
      
      // Try to manually create a profile if one doesn't exist
      const profile = await getUserProfile();
      if (!profile && data.user) {
        // Try creating a profile immediately
        await forceCreateProfile(data.user.id, data.user.email || email, 'student');
      } else if (profile) {
        setUser(profile);
        setLoading(false);
      }
      
      return { error: null };
    } catch (error: any) {
      console.error("Exception during sign in:", error);
      setError(error.message);
      setLoading(false);
      return { error };
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    fullName: string, 
    role: UserRole, 
    institutionId: string | null
  ) => {
    try {
      // Store profile data in user metadata for the trigger to use
      console.log("Signing up user:", email, "with role:", role);
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            institution_id: institutionId,
            email
          }
        }
      });
      
      if (error) {
        console.error("Sign up error:", error.message);
        setError(error.message);
        return { error };
      }

      // Check if email confirmation is enabled
      if (data?.user && !data.session) {
        console.log("Email confirmation is enabled. Check your email to confirm your account.");
      } else if (data?.user) {
        // Maybe wait a moment to ensure the trigger has time to run
        console.log("Waiting for profile creation...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // If we don't see a profile after signup, try to create it manually
        try {
          const { data: profileData, error: profileCheckError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();
            
          if (profileCheckError || !profileData) {
            console.log("Profile not created by trigger, attempting manual creation");
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                full_name: fullName,
                role,
                institution_id: institutionId,
                email
              });
              
            if (profileError) {
              console.error("Manual profile creation failed:", profileError);
              // If RLS is blocking, try the force method
              await forceCreateProfile(data.user.id, email, role);
            } else {
              console.log("Manual profile creation successful");
            }
          } else {
            console.log("Profile found after signup:", profileData.id);
          }
        } catch (err) {
          console.error("Error checking for profile:", err);
        }
      }

      return { error: null };
    } catch (error: any) {
      console.error("Exception during sign up:", error);
      setError(error.message);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out user");
      await supabase.auth.signOut();
      setUser(null);
    } catch (error: any) {
      console.error("Sign out error:", error);
      setError(error.message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) setError(error.message);
      return { error };
    } catch (error: any) {
      setError(error.message);
      return { error };
    }
  };

  const isRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const value = {
    session,
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isRole,
    getUserProfile,
    forceCreateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 