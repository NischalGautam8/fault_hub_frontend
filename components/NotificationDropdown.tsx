"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from './ui/button';
import { formatDistanceToNow } from '@/lib/utils';
import { Notification } from '@/lib/notificationService';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, fetchNotifications, markAllAsRead } = useNotifications();
  const displayedUnread = unreadCount;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        await fetchNotifications();
        await markAllAsRead();
      } catch (error) {
        console.error('Failed to fetch/mark-all-read on open:', error);
      }
    })();
  }, [isOpen, fetchNotifications, markAllAsRead]);

  const handleNotificationClick = async (notificationId: number, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(notificationId);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="modern-button relative"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <Bell className="h-5 w-5" />
        {displayedUnread > 0 && (
          <span className="absolute -top-1 -right-1 z-[60] bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {displayedUnread > 9 ? '9+' : displayedUnread}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-[600px] overflow-hidden rounded-lg shadow-2xl bg-white/95 dark:bg-slate-900 border border-white/20 z-50">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Notifications</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="overflow-y-auto max-h-[500px]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 ${
                      !notification.read ? 'bg-blue-500/10' : 'bg-transparent'
                    }`}
                    onClick={() => handleNotificationClick(notification.id, notification.read)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                        !notification.read ? 'bg-blue-500' : 'bg-transparent'
                      }`} />
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mb-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">
                          Fault: {notification.faultTitle}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Mark read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-white/10 text-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
