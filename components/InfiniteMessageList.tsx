"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  _id: string;
  senderId: string;
  content: string;
  createdAt: number;
  _creationTime: number;
}

interface InfiniteMessageListProps {
  roomId: Id<"rooms">;
}

export function InfiniteMessageList({ roomId }: InfiniteMessageListProps) {
  const { username } = useAuth();
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  // Get initial messages
  const messagesData = useQuery(
    api.messages.getMessages,
    roomId && username ? { roomId, username, limit: 50, cursor: cursor || undefined } : "skip"
  );

  // Update messages when new data comes in
  useEffect(() => {
    if (messagesData) {
      if (cursor === null) {
        // Initial load
        setAllMessages(messagesData.messages);
        setHasMore(messagesData.hasMore);
        setShouldScrollToBottom(true);
      } else {
        // Loading more messages
        setAllMessages(prev => [...messagesData.messages, ...prev]);
        setHasMore(messagesData.hasMore);
        setIsLoadingMore(false);
      }
    }
  }, [messagesData, cursor]);

  // Scroll to bottom on initial load or new messages
  useEffect(() => {
    if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setShouldScrollToBottom(false);
    }
  }, [allMessages, shouldScrollToBottom]);

  // Load more messages when scrolling to top
  const loadMoreMessages = useCallback(() => {
    if (!hasMore || isLoadingMore || !messagesData?.nextCursor) return;
    
    setIsLoadingMore(true);
    setCursor(messagesData.nextCursor);
  }, [hasMore, isLoadingMore, messagesData?.nextCursor]);

  // Handle scroll event
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Load more when scrolled near the top
    if (container.scrollTop < 100 && hasMore && !isLoadingMore) {
      loadMoreMessages();
    }
  }, [loadMoreMessages, hasMore, isLoadingMore]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Reset when room changes
  useEffect(() => {
    setAllMessages([]);
    setCursor(null);
    setHasMore(true);
    setIsLoadingMore(false);
    setShouldScrollToBottom(true);
  }, [roomId]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  let lastDate = '';

  return (
    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto px-4 py-2 space-y-2"
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      {isLoadingMore && (
        <div className="text-center py-2 text-gray-500">
          Loading more messages...
        </div>
      )}

      {allMessages.map((message, index) => {
        const messageDate = formatDate(message.createdAt);
        const showDateSeparator = messageDate !== lastDate;
        lastDate = messageDate;

        return (
          <div key={message._id}>
            {showDateSeparator && (
              <div className="flex items-center justify-center my-4">
                <div className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                  {messageDate}
                </div>
              </div>
            )}
            
            <div className={`flex ${message.senderId === username ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderId === username 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}>
                {message.senderId !== username && (
                  <div className="text-xs font-semibold mb-1">{message.senderId}</div>
                )}
                <div className="break-words">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.senderId === username ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.createdAt)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      <div ref={messagesEndRef} />
    </div>
  );
}