import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../hooks/useProfile';
import { useEffect, useRef } from 'react';

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { updateLanguage } = useProfile();
  const { t, i18n } = useTranslation();
  const menuRef = useRef<HTMLDivElement | null>(null);
  
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
            {t('languageselector_catalan')}
          </button>

          <button
            onClick={() => {
              changeLanguage('en');
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-right text-gray-400 hover:bg-gray-700 flex items-center gap-2"
          >
            {t('languageselector_english')}
          </button>
        </div>
      )}
    </div>
  );
}