import { io, Socket } from 'socket.io-client';

const WS_URL = 'http://localhost:9093';

export interface Notification {
  id: number;
  message: string;
  type: 'FAULT_LIKED' | 'FAULT_DISLIKED';
  faultId: number;
  faultTitle: string;
  actionBy: string;
  read: boolean;
  createdAt: string;
}

class NotificationService {
  private socket: Socket | null = null;
  private userId: number | null = null;
  private listeners: Map<(notification: Notification) => void, (...args: unknown[]) => void> = new Map();

  connect(userId: number): Socket {
    if (this.socket?.connected && this.userId === userId) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.userId = userId;
    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to notification service', this.socket?.id);
      // Join user-specific room so server can route notifications to this client
      if (this.socket && this.userId != null) {
        this.socket.emit('join-room', String(this.userId));
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from notification service');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      // Notify server we're leaving the user's room, then disconnect
      if (this.userId != null) {
        this.socket.emit('leave-room', String(this.userId));
      }
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.listeners.clear();
    }
  }

  onNotification(callback: (notification: Notification) => void) {
    if (!this.socket) return;

    // Listen for generic 'notification' events from server
    const eventName = 'notification';

    // Wrap the callback so we can safely parse incoming payloads.
    const wrapper = (...args: unknown[]) => {
      try {
        const raw = args[0];
        const payload = typeof raw === 'string' ? JSON.parse(raw as string) : raw;
        callback(payload as Notification);
      } catch (err) {
        console.error('Failed to parse notification payload:', err);
      }
    };

    // Save wrapper so offNotification can remove it later.
    this.listeners.set(callback, wrapper);
    this.socket.on(eventName, wrapper);
  }

  offNotification(callback: (notification: Notification) => void) {
    if (!this.socket) return;

    const eventName = 'notification';
    const wrapper = this.listeners.get(callback);
    if (wrapper) {
      this.socket.off(eventName, wrapper);
      this.listeners.delete(callback);
    } else {
      // Fallback: try removing the original callback by casting to the wrapper signature
      this.socket.off(eventName, callback as unknown as (...args: unknown[]) => void);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const notificationService = new NotificationService();
