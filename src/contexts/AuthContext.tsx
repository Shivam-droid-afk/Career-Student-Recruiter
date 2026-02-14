import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  role: 'student' | 'recruiter';
  full_name: string;
  avatar_url?: string;
  university?: string;
  company?: string;
  github_url?: string;
  linkedin_url?: string;
  leetcode_url?: string;
  gfg_url?: string;
  bio?: string;
  total_credits: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithPhone: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

interface SignupData {
  email?: string;
  phone?: string;
  password: string;
  full_name: string;
  role: 'student' | 'recruiter';
  university?: string;
  company?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('bridgeup_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password)
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid email or password' };
      }

      const userData: User = {
        id: data.id,
        email: data.email,
        phone: data.phone,
        role: data.role,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        university: data.university,
        company: data.company,
        github_url: data.github_url,
        linkedin_url: data.linkedin_url,
        leetcode_url: data.leetcode_url,
        gfg_url: data.gfg_url,
        bio: data.bio,
        total_credits: data.total_credits || 0
      };

      setUser(userData);
      localStorage.setItem('bridgeup_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const loginWithPhone = async (phone: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .eq('password_hash', password)
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid phone number or password' };
      }

      const userData: User = {
        id: data.id,
        email: data.email,
        phone: data.phone,
        role: data.role,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        university: data.university,
        company: data.company,
        github_url: data.github_url,
        linkedin_url: data.linkedin_url,
        leetcode_url: data.leetcode_url,
        gfg_url: data.gfg_url,
        bio: data.bio,
        total_credits: data.total_credits || 0
      };

      setUser(userData);
      localStorage.setItem('bridgeup_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const insertData: any = {
        email: data.email,
        phone: data.phone,
        password_hash: data.password,
        full_name: data.full_name,
        role: data.role,
        university: data.university,
        company: data.company,
        total_credits: 0
      };

      const { data: newUser, error } = await supabase
        .from('users')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        if (error.message.includes('duplicate')) {
          return { success: false, error: 'Account already exists with this email or phone' };
        }
        return { success: false, error: 'Signup failed. Please try again.' };
      }

      const userData: User = {
        id: newUser.id,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        full_name: newUser.full_name,
        avatar_url: newUser.avatar_url,
        university: newUser.university,
        company: newUser.company,
        total_credits: 0
      };

      setUser(userData);
      localStorage.setItem('bridgeup_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bridgeup_user');
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;

    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('id', user.id);

    if (!error) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('bridgeup_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithPhone,
        signup,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
