import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole =
  | 'Super User'
  | 'CEO'
  | 'Director'
  | 'Managing Director'
  | 'Admin'
  | 'Staff'
  | 'IT Team'
  | 'Family and Friends'
  | 'CPDP Manager'
  | 'CPDP TCO'
  | 'CPDP Staff'
  | 'CPDP Patients'
  | 'CPDP Training'
  | 'CPDP Network'
  | 'Guest';

export type UserStatus = 'pending' | 'approved' | 'denied';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  teamTag?: string;
  status?: UserStatus;
  signupDate?: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; message?: string };
  signup: (email: string, password: string, name: string, role: UserRole) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  getPendingUsers: () => User[];
  approveUser: (userId: string) => void;
  denyUser: (userId: string) => void;
  updateUserRole: (role: UserRole) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Super user - pre-approved with special access
const SUPER_USER: User = {
  id: 'super-1',
  email: import.meta.env.VITE_SUPER_USER_EMAIL || 'superuser@raghava.ai',
  name: import.meta.env.VITE_SUPER_USER_NAME || 'Super Administrator',
  role: 'Super User',
  status: 'approved'
};

// Demo users seeded in localStorage - all pre-approved
const DEMO_USERS: User[] = [
  { id: '1', email: 'ceo@raghava.ai', name: 'Dr (Maj) Jai Prathap Reddy', role: 'CEO', status: 'approved', signupDate: new Date().toISOString(), lastLogin: new Date().toISOString() },
  { id: '16', email: 'md@raghava.ai', name: 'Managing Director', role: 'Managing Director', status: 'approved', signupDate: new Date().toISOString(), lastLogin: new Date().toISOString() },
  { id: '2', email: 'director1@raghava.ai', name: 'Sarah Williams', role: 'Director', teamTag: 'Clinical', status: 'approved', signupDate: new Date().toISOString() },
  { id: '3', email: 'director2@raghava.ai', name: 'Michael Chen', role: 'Director', teamTag: 'Operations', status: 'approved', signupDate: new Date().toISOString() },
  { id: '4', email: 'admin@raghava.ai', name: 'Jane Admin', role: 'Admin', status: 'approved', signupDate: new Date().toISOString() },
  { id: '5', email: 'staff1@raghava.ai', name: 'Alex Johnson', role: 'Staff', teamTag: 'Clinical', status: 'approved', signupDate: new Date().toISOString() },
  { id: '6', email: 'staff2@raghava.ai', name: 'Maria Garcia', role: 'Staff', teamTag: 'Operations', status: 'approved', signupDate: new Date().toISOString() },
  { id: '7', email: 'staff3@raghava.ai', name: 'David Lee', role: 'Staff', teamTag: 'Finance', status: 'approved', signupDate: new Date().toISOString() },
  { id: '8', email: 'it@raghava.ai', name: 'James Wilson', role: 'IT Team', status: 'approved', signupDate: new Date().toISOString() },
  { id: '9', email: 'family@raghava.ai', name: 'Emma Thompson', role: 'Family and Friends', status: 'approved', signupDate: new Date().toISOString() },
  { id: '10', email: 'cpdp.manager@raghava.ai', name: 'Robert Anderson', role: 'CPDP Manager', status: 'approved', signupDate: new Date().toISOString() },
  { id: '11', email: 'cpdp.tco@raghava.ai', name: 'Linda Martinez', role: 'CPDP TCO', status: 'approved', signupDate: new Date().toISOString() },
  { id: '12', email: 'cpdp.staff1@raghava.ai', name: 'John Smith', role: 'CPDP Staff', teamTag: 'CPDP', status: 'approved', signupDate: new Date().toISOString() },
  { id: '13', email: 'cpdp.patient1@raghava.ai', name: 'Mary Johnson', role: 'CPDP Patients', status: 'approved', signupDate: new Date().toISOString() },
  { id: '14', email: 'cpdp.training@raghava.ai', name: 'Susan Brown', role: 'CPDP Training', status: 'approved', signupDate: new Date().toISOString() },
  { id: '15', email: 'cpdp.network@raghava.ai', name: 'Thomas Davis', role: 'CPDP Network', status: 'approved', signupDate: new Date().toISOString() },
];

import { useUser, useClerk } from '@clerk/clerk-react';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const { signOut, openSignIn, openSignUp } = useClerk();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize demo users and super user
    const storedUsers = localStorage.getItem('raghava_users');
    if (!storedUsers) {
      const allUsers = [SUPER_USER, ...DEMO_USERS];
      localStorage.setItem('raghava_users', JSON.stringify(allUsers));
    } else {
      let users: User[] = JSON.parse(storedUsers);

      // Remove any existing super user (by ID or by old email) to ensure we have the latest config
      users = users.filter(u => u.id !== SUPER_USER.id && u.email !== 'superuser@raghava.ai');

      // Add the current configured super user to the top
      users.unshift(SUPER_USER);

      localStorage.setItem('raghava_users', JSON.stringify(users));
    }
  }, []);

  useEffect(() => {
    if (isClerkLoaded && isSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress;
      if (email) {
        const usersStr = localStorage.getItem('raghava_users');
        if (usersStr) {
          const users: User[] = JSON.parse(usersStr);
          const foundUser = users.find(u => u.email === email);

          if (foundUser) {
            // Update last login
            foundUser.lastLogin = new Date().toISOString();
            // Sync name from Clerk if needed
            if (clerkUser.fullName && foundUser.name !== clerkUser.fullName) {
              foundUser.name = clerkUser.fullName;
            }

            users[users.findIndex(u => u.id === foundUser.id)] = foundUser;
            localStorage.setItem('raghava_users', JSON.stringify(users));
            setUser(foundUser);
          } else {
            // Create new pending user with GUEST role
            const newUser: User = {
              id: clerkUser.id,
              email: email,
              name: clerkUser.fullName || 'New User',
              role: 'Guest', // Default role is now Guest
              status: 'pending',
              signupDate: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            };
            users.push(newUser);
            localStorage.setItem('raghava_users', JSON.stringify(users));
            setUser(newUser);
          }
        }
      }
    } else if (isClerkLoaded && !isSignedIn) {
      setUser(null);
    }
  }, [isClerkLoaded, isSignedIn, clerkUser]);

  const login = (email: string, password: string): { success: boolean; message?: string } => {
    // Redirect to Clerk Login
    openSignIn();
    return { success: true };
  };

  const signup = (email: string, password: string, name: string, role: UserRole): boolean => {
    // Redirect to Clerk Signup
    openSignUp();
    return true;
  };

  const getPendingUsers = (): User[] => {
    const usersStr = localStorage.getItem('raghava_users');
    if (!usersStr) return [];

    const users: User[] = JSON.parse(usersStr);
    return users.filter(u => u.status === 'pending');
  };

  const approveUser = (userId: string) => {
    const usersStr = localStorage.getItem('raghava_users');
    if (!usersStr) return;

    const users: User[] = JSON.parse(usersStr);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
      users[userIndex].status = 'approved';
      localStorage.setItem('raghava_users', JSON.stringify(users));
      // Force update if approving current user (unlikely but good for consistency)
      if (user && user.id === userId) {
        setUser({ ...user, status: 'approved' });
      }
    }
  };

  const denyUser = (userId: string) => {
    const usersStr = localStorage.getItem('raghava_users');
    if (!usersStr) return;

    const users: User[] = JSON.parse(usersStr);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
      users[userIndex].status = 'denied';
      localStorage.setItem('raghava_users', JSON.stringify(users));
    }
  };

  const updateUserRole = (role: UserRole) => {
    if (!user) return;

    const usersStr = localStorage.getItem('raghava_users');
    if (!usersStr) return;

    const users: User[] = JSON.parse(usersStr);
    const userIndex = users.findIndex(u => u.id === user.id);

    if (userIndex !== -1) {
      users[userIndex].role = role;
      localStorage.setItem('raghava_users', JSON.stringify(users));
      setUser({ ...user, role });
    }
  };

  const logout = () => {
    signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      isAuthenticated: !!user,
      getPendingUsers,
      approveUser,
      denyUser,
      updateUserRole,
      isLoading: !isClerkLoaded || (!!isSignedIn && user === null)
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
