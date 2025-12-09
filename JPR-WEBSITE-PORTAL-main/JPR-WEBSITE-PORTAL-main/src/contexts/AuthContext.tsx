import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

// Define roles strictly as per requirement
export type UserRole =
  | 'Super User' | 'CEO' | 'Director' | 'Admin' | 'Staff'
  | 'IT Team' | 'Family and Friends'
  | 'CPDP Manager' | 'CPDP TCO' | 'CPDP Staff'
  | 'CPDP Patients' | 'CPDP Training' | 'CPDP Network'
  | 'Guest' | 'Managing Director' | 'Manager' | 'Consultant' | 'Partner';

export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  teamTag?: string;
  status: UserStatus;
  signupDate: string;
  lastLogin?: string;
}

interface AuthContextType {
  loading: boolean;
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;

  // Legacy aliases for backward compatibility with existing components
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  getPendingUsers: () => Promise<User[]>;
  getAllUsers: () => Promise<User[]>;
  approveUser: (userId: string) => Promise<void>;
  denyUser: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Watch session
  useEffect(() => {
    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };
    initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        setLoading(false);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  // Load profile when session changes
  useEffect(() => {
    const loadProfile = async () => {
      if (!session) {
        setUser(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // Handle case where profile might be missing (create default)
        if (error && error.code === 'PGRST116') {
          console.warn('Profile missing for user, attempting creation...');
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name ?? session.user.email,
              email: session.user.email,
              role: 'Staff', // Default safe role
              status: 'pending'
            })
            .select('*')
            .single();

          if (!insertError && newProfile) {
            mapProfileToUser(newProfile);
          }
        } else if (data) {
          mapProfileToUser(data);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };

    loadProfile();
  }, [session]);

  const mapProfileToUser = (profileData: any) => {
    setUser({
      id: profileData.id,
      email: profileData.email || session?.user.email || '',
      name: profileData.full_name || profileData.name || 'User',
      role: (profileData.role as UserRole) || 'Guest',
      teamTag: profileData.team_tag,
      status: (profileData.status as UserStatus) || 'pending',
      signupDate: profileData.created_at || new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName?: string, role: string = 'Staff') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, name: fullName, role }, // Role hint for trigger
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  // --- Legacy Adapters ---

  const login = async (e: string, p: string) => {
    try {
      await signIn(e, p);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const logout = signOut;

  const getPendingUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('status', 'pending');
    return (data || []).map((p: any) => ({
      id: p.id,
      email: p.email,
      name: p.full_name || p.name,
      role: p.role,
      status: p.status,
      signupDate: p.created_at,
      lastLogin: p.last_login
    } as User));
  };

  const getAllUsers = async () => {
    const { data } = await supabase.from('profiles').select('*');
    return (data || []).map((p: any) => ({
      id: p.id,
      email: p.email,
      name: p.full_name || p.name,
      role: p.role,
      status: p.status,
      signupDate: p.created_at,
      lastLogin: p.last_login
    } as User));
  };

  const approveUser = async (id: string) => {
    const { error } = await supabase.from('profiles').update({ status: 'approved' }).eq('id', id);
    if (error) throw error;
  };

  const denyUser = async (id: string) => {
    const { error } = await supabase.from('profiles').update({ status: 'rejected' }).eq('id', id);
    if (error) throw error;
  };

  const updateUserRole = async (id: string, role: string) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      loading,
      session,
      user,
      isAuthenticated: !!session,
      signIn,
      signUp,
      signOut,
      login,
      logout,
      getPendingUsers,
      getAllUsers,
      approveUser,
      denyUser,
      updateUserRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
