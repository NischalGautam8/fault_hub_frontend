"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id, Doc } from "../../convex/_generated/dataModel";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

interface PrivateChatProps {
  selectedRoomId: Id<"rooms"> | null;
  setSelectedRoomId: (id: Id<"rooms"> | null) => void;
  privateRooms: Doc<"rooms">[];
}

export function PrivateChat({ selectedRoomId, setSelectedRoomId, privateRooms }: PrivateChatProps) {
  const { username } = useAuth();
  const messages = useQuery(
    api.messages.getMessages,
    selectedRoomId && username ? { roomId: selectedRoomId, username, limit: 50 } : "skip"
  );
  const [messageContent, setMessageContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const sendMessageMutation = useMutation(api.messages.sendMessage);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  useEffect(() => {
    if (privateRooms.length > 0 && selectedRoomId === null) {
      setSelectedRoomId(privateRooms[0]._id);
    } else if (privateRooms.length === 0 && selectedRoomId !== null) {
      setSelectedRoomId(null);
    }
  }, [privateRooms, selectedRoomId, setSelectedRoomId]);

  // Auto-scroll to bottom when messages change (only if user is near bottom)
  useEffect(() => {
    if (messagesEndRef.current && shouldAutoScroll) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, shouldAutoScroll]);

  // Check if user is near bottom to decide whether to auto-scroll
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    }
  };

  const sendMessage = async () => {
    if (!messageContent.trim() || !selectedRoomId || !username || isSending) return;
    
    const messageToSend = messageContent.trim();
    setMessageContent("");
    setIsSending(true);

    try {
      await sendMessageMutation({ 
        content: messageToSend, 
        roomId: selectedRoomId, 
        username 
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      // Restore message content on error
      setMessageContent(messageToSend);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background min-h-0">
      {/* Messages display */}
      {selectedRoomId ? (
        <>
          {/* Message area header */}
          <div className="px-6 py-4 border-b border-border bg-card">
            <h4 className="text-lg font-semibold text-card-foreground">
              {(() => {
                const room = privateRooms.find(room => room._id === selectedRoomId);
                return (room as Doc<"rooms"> & { displayName?: string })?.displayName || room?.name || "Loading...";
              })()}
            </h4>
          </div>
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-4"
            onScroll={handleScroll}
          >
            {(() => {
              const messagesByDate = new Map();
              messages?.messages?.forEach(message => {
                const date = new Date(message.createdAt).toDateString();
                if (!messagesByDate.has(date)) {
                  messagesByDate.set(date, []);
                }
                messagesByDate.get(date).push(message);
              });

              return Array.from(messagesByDate.entries()).map(([date, dayMessages]) => (
                <div key={date}>
                  {/* Date separator */}
                  <div className="flex items-center justify-center my-4">
                    <div className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground font-medium">
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  
                  {/* Messages for this date */}
                  <div className="space-y-2">
                    {dayMessages.map((message: Doc<"messages">) => {
                      const messageTime = new Date(message.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      });

                      return (
                        <div key={message._id} className="hover:bg-muted/50 px-3 py-2 rounded group">
                          <div className="flex items-baseline space-x-2 mb-1">
                            <span className="text-sm font-semibold text-foreground">{message.senderId}</span>
                            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">{messageTime}</span>
                          </div>
                          <div className="text-sm text-foreground/80 break-words leading-relaxed">{message.content}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })() || []}
            <div ref={messagesEndRef} />
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="text-5xl mb-2">🔒</div>
            <p className="text-lg">Select a private room to start chatting</p>
          </div>
        </div>
      )}
      
      {/* Message input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="relative">
          <input
            type="text"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="w-full px-4 py-3 pr-12 bg-input border border-border rounded-full text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={!selectedRoomId || isSending}
          />
          <button 
            onClick={sendMessage} 
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-full hover:bg-opacity-80 disabled:bg-muted disabled:cursor-not-allowed transition-colors"
            disabled={!selectedRoomId || !messageContent.trim() || isSending}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
