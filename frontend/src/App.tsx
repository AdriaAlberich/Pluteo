import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';
import { useAppStore } from './context/appStore';
import { Auth } from './components/Auth';
import { UserMain } from './components/UserMain';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {

  // Get the authentication state
  const { isAuthenticated, setIsAuthenticated } = useAppStore();

  // Navigate hook for redirections
  const navigate = useNavigate();

  // Check if the user is authenticated and redirect to mylibrary (main component) if they are
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      setIsAuthenticated(true);
      navigate('/mylibrary');
    }
  }, [setIsAuthenticated, navigate]);

  return (
    <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/activate/:activationToken" element={<Auth />} />
        <Route path="/resetpassword/:resetPasswordToken" element={<Auth />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/mylibrary" element={<UserMain />} />
        </Route>
    </Routes>
  );
}
