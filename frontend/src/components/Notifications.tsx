import { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ca, es } from 'date-fns/locale';
import { useAppStore } from '../context/appStore';
import { useNotifications } from '../hooks/useNotifications';
import { useTranslation } from 'react-i18next';


export function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, setNotifications, notificationsUnreadCount, setNotificationsUnreadCount } = useAppStore();
  const { markAsRead, clearAll, getNotificationsRefetch } = useNotifications();
  const { t, i18n } = useTranslation();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (notifications) {
      const unread = notifications.filter((notification: { markedAsRead: any; }) => !notification.markedAsRead);
      setNotificationsUnreadCount(unread.length);
    }
  }, [notifications, setNotifications]);

  const handleNotificationClick = (notificationId: string) => {
    const notification = notifications.find((n) => n.notificationId === notificationId);
    if (notification) {
      notification.markedAsRead = true;
    }
    markAsRead(
      notificationId,
      {
        onSuccess: () => {
          getNotificationsRefetch();
        },
      });
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
    clearAll();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Bell className="w-6 h-6" />
        {notificationsUnreadCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notificationsUnreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t('notifications_title')}</h3>
            {notifications.length > 0 && (
              <button
                onClick={ handleClearAll }
                className="text-sm text-gray-400 hover:text-white"
              >
                {t('notifications_clear_all')}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                {t('notifications_no_notifications')}
              </div>
            ) : (
                notifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  onClick={() => handleNotificationClick(notification.notificationId)}
                  className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${!notification.markedAsRead ? 'bg-gray-700' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${!notification.markedAsRead ? 'bg-blue-500' : 'bg-grey-700'}`}/>
                    <div className="flex-1">
                      <p className="text-sm">{notification.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(notification.timestamp, {
                          addSuffix: true,
                          locale: i18n.language === 'ca' ? ca : i18n.language === 'es' ? es : undefined
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