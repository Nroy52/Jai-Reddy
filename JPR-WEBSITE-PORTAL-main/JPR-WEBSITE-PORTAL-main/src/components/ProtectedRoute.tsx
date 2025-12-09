import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth(); // Changed isLoading to loading

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect pending users to the pending page
  if (user?.status === 'pending' && user?.role !== 'Guest') {
    // Check if we are already on pending page to avoid loop
    if (window.location.pathname !== '/pending') {
      return <Navigate to="/pending" replace />;
    }
  }

  // Redirect Guest users to onboarding
  if (user?.role === 'Guest') {
    if (window.location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />;
    }
  }

  // Check roles (Super User always passes)
  if (allowedRoles && user && user.role !== 'Super User' && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
        <p className="text-sm code bg-muted p-1 rounded">Required: {allowedRoles.join(', ')}</p>
      </div>
    );
  }

  return <>{children}</>;
};
