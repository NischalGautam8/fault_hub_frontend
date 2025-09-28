"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id, Doc } from "../../convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { InfiniteMessageList } from "@/components/InfiniteMessageList";

interface PrivateChatProps {
  selectedRoomId: Id<"rooms"> | null;
  setSelectedRoomId: (id: Id<"rooms"> | null) => void;
  privateRooms: Doc<"rooms">[];
}

export function PrivateChat({ selectedRoomId, setSelectedRoomId, privateRooms }: PrivateChatProps) {
  const { username } = useAuth();
  const [messageContent, setMessageContent] = useState("");
  const sendMessageMutation = useMutation(api.messages.sendMessage);

  useEffect(() => {
    if (privateRooms.length > 0 && selectedRoomId === null) {
      setSelectedRoomId(privateRooms[0]._id);
    } else if (privateRooms.length === 0 && selectedRoomId !== null) {
      setSelectedRoomId(null);
    }
  }, [privateRooms, selectedRoomId, setSelectedRoomId]);

  const sendMessage = async () => {
    if (!messageContent.trim() || !selectedRoomId || !username) return;
    await sendMessageMutation({ content: messageContent, roomId: selectedRoomId, username });
    setMessageContent("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Current Room Name */}
      <h3 className="text-xl font-semibold mb-2">
        {selectedRoomId ? 
          (() => {
            const room = privateRooms.find(room => room._id === selectedRoomId);
            return (room as any)?.displayName || room?.name || "Select a private room";
          })()
          : "Select a private room"
        }
      </h3>

      {/* Messages display with infinite scroll */}
      <div className="flex-1 border rounded bg-gray-50 flex flex-col mb-4">
        {selectedRoomId ? (
          <InfiniteMessageList roomId={selectedRoomId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Please select a private room to view messages
          </div>
        )}
      </div>
      
      {/* Message input */}
      <div className="flex mb-4">
        <input
          type="text"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Say Something..."
          className="flex-1 p-2 border rounded-l text-black"
          disabled={!selectedRoomId}
        />
        <button 
          onClick={sendMessage} 
          className="bg-blue-500 text-white p-2 rounded-r"
          disabled={!selectedRoomId || !messageContent.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
