import { LanguageSelector } from './LanguageSelector';
import { Notifications } from './Notifications';
import { UserMenu } from './UserMenu';
import { Library } from './Library';
import { useTranslation } from 'react-i18next';

export function UserMain() {

  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-screen">
      <header className="flex justify-between items-center p-4 bg-gray-900 text-white shadow-lg">
        <div>
          <h1 className="text-2xl font-bold">{t('library_name')}</h1>
          <p className="block text-sm text-white">{t('library_motto')}</p>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <Notifications />
          <UserMenu />
        </div>
      </header>
      <main className="flex-grow">
        <div className="h-full w-full">
          <Library />
        </div>
      </main>
    </div>
  );
}