import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useAppStore } from './context/appContext';
import { Auth } from './components/Auth';
import { UserMain } from './components/UserMain';

export default function App() {
  const { isAuthenticated } = useAppStore();

  return (
    <Router>
      <Routes>
          {!isAuthenticated ? (
            <>
              <Route path="/" element={<Auth />} />
              <Route path="/activate/:activationToken" element={<Auth />} />
              <Route path="/resetpassword/:resetPasswordToken" element={<Auth />} />
            </>
          ) : (
            <Route path="/*" element={<UserMain />} />
          )}
        </Routes>
    </Router>
  );
}
