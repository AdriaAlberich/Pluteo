import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';
import { useAppStore } from './context/appStore';
import { Auth } from './components/Auth';
import { UserMain } from './components/UserMain';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  const { isAuthenticated, setIsAuthenticated } = useAppStore();
  const navigate = useNavigate();

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
