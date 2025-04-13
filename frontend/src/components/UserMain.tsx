import { LanguageSelector } from './LanguageSelector';
import { UserMenu } from './UserMenu';

export function UserMain() {

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <div className="absolute top-4 left-4">
        <LanguageSelector />
      </div>
      <div className="absolute top-4 right-4">
        <UserMenu />
      </div>
    </div>
  );
}