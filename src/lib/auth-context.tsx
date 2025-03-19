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
  forceCreateProfile: (userId: string, email: string, role: UserRole) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize the auth state
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.id ? "User logged in" : "No session");
      setSession(session);
      if (session?.user) {
        // Always fetch the profile from the database first
        getUserProfile().then(profile => {
          console.log("Initial profile fetch:", profile ? `Profile found with role ${profile.role}` : "No profile found");
          if (profile) {
            setUser(profile);
          }
          setLoading(false);
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
        // Always get fresh profile data on auth state changes
        const profile = await getUserProfile();
        console.log("Profile after auth change:", profile ? `Profile found with role ${profile.role}` : "No profile found");
        
        if (profile) {
          setUser(profile);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getUserProfile = async (): Promise<Profile | null> => {
    try {
      if (!session?.user) {
        console.log("getUserProfile: No active session");
        return null;
      }
      
      console.log("Fetching profile for user:", session.user.id);
      
      // Use RPC call for better performance
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
      
      if (data) {
        console.log("Profile retrieved successfully:", data.id, "with role:", data.role);
        return data as Profile;
      }
      
      return null;
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
      
      // Always fetch fresh profile data from database
      const profile = await getUserProfile();
      if (profile) {
        console.log("Found existing profile with role:", profile.role);
        setUser(profile);
      }
      
      setLoading(false);
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

  // Force creation of a profile - use this only during signup
  const forceCreateProfile = async (userId: string, email: string, role: UserRole = 'student') => {
    try {
      console.log("Force creating profile for user:", userId);
      
      // First check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (existingProfile) {
        console.log("Profile already exists:", existingProfile);
        setUser(existingProfile);
        return;
      }
      
      // Create a new profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: email?.split('@')[0] || 'User',
          role: role,
          email: email,
          institution_id: null
        })
        .select()
        .single();
      
      if (profileError) {
        console.error("Error force creating profile:", profileError);
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