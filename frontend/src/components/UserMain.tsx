import { LanguageSelector } from './LanguageSelector';
import { Notifications } from './Notifications';
import { UserMenu } from './UserMenu';
import { Library } from './Library';

export function UserMain() {

  return (
    <div className="flex flex-col h-screen">
      <header className="flex justify-end items-center p-4 bg-gray-900 text-white shadow-lg">
        <LanguageSelector />
        <Notifications />
        <UserMenu />
      </header>
      <main className="flex-grow">
        <div className="h-full w-full">
          <Library />
        </div>
      </main>
    </div>
  );
}