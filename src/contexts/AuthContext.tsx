import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
          setUser({
            id: currentUser.id,
            email: currentUser.email!,
            name: currentUser.user_metadata?.name || '',
            avatar: currentUser.user_metadata?.avatar,
            createdAt: new Date(currentUser.created_at),
            updatedAt: new Date(currentUser.updated_at || currentUser.created_at),
          });
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      if (user) {
        setUser({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || '',
          avatar: user.user_metadata?.avatar,
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
    await authService.signIn(email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    await authService.signUp(email, password, name);
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