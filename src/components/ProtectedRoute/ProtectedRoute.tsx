import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserType } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: UserType | UserType[];
  fallback?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredUserType,
  fallback = '/',
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredUserType) {
    const allowedTypes = Array.isArray(requiredUserType) ? requiredUserType : [requiredUserType];
    
    if (!allowedTypes.includes(user.type)) {
      return <Navigate to={fallback} />;
    }
  }

  return <>{children}</>;
};