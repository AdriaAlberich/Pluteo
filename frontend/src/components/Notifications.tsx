import { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { formatDistanceToNow, set } from 'date-fns';
import { useAppStore } from '../context/appStore';
import { useNotifications } from '../hooks/useNotifications';
import { useTranslation } from 'react-i18next';

export function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { notifications, setNotifications } = useAppStore();
  const { markAsRead, deleteOne, clearAll, isLoading, isError, error } = useNotifications();
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (notifications) {
      const unread = notifications.filter((notification: { markedAsRead: any; }) => !notification.markedAsRead);
      setUnreadCount(unread.length);
    }
  }, [notifications, setNotifications]);

  const handleNotificationClick = (notificationId: string) => {
    const notification = notifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.markedAsRead = true;
    }
    markAsRead(notificationId);
  };

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

  const handleClearAll = () => {
    setIsOpen(false);
    setUnreadCount(0);
    setNotifications([]);
    clearAll;
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t('notifications_title')}</h3>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-gray-400 hover:text-white"
              >
                {t('notifications_clear_all')}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                {t('notifications_no_notifications')}
              </div>
            ) : (
                notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${
                    !notification.markedAsRead ? 'bg-gray-700/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2 bg-blue-500"/>
                    <div className="flex-1">
                      <p className="text-sm">{notification.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(notification.timestamp, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}