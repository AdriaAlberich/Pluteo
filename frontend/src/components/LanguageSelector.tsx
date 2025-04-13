import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    //TODO: Call the API to change the language on the backend
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-black-300"
      >
        <Globe className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
          <button
            onClick={() => {
              changeLanguage('ca');
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2"
          >
            {t('languageselector_catalan')}
          </button>

          <button
            onClick={() => {
              changeLanguage('en');
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-gray-400 hover:bg-gray-700 flex items-center gap-2"
          >
            {t('languageselector_english')}
          </button>
        </div>
      )}
    </div>
  );
}