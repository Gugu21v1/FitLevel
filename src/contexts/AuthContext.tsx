import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/supabase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          // Fetch user profile from profiles table to get the correct type
          const profile = await authService.getProfile(currentUser.id);

          console.log('AuthContext - Fetched profile from DB:', profile);

          setUser({
            id: currentUser.id,
            email: currentUser.email!,
            name: profile?.name || currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'Usuário',
            type: profile?.type || 'aluno', // Use type from database
            status: profile?.status || 'ativo',
            avatar: currentUser.user_metadata?.avatar,
            gender: profile?.gender,
            birth_date: profile?.birth_date,
            number: profile?.number,
            address: profile?.address,
            academy_id: profile?.academy_id,
            photo_url: profile?.photo_url,
            notes: profile?.notes,
            createdAt: new Date(currentUser.created_at),
            updatedAt: new Date(currentUser.updated_at || currentUser.created_at),
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = authService.onAuthStateChange(async (user: any) => {
      if (user) {
        // Fetch user profile from profiles table to get the correct type
        const profile = await authService.getProfile(user.id);

        console.log('AuthContext onAuthStateChange - Fetched profile from DB:', profile);

        setUser({
          id: user.id,
          email: user.email!,
          name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
          type: profile?.type || 'aluno', // Use type from database
          status: profile?.status || 'ativo',
          avatar: user.user_metadata?.avatar,
          gender: profile?.gender,
          birth_date: profile?.birth_date,
          number: profile?.number,
          address: profile?.address,
          academy_id: profile?.academy_id,
          photo_url: profile?.photo_url,
          notes: profile?.notes,
          createdAt: new Date(user.created_at),
          updatedAt: new Date(user.updated_at || user.created_at),
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await authService.signIn(email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const result = await authService.signUp(email, password, name);
      return result;
    } catch (error) {
      console.error('SignUp error in AuthContext:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};