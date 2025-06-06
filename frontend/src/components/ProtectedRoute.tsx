import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppStore } from '../context/appStore';

export function ProtectedRoute() {
  const { isAuthenticated } = useAppStore();
  const location = useLocation();

  // Check if user is authenticated and redirect to login if not
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}