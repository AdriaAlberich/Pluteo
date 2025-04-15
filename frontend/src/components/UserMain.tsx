import { LanguageSelector } from './LanguageSelector';
import { Notifications } from './Notifications';
import { UserMenu } from './UserMenu';

export function UserMain() {

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Notifications />
            <UserMenu />
          </div>
        </div>
    </div>
  );
}