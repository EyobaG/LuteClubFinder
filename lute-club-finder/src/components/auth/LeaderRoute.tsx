import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface LeaderRouteProps {
  children: React.ReactNode;
}

export default function LeaderRoute({ children }: LeaderRouteProps) {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Allow admins and club leaders
  const isAdmin = userData?.role === 'admin';
  const isLeader = userData?.role === 'club_leader';

  if (!isAdmin && !isLeader) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-5xl block mb-4">🔒</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500">
            You need to be a club leader to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
