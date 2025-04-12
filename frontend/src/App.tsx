import { BrowserRouter as Router } from 'react-router-dom';
import { useAppStore } from './context/AppContext';
import { Auth } from './components/Auth';
import { UserMain } from './components/UserMain';

export default function App() {
  const { isAuthenticated } = useAppStore();

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <div className="bg-custom-bg bg-cover bg-center min-h-screen">
      <Router>
        <UserMain />
      </Router>
    </div>
  );
}
