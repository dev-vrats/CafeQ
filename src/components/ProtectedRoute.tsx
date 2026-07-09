import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode, requireOwner?: boolean }> = ({ children, requireOwner = false }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-cream">
        <Loader2 className="w-8 h-8 animate-spin text-maroon" />
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/" replace />;
  }

  if (requireOwner && profile.role !== 'owner') {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};
