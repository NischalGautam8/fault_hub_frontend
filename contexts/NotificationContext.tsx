"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationService, Notification } from '@/lib/notificationService';
import { getUnreadCount, getNotifications, markNotificationAsRead, markAllNotificationsAsRead, getCurrentUser } from '@/lib/api';
import { toast } from 'sonner';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await getNotifications(0, 20);
      setNotifications(response.content || []);
      await refreshUnreadCount();
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [refreshUnreadCount]);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      await refreshUnreadCount();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [refreshUnreadCount]);
  
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);
  
  useEffect(() => {
    // Get user ID from backend API
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('jwt');
    console.log('JWT token exists:', !!token);
    
    if (token) {
      // Fetch current user to get numeric user ID
      getCurrentUser()
        .then((user) => {
          console.log('Current user fetched:', user);
          if (user && user.id) {
            setUserId(user.id);
            console.log('User ID set for notifications:', user.id);
          } else {
            console.error('User ID not found in user response:', user);
          }
        })
        .catch((error) => {
          console.error('Failed to fetch current user:', error);
        });
    } else {
      console.log('No JWT token found - user not logged in');
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      console.log('NotificationContext: No userId, skipping socket connection');
      return;
    }

    console.log('NotificationContext: Attempting to connect with userId:', userId);

    // Connect to WebSocket
    const socket = notificationService.connect(userId);
    setIsConnected(true);

    console.log('NotificationContext: Socket connection initiated, waiting for connect event...');

    // Handle incoming notifications
    const handleNotification = (notification: Notification) => {
      console.log('New notification received:', notification);
      
      // Add to notifications list
      setNotifications(prev => [notification, ...prev]);
      
      // Update unread count
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      toast.info(notification.message, {
        description: `Fault: ${notification.faultTitle}`,
        duration: 5000,
      });
    };

    notificationService.onNotification(handleNotification);
    console.log('NotificationContext: Notification listener registered');

    // Fetch initial notifications
    fetchNotifications();

    return () => {
      console.log('NotificationContext: Cleaning up - disconnecting socket');
      notificationService.offNotification(handleNotification);
      notificationService.disconnect();
      setIsConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        isConnected,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        refreshUnreadCount
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
