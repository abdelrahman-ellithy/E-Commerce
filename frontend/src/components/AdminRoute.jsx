import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PageLoader from './PageLoader.jsx';

export default function AdminRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader label="Checking your session…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
