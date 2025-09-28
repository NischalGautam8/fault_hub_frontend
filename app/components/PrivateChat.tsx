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
    <div className="flex-1 flex flex-col">
      {/* Messages display */}
      <div className="border rounded-lg bg-white flex flex-col mb-4 shadow-sm" style={{ height: '80vh' }}>
        {selectedRoomId ? (
          <>
            {/* Message area header */}
            <div className="px-4 py-3 border-b bg-gray-50 rounded-t-lg">
              <h4 className="text-sm font-medium text-gray-700">
                {(() => {
                  const room = privateRooms.find(room => room._id === selectedRoomId);
                  return (room as any)?.displayName || room?.name || "Loading...";
                })()}
              </h4>
            </div>
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-4 py-2"
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
                    <div className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 font-medium">
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  
                  {/* Messages for this date */}
                  <div className="space-y-2">
                    {dayMessages.map((message: any) => {
                      const messageTime = new Date(message.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      });

                      return (
                        <div key={message._id} className="hover:bg-gray-50 px-3 py-2 rounded group">
                          <div className="flex items-baseline space-x-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900">{message.senderId}</span>
                            <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{messageTime}</span>
                          </div>
                          <div className="text-sm text-gray-800 break-words leading-relaxed">{message.content}</div>
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
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">🔒</div>
              <div>Please select a private room to view messages</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Message input */}
      <div className="flex items-center space-x-2 p-4 border-t bg-gray-50">
        <input
          type="text"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Say Something..."
          className="flex-1 px-4 py-2 border rounded-full text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={!selectedRoomId || isSending}
        />
        <button 
          onClick={sendMessage} 
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          disabled={!selectedRoomId || !messageContent.trim() || isSending}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
