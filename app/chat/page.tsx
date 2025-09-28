"use client"
import { Authenticated } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

function ChatContent() {
  const [selectedRoomId] = useState<string | null>(null);
  const rooms = useQuery(api.rooms.getMyRooms, {}) ?? [];
  const [messageContent, setMessageContent] = useState("");
  const messages = useQuery(
    api.messages.getMessages,
    selectedRoomId ? { roomId: selectedRoomId } : "skip"
  ) ?? [];
  const sendMessage = () => {
    if (!messageContent) return;
    api.messages.sendMessage({ content: messageContent, roomId: selectedRoomId });
    setMessageContent("");
  };

  return (
    <div className="text-black mt-20">
      <h2>Chat</h2>
      <div>
        <input
          type="text"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>{msg.content}</div>
        ))}
      </div>
      <div>Rooms: {rooms.length}</div>
      <div>Messages: {messages.length}</div>
    </div>
  );
}

export default function Page() {
  return (
    <Authenticated>
      <ChatContent />
    </Authenticated>
  );
}
