import { useState } from 'react';
import { UserCircle2, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from './UserProfile';

export function UserMenu() {

  // Hooks for the authentication system, translation and navigation
  const { logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State to control the dropdown and profile visibility
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Ref to manage the dropdown menu
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle the settings button click to show the profile modal
  const handleSettings = () => {
    setShowProfile(true);
    setIsOpen(false);
  };

  // Handle the logout button click to log out the user and redirect to home
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-400 hover:text-white transition-colors"
        >
          <UserCircle2 className="w-6 h-6" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
            <button
              onClick={handleSettings}
              className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              {t('usermenu_settings')}
            </button>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {t('usermenu_logout')}
            </button>
          </div>
        )}
      </div>
    {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
    </>
  );
}