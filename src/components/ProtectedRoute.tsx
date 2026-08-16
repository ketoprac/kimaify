import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
