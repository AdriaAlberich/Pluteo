import { useState } from 'react';
import { UserCircle2, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
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
            onClick={() => {
              setIsOpen(false);
            }}
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
  );
}