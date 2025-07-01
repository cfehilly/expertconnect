import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, dbHelpers, hasValidConfig } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithSSO: (provider: 'google' | 'microsoft') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // If Supabase is not configured, create a demo user immediately
      if (!hasValidConfig) {
        console.log('Demo mode: Creating demo user');
        const demoUser: User = {
          id: 'demo-user',
          name: 'Demo Admin',
          email: 'admin@demo.com',
          avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400',
          role: 'admin',
          department: 'Administration',
          expertise: ['Platform Management', 'User Support'],
          status: 'available',
          rating: 5.0,
          completedHelps: 25
        };
        setUser(demoUser);
        setLoading(false);
        return;
      }

      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else {
            setUser(null);
            setLoading(false);
          }
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const profile = await dbHelpers.getUserProfile(userId);
      setUser(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // If profile doesn't exist, user might need to complete setup
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!hasValidConfig) {
      throw new Error('Database not configured. This is a demo version.');
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signInWithSSO = async (provider: 'google' | 'microsoft') => {
    if (!hasValidConfig) {
      throw new Error('Database not configured. This is a demo version.');
    }
    
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
      // For demo, just clear the user
      setUser(null);
      return;
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    if (!hasValidConfig) {
      // For demo, just update local state
      setUser({ ...user, ...updates });
      return;
    }

    const updatedUser = await dbHelpers.updateUserProfile(user.id, updates);
    setUser(updatedUser);
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

export { AuthContext }