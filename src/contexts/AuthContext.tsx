// src/contexts/AuthContext.ts
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, dbHelpers, hasValidConfig } from '../lib/supabase';
import { User as SupabaseAuthUser } from '@supabase/supabase-js'; 

interface AuthContextType {
  user: SupabaseAuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithSSO: (provider: 'google' | 'microsoft') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<{ name?: string; avatar_url?: string; department?: string; }>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!hasValidConfig) {
        console.log('Demo mode: Creating demo user');
        const demoUser: SupabaseAuthUser = {
          id: 'demo-user',
          aud: 'authenticated',
          role: 'authenticated',
          email: 'admin@demo.com',
          email_confirmed_at: '2025-06-30T22:31:44.843Z',
          last_sign_in_at: '2025-07-13T04:04:42.756Z',
          // CRITICAL FIX: Removed 'phone: null' as it's not a top-level property of SupabaseAuthUser
          created_at: '2025-06-30T22:31:27.385Z',
          updated_at: '2025-07-13T04:04:42.760Z',
          app_metadata: { provider: 'email', providers: ['email'] },
          user_metadata: { name: 'Demo Admin', email: 'admin@demo.com', department: 'Administration' }
        };
        setUser(demoUser);
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        }
        setLoading(false);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth State Change:", event, session?.user?.id);
          if (session?.user) {
            setUser(session.user);
          } else {
            setUser(null);
          }
          setLoading(false);
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!hasValidConfig) {
      throw new Error('Database not configured. This is a demo version.');
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) throw error;
  };

  const signInWithSSO = async (provider: 'google' | 'microsoft') => {
    if (!hasValidConfig) {
      throw new Error('Database not configured. This is a demo version.');
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider === 'microsoft' ? 'azure' : provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!hasValidConfig) {
      setUser(null);
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<{ name?: string; avatar_url?: string; department?: string; }>) => {
    // CRITICAL FIX: Handle demo mode update first
    if (!hasValidConfig && user && user.id === 'demo-user') {
      setUser(prevUser => {
          if (prevUser) {
              return {
                  ...prevUser,
                  user_metadata: { ...prevUser.user_metadata, ...updates }
              };
          }
          return prevUser;
      });
      return; // Exit function after handling demo update
    }

    // If no user (and not a demo user being updated)
    if (!user) {
      return; 
    }

    // If hasValidConfig is true (real Supabase) AND user is not demo
    const { error } = await supabase.auth.updateUser({
      data: updates
    });
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    signIn,
    signInWithSSO,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };