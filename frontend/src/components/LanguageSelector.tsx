import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../hooks/useProfile';
import { useEffect, useRef } from 'react';

export function LanguageSelector() {

  // Hook for updating the language
  const { updateLanguage } = useProfile();

  // Hooks for the translation system
  const { t, i18n } = useTranslation();

  // State to control the dropdown
  const [isOpen, setIsOpen] = useState(false);
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

  // Handle change language click
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    updateLanguage({ locale: lang });
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Globe className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
          <button
            onClick={() => {
              changeLanguage('ca');
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-right text-gray-300 hover:bg-gray-700 flex items-center gap-2"
          >
            Català
          </button>

          <button
            onClick={() => {
              changeLanguage('es');
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-right text-gray-400 hover:bg-gray-700 flex items-center gap-2"
          >
            Castellano
          </button>

          <button
            onClick={() => {
              changeLanguage('en');
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-right text-gray-400 hover:bg-gray-700 flex items-center gap-2"
          >
            English
          </button>
        </div>
      )}
    </div>
  );
}